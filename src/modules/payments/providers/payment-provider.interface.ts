export interface CreateOrderParams {
  amount: number; // in major units (e.g. 4999.00 INR)
  currency: string; // e.g. "INR", "USD"
  receipt: string; // our internal unique receipt/order reference
  notes?: Record<string, string>;
}

export interface GatewayOrderResult {
  gatewayOrderId: string;
  amount: number;
  currency: string;
  raw: any;
}

export interface SettlementEvent {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  status: 'CAPTURED' | 'FAILED' | 'AUTHORIZED' | 'REFUNDED';
  amount: number;
  currency: string;
  method?: string;
  fee?: number;
  tax?: number;
  errorCode?: string;
  errorDescription?: string;
  raw: any;
}

export interface PaymentProvider {
  createOrder(params: CreateOrderParams): Promise<GatewayOrderResult>;
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean;
  verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean;
  parsePaymentEvent(payload: any): SettlementEvent;
  fetchPayment(paymentId: string): Promise<any>;
}
