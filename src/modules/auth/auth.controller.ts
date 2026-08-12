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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/register/student
   * Register a new student account
   */
  @ApiOperation({
    summary: 'Register a new student account',
    description: 'Creates a user account with student role and optionally links it to a college.',
  })
  @ApiResponse({
    status: 201,
    description: 'Student account registered successfully with access token.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request (email duplicate or missing fields).',
  })
  @Post('register/student')
  @HttpCode(HttpStatus.CREATED)
  async registerStudent(@Body() dto: RegisterStudentDto) {
    return this.authService.registerStudent(dto);
  }

  /**
   * POST /auth/register/college
   * Register a new college & admin account
   */
  @ApiOperation({
    summary: 'Register a new college institution & admin account',
    description: 'Creates a college record, user account with college role, and links them via collegeMember.',
  })
  @ApiResponse({
    status: 201,
    description: 'College account registered successfully with access token.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request (email or college name duplicate).',
  })
  @Post('register/college')
  @HttpCode(HttpStatus.CREATED)
  async registerCollege(@Body() dto: RegisterCollegeDto) {
    return this.authService.registerCollege(dto);
  }

  /**
   * POST /auth/login
   * User login (student, college, admin)
   */
  @ApiOperation({
    summary: 'User login (Student, College, Admin)',
    description: 'Authenticates user email and password credentials and returns a JWT access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns access token and user profile.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized (invalid credentials or role mismatch).',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * GET /auth/profile
   * Get current authenticated user profile
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current logged-in user profile',
    description: 'Returns authenticated user details based on Bearer JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user profile returned.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized (missing or invalid Bearer token).',
  })
  @Get('profile')
  async getProfile(@Request() req) {
    if (!req || !req.user || !req.user.id) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.authService.getProfile(req.user.id);
  }
}
