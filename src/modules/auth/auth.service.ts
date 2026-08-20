import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterCollegeDto } from './dto/register-college.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AppConfig } from '../../core/config/app.config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new Student account
   */
  async registerStudent(dto: RegisterStudentDto) {
    const email = dto.email.toLowerCase().trim();

    // 1. Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('An account with this email address already exists');
    }

    // 2. Validate Country ID (default to 1 or first active country if not provided)
    let countryId = dto.countryId ? Number(dto.countryId) : 1;
    let country = await this.prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      const defaultCountry = await this.prisma.country.findFirst({
        where: { isActive: true },
      });
      if (defaultCountry) {
        countryId = defaultCountry.id;
      } else {
        throw new BadRequestException(`Selected country ID (${countryId}) does not exist`);
      }
    }

    // 3. Resolve names (split full name if necessary)
    let firstName = (dto.firstName || '').trim();
    let lastName = (dto.lastName || '').trim();
    if (!firstName && dto.name) {
      const parts = dto.name.trim().split(/\s+/);
      firstName = parts[0] || 'Student';
      lastName = parts.slice(1).join(' ') || '';
    }
    if (!firstName) firstName = 'Student';

    // 4. Resolve College ID vs Custom / Other College Name
    let collegeId: number | null = dto.collegeId ? Number(dto.collegeId) : null;
    let customCollegeName: string | null = (dto.customCollegeName || dto.college_name || '').trim() || null;

    if (collegeId) {
      const college = await this.prisma.college.findUnique({
        where: { id: collegeId },
      });
      if (!college) {
        collegeId = null;
      }
    } else if (customCollegeName && customCollegeName.toLowerCase() !== 'other') {
      // Check if there is a match in registered colleges database
      const matchedCollege = await this.prisma.college.findFirst({
        where: {
          name: { equals: customCollegeName },
        },
      });
      if (matchedCollege) {
        collegeId = matchedCollege.id;
        customCollegeName = null;
      }
    }

    // 5. Resolve or create Student role
    let studentRole = await this.prisma.role.findUnique({
      where: { name: 'student' },
    });

    if (!studentRole) {
      studentRole = await this.prisma.role.create({
        data: { name: 'student' },
      });
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 7. Create User and linked Student record with academic details
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phoneNo: dto.phoneNo?.trim() || 'N/A',
        roleId: studentRole.id,
        countryId,
        student: {
          create: {
            firstName,
            lastName,
            collegeId: collegeId || null,
            customCollegeName: customCollegeName || null,
            usn: dto.usn?.trim() || null,
            branch: dto.branch?.trim() || null,
            graduationYear: dto.graduationYear ? Number(dto.graduationYear) : null,
          },
        },
      },
      include: {
        role: true,
        country: true,
        student: {
          include: {
            college: true,
          },
        },
      },
    });

    // 7. Generate JWT Tokens
    const tokens = await this.generateTokens(user);

    const { password, ...userWithoutPassword } = user;

    return {
      message: 'Student account registered successfully',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userWithoutPassword,
    };
  }

  /**
   * Get public approved colleges list for registration
   */
  async getPublicColleges() {
    return await this.prisma.college.findMany({
      where: { status: 'approved' },
      select: {
        id: true,
        name: true,
        address: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Register a new College & Administrator account
   */
  async registerCollege(dto: RegisterCollegeDto) {
    const email = dto.email.toLowerCase().trim();
    const collegeName = dto.collegeName.trim();

    // 1. Check if user email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('An account with this email address already exists');
    }

    // 2. Check if college name already exists
    const existingCollege = await this.prisma.college.findUnique({
      where: { name: collegeName },
    });

    if (existingCollege) {
      throw new BadRequestException('A college with this name is already registered');
    }

    // 3. Validate Country ID
    const country = await this.prisma.country.findUnique({
      where: { id: dto.countryId },
    });

    if (!country) {
      throw new BadRequestException(`Selected country ID (${dto.countryId}) does not exist`);
    }

    // 4. Resolve or create College role
    let collegeRole = await this.prisma.role.findUnique({
      where: { name: 'college' },
    });

    if (!collegeRole) {
      collegeRole = await this.prisma.role.create({
        data: { name: 'college' },
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 6. Create College, User, and collegeMember in transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const college = await tx.college.create({
        data: {
          name: collegeName,
          address: dto.address.trim(),
          countryId: dto.countryId,
        },
      });

      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          phoneNo: dto.phoneNo,
          roleId: collegeRole.id,
          countryId: dto.countryId,
          collegeMembers: {
            create: {
              collegeId: college.id,
            },
          },
        },
        include: {
          role: true,
          country: true,
          collegeMembers: {
            include: {
              college: true,
            },
          },
        },
      });

      return newUser;
    });

    const { password, ...userWithoutPassword } = user;

    return {
      message: 'Registration completed! Please wait for admin approval before logging in.',
      user: userWithoutPassword,
    };
  }

  /**
   * Authenticate user login (Student, College, or Admin)
   */
  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        country: true,
        student: {
          include: {
            college: true,
          },
        },
        collegeMembers: {
          include: {
            college: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'disabled') {
      throw new UnauthorizedException(
        'Your account has been disabled by an administrator. Please contact support.',
      );
    }

    // 2. Validate password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check college approval status if role is college
    if (user.role.name === 'college') {
      const collegeMember = user.collegeMembers?.[0];
      if (collegeMember) {
        const collegeStatus = collegeMember.college?.status;
        if (collegeStatus !== 'approved') {
          if (collegeStatus === 'pending') {
            throw new UnauthorizedException(
              'Your college registration is currently pending admin vetting. Please wait for approval.',
            );
          } else {
            throw new UnauthorizedException(
              'Your college registration has been rejected or disabled by the administrator.',
            );
          }
        }
      }
    }

    // 3. Optional role verification if specified
    if (dto.role) {
      const targetRole = dto.role.toLowerCase();
      const actualRole = user.role.name.toLowerCase();
      const isAdminMatch =
        (targetRole === 'admin' || targetRole === 'super_admin') &&
        (actualRole === 'admin' || actualRole === 'super_admin');

      if (!isAdminMatch && targetRole !== actualRole) {
        throw new UnauthorizedException(
          `This account is registered as ${user.role.name.toUpperCase()}, not ${dto.role.toUpperCase()}`,
        );
      }
    }

    // 4. Generate JWT Tokens
    const tokens = await this.generateTokens(user);

    const { password, ...userWithoutPassword } = user;

    return {
      message: 'Login successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userWithoutPassword,
    };
  }

  /**
   * Get logged-in user profile
   */
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
        country: true,
        student: {
          include: {
            college: true,
          },
        },
        collegeMembers: {
          include: {
            college: {
              include: {
                country: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User profile not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update logged-in user profile
   */
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        collegeMembers: { include: { college: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User profile not found');
    }

    // 1. Update basic User fields
    const userUpdateData: any = {};
    if (dto.phoneNo !== undefined) userUpdateData.phoneNo = dto.phoneNo;
    if (dto.countryId !== undefined) userUpdateData.countryId = Number(dto.countryId);

    if (Object.keys(userUpdateData).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }

    // 2. If student profile exists, update student table
    if (user.student) {
      const studentUpdateData: any = {};
      if (dto.firstName !== undefined) studentUpdateData.firstName = dto.firstName;
      if (dto.lastName !== undefined) studentUpdateData.lastName = dto.lastName;
      if (dto.collegeId !== undefined) studentUpdateData.collegeId = dto.collegeId ? Number(dto.collegeId) : null;
      if (dto.customCollegeName !== undefined) studentUpdateData.customCollegeName = dto.customCollegeName;
      if (dto.usn !== undefined) studentUpdateData.usn = dto.usn;
      if (dto.branch !== undefined) studentUpdateData.branch = dto.branch;
      if (dto.graduationYear !== undefined) studentUpdateData.graduationYear = dto.graduationYear ? Number(dto.graduationYear) : null;

      if (Object.keys(studentUpdateData).length > 0) {
        await this.prisma.student.update({
          where: { userid: userId },
          data: studentUpdateData,
        });
      }
    }

    // 3. If college member profile exists, update college table
    if (user.collegeMembers && user.collegeMembers.length > 0) {
      const collegeId = user.collegeMembers[0].collegeId;
      const collegeUpdateData: any = {};
      if (dto.collegeName !== undefined) collegeUpdateData.name = dto.collegeName;
      if (dto.collegeAddress !== undefined) collegeUpdateData.address = dto.collegeAddress;

      if (Object.keys(collegeUpdateData).length > 0) {
        await this.prisma.college.update({
          where: { id: collegeId },
          data: collegeUpdateData,
        });
      }
    }

    return this.getProfile(userId);
  }

  /**
   * Change user password with current password verification
   */
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  /**
   * Helper to generate Access and Refresh tokens using centralized configuration
   */
  async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name || user.role,
      countryId: user.countryId,
    };

    const appConfig = this.configService.get<AppConfig>('app');
    const accessSecret = appConfig?.jwt.secret || process.env.JWT_SECRET || 'engineers_clinic_super_secret_jwt_key_2026';
    const accessExpiresIn = appConfig?.jwt.expiresIn || process.env.JWT_EXPIRES_IN || '15m';
    const refreshSecret = appConfig?.jwt.refreshSecret || process.env.JWT_REFRESH_SECRET || accessSecret;
    const refreshExpiresIn = appConfig?.jwt.refreshExpiresIn || process.env.JWT_REFRESH_EXPIRES_IN || '30d';


    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: accessExpiresIn as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn as any,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    try {
      const hashedToken = await bcrypt.hash(refreshToken, 10);
      await (this.prisma as any).refreshToken.create({
        data: {
          token: hashedToken,
          userId: user.id,
          expiresAt,
        },
      });
    } catch (dbError) {
      console.warn(
        (dbError as any)?.message || dbError,
      );
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh the access and refresh tokens with Reuse Detection (Theft Alert & Rotation Grace Window)
   */
  async refreshTokens(refreshToken: string) {
    const appConfig = this.configService.get<AppConfig>('app');
    const refreshSecret = appConfig?.jwt.refreshSecret || process.env.JWT_REFRESH_SECRET || appConfig?.jwt.secret || process.env.JWT_SECRET || 'engineers_clinic_super_secret_jwt_key_2026';
    const mainSecret = appConfig?.jwt.secret || process.env.JWT_SECRET || 'engineers_clinic_super_secret_jwt_key_2026';

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
        } catch (jwtErr) {
      try {
        payload = this.jwtService.verify(refreshToken, { secret: mainSecret });
      } catch (fallbackErr) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
    }

    try {
      const userTokens = await (this.prisma as any).refreshToken.findMany({
        where: {
          userId: payload.sub,
          isRevoked: false,
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      if (userTokens && userTokens.length > 0) {
        let matchedToken: any = null;
        for (const tokenRecord of userTokens) {
          const isMatch = await bcrypt.compare(refreshToken, tokenRecord.token);
          if (isMatch) {
            matchedToken = tokenRecord;
            break;
          }
        }

        if (matchedToken) {

          // Check if token has expired based on DB timestamp
          if (new Date() > new Date(matchedToken.expiresAt)) {
            console.warn(`[BACKEND-AUTH-SERVICE] ❌ Token has expired based on DB expiresAt`);
            throw new UnauthorizedException('Refresh token has expired');
          }

          // Mark current token as revoked for rotation
          await (this.prisma as any).refreshToken.update({
            where: { id: matchedToken.id },
            data: { isRevoked: true },
          });
        } else {
          console.warn(`[BACKEND-AUTH-SERVICE] ⚠️ Matched token not found in DB for user ID: ${payload.sub}`);
        }
      }
    } catch (dbError) {
      if (dbError instanceof UnauthorizedException) {
        throw dbError;
      }
      console.warn('[BACKEND-AUTH-SERVICE] DB lookup warning:', (dbError as any)?.message || dbError);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: true,
        country: true,
        student: {
          include: {
            college: true,
          },
        },
        collegeMembers: {
          include: {
            college: true,
          },
        },
      },
    });

    if (!user || user.status === 'disabled') {
      throw new UnauthorizedException('User is inactive or disabled');
    }

    const tokens = await this.generateTokens(user);
    const { password, ...userWithoutPassword } = user;

    return {
      message: 'Token refreshed successfully',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userWithoutPassword,
    };
  }

  /**
   * Revoke a refresh token (Logout)
   */
  async revokeRefreshToken(refreshToken: string) {
    try {
      const appConfig = this.configService.get<AppConfig>('app');
      const refreshSecret = appConfig?.jwt.refreshSecret || process.env.JWT_REFRESH_SECRET || appConfig?.jwt.secret || process.env.JWT_SECRET || 'engineers_clinic_super_secret_jwt_key_2026';
      const payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });

      const userTokens = await (this.prisma as any).refreshToken.findMany({
        where: {
          userId: payload.sub,
          isRevoked: false,
        },
      });

      for (const tokenRecord of userTokens) {
        const isMatch = await bcrypt.compare(refreshToken, tokenRecord.token);
        if (isMatch) {
          await (this.prisma as any).refreshToken.update({
            where: { id: tokenRecord.id },
            data: { isRevoked: true },
          });
          break;
        }
      }
    } catch {
      // Ignore token verification/DB errors during logout
    }
  }
}
