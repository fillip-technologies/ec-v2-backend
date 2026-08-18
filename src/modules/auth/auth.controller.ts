import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterCollegeDto } from './dto/register-college.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';

const REFRESH_COOKIE_OPTIONS: any = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Helper to reliably parse cookies from header
function getCookie(req: any, name: string): string | null {
  if (req.cookies && req.cookies[name]) {
    return req.cookies[name];
  }
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
    const trimmed = cookie.trim();
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      acc[key] = val;
    }
    return acc;
  }, {} as Record<string, string>);
  return cookies[name] ? decodeURIComponent(cookies[name]) : null;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/register/student
   */
  @ApiOperation({ summary: 'Register a new student account' })
  @Post('register/student')
  @HttpCode(HttpStatus.CREATED)
  async registerStudent(
    @Body() dto: RegisterStudentDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.registerStudent(dto);

    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    return result;
  }

  /**
   * POST /auth/register/college
   */
  @ApiOperation({ summary: 'Register a new college account' })
  @Post('register/college')
  @HttpCode(HttpStatus.CREATED)
  async registerCollege(
    @Body() dto: RegisterCollegeDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const result: any = await this.authService.registerCollege(dto);

    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    return result;
  }

  /**
   * GET /auth/colleges
   * Public list of approved colleges for registration
   */
  @ApiOperation({ summary: 'Get public list of approved colleges for registration' })
  @Get('colleges')
  @HttpCode(HttpStatus.OK)
  async getPublicColleges() {
    return this.authService.getPublicColleges();
  }

  /**
   * POST /auth/login
   */
  @ApiOperation({ summary: 'User login' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.login(dto);

    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    return result;
  }

  /**
   * POST /auth/refresh
   */
  @ApiOperation({ summary: 'Refresh Access Token' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: any,
    @Body() body: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const bodyToken = body?.refreshToken || req.body?.refreshToken;
    const cookieToken = getCookie(req, 'refreshToken');
    const token = bodyToken || cookieToken;

    if (!token) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const result = await this.authService.refreshTokens(token);

    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    return result;
  }

  /**
   * POST /auth/logout
   */
  @ApiOperation({ summary: 'User logout' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: any,
    @Body() body: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const token = getCookie(req, 'refreshToken') || body?.refreshToken || req.body?.refreshToken;
    
    if (token) {
      await this.authService.revokeRefreshToken(token);
    }

    res.clearCookie('refreshToken', {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: 0,
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * GET /auth/profile
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current profile' })
  @Get('profile')
  async getProfile(@Request() req: any) {
    if (!req || !req.user || !req.user.id) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.authService.getProfile(req.user.id);
  }
}
