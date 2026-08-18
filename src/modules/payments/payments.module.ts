import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { WebhooksController } from './webhooks.controller';
import { SeatOrdersController } from './seat-orders.controller';
import { CouponsController } from './coupons.controller';
import { RazorpayProvider } from './providers/razorpay.provider';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    PaymentsController,
    WebhooksController,
    SeatOrdersController,
    CouponsController,
  ],
  providers: [PaymentsService, RazorpayProvider],
  exports: [PaymentsService, RazorpayProvider],
})
export class PaymentsModule {}
