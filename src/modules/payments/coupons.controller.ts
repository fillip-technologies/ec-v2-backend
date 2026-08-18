import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /coupons/validate
   * Check if a coupon is valid before checkout
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a coupon code against a program' })
  async validateCoupon(@Body() dto: ValidateCouponDto) {
    return this.paymentsService.validateCoupon(dto.code, dto.programId);
  }

  /**
   * GET /coupon-batches/:id/coupons
   * View / export coupons in a batch (College own / Admin all)
   */
  @Get('batches/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('college', 'admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'View/export coupon batch codes' })
  async getCouponBatch(
    @Param('id', ParseIntPipe) batchId: number,
    @Request() req: any,
  ) {
    return this.paymentsService.getCouponBatchCoupons(batchId, req.user);
  }
}
