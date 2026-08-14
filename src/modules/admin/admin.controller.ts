import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateCollegeStatusDto } from './dto/update-college-status.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Permissions } from '../../core/decorators/permissions.decorator';

@ApiTags('Admin Console')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('super_admin', 'admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/overview
   * High-level platform telemetry metrics for Super Admin & Admin Console
   */
  @ApiOperation({ summary: 'Get high-level platform telemetry metrics' })
  @ApiResponse({ status: 200, description: 'Platform telemetry metrics returned successfully.' })
  @Permissions('report:view')
  @Get('overview')
  async getOverview() {
    return this.adminService.getOverview();
  }

  /**
   * GET /admin/colleges
   * List all colleges with optional status filter
   */
  @ApiOperation({ summary: 'List all registered college institutions' })
  @ApiResponse({ status: 200, description: 'Colleges list returned successfully.' })
  @Permissions('college:vet')
  @Get('colleges')
  async getColleges(@Query('status') status?: string) {
    return this.adminService.getColleges(status);
  }

  /**
   * PATCH /admin/colleges/:id/status
   * Approve or reject a college institution
   */
  @ApiOperation({ summary: 'Approve, reject, or set pending status for a college' })
  @ApiResponse({ status: 200, description: 'College status updated successfully.' })
  @Permissions('college:vet')
  @Patch('colleges/:id/status')
  async updateCollegeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCollegeStatusDto,
  ) {
    return this.adminService.updateCollegeStatus(id, dto.status);
  }

  /**
   * GET /admin/users
   * List system users with role and status filters
   */
  @ApiOperation({ summary: 'List platform users with role and status filters' })
  @ApiResponse({ status: 200, description: 'Users list returned successfully.' })
  @Permissions('user:manage')
  @Get('users')
  async getUsers(
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getUsers(role, status);
  }

  /**
   * PATCH /admin/users/:id/status
   * Change user account status
   */
  @ApiOperation({ summary: 'Update user account status (active, pending, disabled)' })
  @ApiResponse({ status: 200, description: 'User status updated successfully.' })
  @Permissions('user:manage')
  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, dto.status);
  }

  /**
   * GET /admin/submissions
   */
  @ApiOperation({ summary: 'List all student submissions' })
  @ApiResponse({ status: 200, description: 'Submissions list returned successfully.' })
  @Permissions('user:manage')
  @Get('submissions')
  async getSubmissions() {
    return this.adminService.getSubmissions();
  }

  /**
   * PATCH /admin/submissions/:id/review
   */
  @ApiOperation({ summary: 'Approve or reject student task submission' })
  @ApiResponse({ status: 200, description: 'Submission reviewed successfully.' })
  @Permissions('user:manage')
  @Patch('submissions/:id/review')
  async reviewSubmission(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: 'PASSED' | 'NEEDS_WORK' | 'EVALUATING'; score?: number; feedback?: string },
  ) {
    return this.adminService.reviewSubmission(
      id,
      body.status,
      body.score ?? 80,
      body.feedback ?? 'Verified by admin',
    );
  }
}
