import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppConfig } from '../../../core/config/app.config';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const appConfig = configService.get<AppConfig>('app');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig?.jwt.secret || process.env.JWT_SECRET || 'engineers_clinic_super_secret_jwt_key_2026',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: true,
        country: true,
        student: true,
        collegeMembers: {
          include: {
            college: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or session expired');
    }

    if (user.status === 'disabled') {
      throw new UnauthorizedException('Your account has been disabled by an administrator.');
    }

    if (user.role.name === 'college') {
      const collegeMember = user.collegeMembers?.[0];
      if (collegeMember) {
        const collegeStatus = collegeMember.college?.status;
        if (collegeStatus !== 'approved') {
          throw new UnauthorizedException(
            'Your college institution is not approved or registration is pending.',
          );
        }
      }
    }

    const { password, ...result } = user;
    return result;
  }
}
