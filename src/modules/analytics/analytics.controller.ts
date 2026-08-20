import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('Admin Analytics')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get fast executive KPIs, revenue trends, funnel, and score distribution' })
  @ApiResponse({ status: 200, description: 'Overview analytics calculated successfully.' })
  async getOverviewAnalytics() {
    return this.analyticsService.getOverviewAnalytics();
  }

  @Get('colleges')
  @ApiOperation({ summary: 'Get paginated, searchable B2B institutional cohort benchmarks' })
  @ApiResponse({ status: 200, description: 'College benchmarks returned with pagination.' })
  async getCollegeBenchmarks(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.analyticsService.getCollegeBenchmarks({ page, limit, search });
  }

  @Get('geographic')
  @ApiOperation({ summary: 'Get global student & visitor geographic reach' })
  @ApiResponse({ status: 200, description: 'Geographic distribution returned successfully.' })
  async getGeographicReach() {
    return this.analyticsService.getGeographicReach();
  }

  @Get()
  @ApiOperation({ summary: 'Get unified analytics telemetry' })
  @ApiResponse({ status: 200, description: 'Analytics data calculated successfully.' })
  async getAnalytics() {
    return this.analyticsService.getAnalytics();
  }
}
