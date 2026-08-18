import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CheckoutDto } from './dto/checkout.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import {
  CreateGatewayConfigDto,
  UpdateGatewayConfigDto,
} from './dto/gateway-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('Payments & Orders')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /programs/:id/checkout
   * Student initiates checkout for an internship program (branches: coupon ₹0 OR Razorpay order)
   */
  @Post('programs/:id/checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate checkout for an internship program' })
  async checkout(
    @Param('id', ParseIntPipe) programId: number,
    @Body() dto: CheckoutDto,
    @Request() req: any,
  ) {
    const studentId = req.user.id;
    return this.paymentsService.checkout(studentId, programId, dto);
  }

  /**
   * POST /payments/verify
   * Client-side Razorpay signature verification & immediate order settlement
   */
  @Post('payments/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify client-side Razorpay payment signature' })
  async verifyPayment(@Body() dto: VerifyPaymentDto, @Request() req: any) {
    const studentId = req.user.id;
    return this.paymentsService.verifyPayment(studentId, dto);
  }

  /**
   * GET /orders
   * List orders (student gets own, admin/support gets all)
   */
  @Get('orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'admin', 'super_admin', 'support')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List orders' })
  async getOrders(@Request() req: any) {
    const roleName =
      typeof req.user?.role === 'string'
        ? req.user.role
        : req.user?.role?.name || '';
    if (roleName.toLowerCase() === 'student') {
      return this.paymentsService.getStudentOrders(req.user.id);
    }
    return this.paymentsService.getAllOrders();
  }

  /**
   * GET /orders/:id
   * Get order detail with payment reconciliation attempts
   */
  @Get('orders/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'admin', 'super_admin', 'support')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order detail with payment reconciliation attempts' })
  async getOrderById(
    @Param('id', ParseIntPipe) orderId: number,
    @Request() req: any,
  ) {
    return this.paymentsService.getOrderById(orderId, req.user);
  }

  /**
   * GET /payment-gateway-configs
   * List configured payment gateways (Admin / Super Admin)
   */
  @Get('payment-gateway-configs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List configured payment gateways' })
  async getGatewayConfigs() {
    return this.paymentsService.getGatewayConfigs();
  }

  /**
   * POST /payment-gateway-configs
   * Register a new gateway configuration (Super Admin)
   */
  @Post('payment-gateway-configs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new gateway configuration' })
  async createGatewayConfig(@Body() dto: CreateGatewayConfigDto) {
    return this.paymentsService.createGatewayConfig(dto);
  }

  /**
   * PATCH /payment-gateway-configs/:id
   * Enable/disable or reorder gateway priority (Super Admin)
   */
  @Patch('payment-gateway-configs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update gateway configuration (killswitch/priority)' })
  async updateGatewayConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGatewayConfigDto,
  ) {
    return this.paymentsService.updateGatewayConfig(id, dto);
  }
}
