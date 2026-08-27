import { BACKEND_URL } from '@/config/api';
import { apiClient } from './client';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ValidateCouponResponse {
  valid: boolean;
  code: string;
  discountPercent: number;
  batchCode: string;
  programId: number;
  programTitle: string;
}

export interface CheckoutResponse {
  orderId: number;
  status: 'PENDING' | 'PAID';
  amount: number;
  currency: string;
  gateway?: string;
  gatewayOrderId?: string;
  razorpayKeyId?: string;
  receipt?: string;
  isCoupon?: boolean;
  enrollmentId?: number;
  message?: string;
  programTitle?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  settled: boolean;
  orderId: number;
  status: 'PAID' | 'PENDING';
  enrollmentId?: number;
}

export interface SeatOrder {
  id: number;
  collegeId: number;
  programId: number;
  seatsPurchased: number;
  seatsRedeemed: number;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  invoiceRef?: string;
  createdAt: string;
  program: { id: number; title: string; slug: string };
  college: { id: number; name: string };
  couponBatch?: {
    id: number;
    batchCode: string;
    totalCoupons: number;
    _count: { coupons: number };
  };
}

export interface CouponStudentDetail {
  userId: number;
  name: string;
  email?: string;
  phone?: string;
  orderId?: number;
}

export interface CouponItem {
  id: number;
  code: string;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED' | 'VOID';
  redeemedByUserId?: number | null;
  redeemedAt?: string | null;
  expiresAt?: string | null;
  student?: CouponStudentDetail | null;
}

export interface CouponBatchDetail {
  id: number;
  batchCode: string;
  totalCoupons: number;
  createdAt?: string;
  program: { id: number; title: string; slug?: string; durationHours?: number };
  college: { id: number; name: string; code?: string };
  seatOrder?: {
    id: number;
    collegeId: number;
    programId: number;
    seatsPurchased: number;
    seatsRedeemed: number;
    amount: number | string;
    currency: string;
    status: string;
    invoiceRef?: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  coupons: CouponItem[];
}

/**
 * Validate coupon code against a program
 */
export async function validateCoupon(
  code: string,
  programId: number,
): Promise<ValidateCouponResponse> {
  const res = await apiClient(`${BACKEND_URL}/coupons/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ code, programId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to validate coupon');
  }
  return data;
}

/**
 * Initiate checkout for an internship program
 */
export async function initiateCheckout(
  programId: number,
  data: { couponCode?: string; currency?: string; countryId?: number },
): Promise<CheckoutResponse> {
  const res = await apiClient(`${BACKEND_URL}/programs/${programId}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || 'Checkout initiation failed');
  }
  return resData;
}

/**
 * Verify client-side Razorpay payment signature
 */
export async function verifyPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<VerifyPaymentResponse> {
  const res = await apiClient(`${BACKEND_URL}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || 'Payment verification failed');
  }
  return resData;
}

/**
 * Get student orders history
 */
export async function getStudentOrders(): Promise<any[]> {
  const res = await apiClient(`${BACKEND_URL}/orders`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) return [];
  return await res.json();
}

/**
 * College requests N seats, or Admin directly generates coupon batch
 */
export async function createSeatOrder(data: {
  programId: number;
  seatsPurchased: number;
  amount?: number;
  currency?: string;
  invoiceRef?: string;
  collegeId?: number;
  autoGenerateCoupons?: boolean;
  batchCodePrefix?: string;
}): Promise<any> {
  const res = await apiClient(`${BACKEND_URL}/seat-orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || 'Failed to request seats');
  }
  return resData;
}

/**
 * Get seat orders list (College or Admin)
 */
export async function getSeatOrders(): Promise<SeatOrder[]> {
  const res = await apiClient(`${BACKEND_URL}/seat-orders`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) return [];
  return await res.json();
}

/**
 * Admin confirms seat order invoice payment and generates coupon batch
 */
export async function confirmSeatOrderPayment(
  seatOrderId: number,
  data?: {
    invoiceRef?: string;
    batchCodePrefix?: string;
    seatsPurchased?: number;
    amount?: number;
  },
): Promise<any> {
  const res = await apiClient(
    `${BACKEND_URL}/seat-orders/${seatOrderId}/confirm-payment`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data || {}),
    },
  );

  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || 'Failed to confirm seat order payment');
  }
  return resData;
}

/**
 * Admin rejects / cancels a pending seat order
 */
export async function rejectSeatOrder(
  seatOrderId: number,
  data?: { reason?: string },
): Promise<any> {
  const res = await apiClient(
    `${BACKEND_URL}/seat-orders/${seatOrderId}/reject`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data || {}),
    },
  );

  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || 'Failed to reject seat order');
  }
  return resData;
}

/**
 * View / export coupon batch codes
 */
export async function getCouponBatch(batchId: number): Promise<CouponBatchDetail> {
  const res = await apiClient(`${BACKEND_URL}/coupons/batches/${batchId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || 'Failed to fetch coupon batch');
  }
  return resData;
}

/**
 * Get payment gateway configurations
 */
export async function getGatewayConfigs(): Promise<any[]> {
  const res = await apiClient(`${BACKEND_URL}/payment-gateway-configs`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) return [];
  return await res.json();
}

/**
 * Update gateway configuration (kill switch / priority)
 */
export async function updateGatewayConfig(id: number, data: any): Promise<any> {
  const res = await apiClient(`${BACKEND_URL}/payment-gateway-configs/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || 'Failed to update gateway config');
  }
  return resData;
}

/**
 * Get all student orders (Admin / Super Admin)
 */
export async function getAdminOrders(): Promise<any[]> {
  const res = await apiClient(`${BACKEND_URL}/orders`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    return [];
  }
  return await res.json();
}

