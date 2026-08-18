import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import {
  CreateSeatOrderDto,
  ConfirmSeatOrderPaymentDto,
} from './dto/create-seat-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('B2B Seat Orders')
@Controller('seat-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SeatOrdersController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /seat-orders
   * College requests N seats for a program
   */
  @Post()
  @Roles('college')
  @ApiOperation({ summary: 'College requests N seats for a program' })
  async createSeatOrder(
    @Body() dto: CreateSeatOrderDto,
    @Request() req: any,
  ) {
    const collegeMember = await this.prisma.collegeMember.findFirst({
      where: { userId: req.user.id },
    });

    if (!collegeMember) {
      throw new ForbiddenException('College profile not found.');
    }

    return this.paymentsService.createSeatOrder(collegeMember.collegeId, dto);
  }

  /**
   * GET /seat-orders
   * List seat orders (College gets own, Admin gets all)
   */
  @Get()
  @Roles('college', 'admin', 'super_admin')
  @ApiOperation({ summary: 'List seat orders' })
  async getSeatOrders(@Request() req: any) {
    return this.paymentsService.getSeatOrders(req.user);
  }

  /**
   * PATCH /seat-orders/:id/confirm-payment
   * Admin confirms invoice payment and triggers coupon batch generation
   */
  @Patch(':id/confirm-payment')
  @Roles('admin', 'super_admin')
  @ApiOperation({
    summary: 'Admin confirms invoice paid & generates coupon batch',
  })
  async confirmPayment(
    @Param('id', ParseIntPipe) seatOrderId: number,
    @Body() dto: ConfirmSeatOrderPaymentDto,
  ) {
    return this.paymentsService.confirmSeatOrderPayment(seatOrderId, dto);
  }
}
