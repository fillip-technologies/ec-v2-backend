import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterCollegeDto } from './dto/register-college.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

    // 2. Validate Country ID
    const country = await this.prisma.country.findUnique({
      where: { id: dto.countryId },
    });

    if (!country) {
      throw new BadRequestException(`Selected country ID (${dto.countryId}) does not exist`);
    }

    // 3. Validate College ID if provided
    if (dto.collegeId) {
      const college = await this.prisma.college.findUnique({
        where: { id: dto.collegeId },
      });
      if (!college) {
        throw new BadRequestException(`Selected college ID (${dto.collegeId}) does not exist`);
      }
    }

    // 4. Resolve or create Student role
    let studentRole = await this.prisma.role.findUnique({
      where: { name: 'student' },
    });

    if (!studentRole) {
      studentRole = await this.prisma.role.create({
        data: { name: 'student' },
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 6. Create User and linked Student record
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phoneNo: dto.phoneNo,
        roleId: studentRole.id,
        countryId: dto.countryId,
        student: {
          create: {
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            collegeId: dto.collegeId || null,
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

    // 7. Sign JWT Token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      countryId: user.countryId,
    };
    const accessToken = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = user;

    return {
      message: 'Student account registered successfully',
      accessToken,
      user: userWithoutPassword,
    };
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

    // 7. Sign JWT Token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      countryId: user.countryId,
    };
    const accessToken = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = user;

    return {
      message: 'College account registered successfully',
      accessToken,
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

    // 2. Validate password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Optional role verification if specified
    if (dto.role && dto.role.toLowerCase() !== user.role.name.toLowerCase()) {
      throw new UnauthorizedException(
        `This account is registered as ${user.role.name.toUpperCase()}, not ${dto.role.toUpperCase()}`,
      );
    }

    // 4. Generate JWT Token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      countryId: user.countryId,
    };
    const accessToken = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = user;

    return {
      message: 'Login successful',
      accessToken,
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
      throw new UnauthorizedException('User profile not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
