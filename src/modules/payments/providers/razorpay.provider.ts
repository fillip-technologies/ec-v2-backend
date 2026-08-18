import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import {
  PaymentProvider,
  CreateOrderParams,
  GatewayOrderResult,
  SettlementEvent,
} from './payment-provider.interface';

@Injectable()
export class RazorpayProvider implements PaymentProvider {
  private readonly logger = new Logger(RazorpayProvider.name);
  private razorpayClient: any;
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.keyId =
      this.configService.get<string>('RAZORPAY_KEY') ||
      this.configService.get<string>('RAZORPAY_KEY_ID') ||
      process.env.RAZORPAY_KEY ||
      process.env.RAZORPAY_KEY_ID ||
      'rzp_test_placeholder';
    this.keySecret =
      this.configService.get<string>('RAZORPAY_SECRET') ||
      this.configService.get<string>('RAZORPAY_KEY_SECRET') ||
      process.env.RAZORPAY_SECRET ||
      process.env.RAZORPAY_KEY_SECRET ||
      'secret_placeholder';
    this.webhookSecret =
      this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') ||
      this.configService.get<string>('RAZORPAY_SECRET') ||
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_SECRET ||
      'webhook_secret_placeholder';

    try {
      this.razorpayClient = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret,
      });
    } catch (err: any) {
      this.logger.warn(`Razorpay client initialized in fallback mode: ${err.message}`);
    }
  }

  getKeyId(): string {
    return this.keyId;
  }

  async createOrder(params: CreateOrderParams): Promise<GatewayOrderResult> {
    const amountInSubunits = Math.round(params.amount * 100); // INR paise / cents

    try {
      const rpOrder = await this.razorpayClient.orders.create({
        amount: amountInSubunits,
        currency: params.currency.toUpperCase(),
        receipt: params.receipt,
        notes: params.notes || {},
      });

      return {
        gatewayOrderId: rpOrder.id,
        amount: params.amount,
        currency: params.currency,
        raw: rpOrder,
      };
    } catch (err: any) {
      this.logger.error(`Failed to create Razorpay order: ${err.message}`, err.stack);
      // Fallback for development if keys are placeholders
      if (this.keyId.includes('placeholder')) {
        const mockId = `order_mock_${Date.now()}`;
        return {
          gatewayOrderId: mockId,
          amount: params.amount,
          currency: params.currency,
          raw: { id: mockId, status: 'created', amount: amountInSubunits },
        };
      }
      throw err;
    }
  }

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    if (this.keyId.includes('placeholder')) {
      return true; // dev sandbox bypass
    }

    const payload = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac('sha256', this.keySecret)
      .update(payload)
      .digest('hex');

    return expected === signature;
  }

  verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean {
    if (this.webhookSecret.includes('placeholder')) {
      return true; // dev sandbox bypass
    }

    const expected = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'))
      .digest('hex');

    return expected === signature;
  }

  parsePaymentEvent(payload: any): SettlementEvent {
    const p = payload?.payload?.payment?.entity || payload?.payment || payload;
    const rawStatus = (p?.status || 'FAILED').toUpperCase();

    let mappedStatus: 'CAPTURED' | 'FAILED' | 'AUTHORIZED' | 'REFUNDED' = 'FAILED';
    if (rawStatus === 'CAPTURED') mappedStatus = 'CAPTURED';
    else if (rawStatus === 'AUTHORIZED') mappedStatus = 'AUTHORIZED';
    else if (rawStatus === 'REFUNDED') mappedStatus = 'REFUNDED';

    return {
      gatewayOrderId: p?.order_id || payload?.order_id || '',
      gatewayPaymentId: p?.id || '',
      status: mappedStatus,
      amount: (p?.amount || 0) / 100,
      currency: p?.currency || 'INR',
      method: p?.method || null,
      fee: p?.fee ? p.fee / 100 : undefined,
      tax: p?.tax ? p.tax / 100 : undefined,
      errorCode: p?.error_code || null,
      errorDescription: p?.error_description || null,
      raw: p,
    };
  }

  async fetchPayment(paymentId: string): Promise<any> {
    try {
      return await this.razorpayClient.payments.fetch(paymentId);
    } catch (err: any) {
      this.logger.warn(`Failed to fetch payment ${paymentId} from Razorpay: ${err.message}`);
      if (this.keyId.includes('placeholder')) {
        return {
          id: paymentId,
          status: 'captured',
          amount: 499900,
          currency: 'INR',
          method: 'upi',
        };
      }
      throw err;
    }
  }
}
