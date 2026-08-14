import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CollegeService } from './college.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Permissions } from '../../core/decorators/permissions.decorator';

@ApiTags('College B2B Portal')
@ApiBearerAuth()
@Controller('college')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('college', 'super_admin', 'admin')
export class CollegeController {
  constructor(private readonly collegeService: CollegeService) {}

  /**
   * GET /college/overview
   * Returns scoped telemetry metrics for the logged-in college institution (e.g. VIT)
   */
  @ApiOperation({ summary: 'Get college institution cohort telemetry overview' })
  @ApiResponse({ status: 200, description: 'College overview metrics returned successfully.' })
  @Permissions('report:view')
  @Get('overview')
  async getOverview(@Request() req: any) {
    const userId = req.user.id;
    return this.collegeService.getOverview(userId);
  }

  /**
   * GET /college/students
   * Returns student cohort enrolled under this college institution
   */
  @ApiOperation({ summary: 'List student cohort enrolled under this college institution' })
  @ApiResponse({ status: 200, description: 'College student cohort returned successfully.' })
  @Permissions('college:manage')
  @Get('students')
  async getStudents(@Request() req: any) {
    const userId = req.user.id;
    return this.collegeService.getStudents(userId);
  }

  /**
   * GET /college/coupons
   * List zero-cost coupon batches allocated to this college
   */
  @ApiOperation({ summary: 'List zero-cost B2B coupon batches for this college' })
  @ApiResponse({ status: 200, description: 'College coupon batches returned successfully.' })
  @Permissions('coupon:generate')
  @Get('coupons')
  async getCoupons(@Request() req: any) {
    const userId = req.user.id;
    return this.collegeService.getCoupons(userId);
  }

  /**
   * GET /college/reports
   * Cohort completion reports for this college institution
   */
  @ApiOperation({ summary: 'Get cohort completion reports for this college institution' })
  @ApiResponse({ status: 200, description: 'College completion reports returned successfully.' })
  @Permissions('report:view')
  @Get('reports')
  async getReports(@Request() req: any) {
    const userId = req.user.id;
    return this.collegeService.getReports(userId);
  }
}
