'use client';

import React, { useState, useEffect } from 'react';
import { Program, Country } from '@/types/catalog';
import { formatPrice } from '@/lib/utils/currency';
import {
  initiateCheckout,
  validateCoupon,
  verifyPayment,
  ValidateCouponResponse,
} from '@/lib/api/payment';
import { showToast } from '@/lib/toast';
import {
  ShieldCheck,
  Tag,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  X,
  Sparkles,
  AlertCircle,
  CreditCard,
  Gift,
  Award,
  Layers,
  Cpu,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  program: Program;
  countries: Country[];
  selectedCountryCode: string;
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  program,
  countries,
  selectedCountryCode,
  user,
  onClose,
  onSuccess,
}) => {
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] =
    useState<ValidateCouponResponse | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);

  // Dynamically load Razorpay SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isOpen) return null;

  const activeCountry =
    countries.find(
      (c) => c.isoCode.toUpperCase() === selectedCountryCode.toUpperCase(),
    ) || countries[0];

  const activeCurrencyCode = activeCountry?.currencyCode || 'INR';

  const pricing =
    program.pricings?.find(
      (p) =>
        (activeCountry ? p.countryId === activeCountry.id : false) ||
        p.currency === activeCurrencyCode,
    ) ||
    program.pricings?.find((p) => p.currency === activeCurrencyCode) ||
    program.pricings?.[0];

  const basePrice = pricing ? Number(pricing.amount) : 4999;
  const currency = pricing ? pricing.currency : activeCurrencyCode;

  const discountAmount = appliedCoupon ? basePrice : 0;
  const finalPrice = appliedCoupon ? 0 : basePrice;

  // Handle Coupon Validation
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) {
      setCouponError('Please enter a valid coupon code.');
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError('');
      const res = await validateCoupon(clean, program.id);
      setAppliedCoupon(res);
      showToast.success(
        `Institutional coupon "${res.code}" applied successfully! 100% discount unlocked.`,
        'Coupon Applied',
      );
    } catch (err: any) {
      setAppliedCoupon(null);
      const msg = err.message || 'Invalid or expired coupon code.';
      setCouponError(msg);
      showToast.error(msg, 'Coupon Error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Handle Checkout / Payment
  const handleProceedCheckout = async () => {
    try {
      setCheckoutLoading(true);

      // PATH A: COUPON 100% REDEMPTION
      if (appliedCoupon) {
        const result = await initiateCheckout(program.id, {
          couponCode: appliedCoupon.code,
          currency,
          countryId: activeCountry?.id,
        });

        showToast.success(
          result.message || 'Enrollment confirmed! Setting up your workspace...',
          'Enrollment Successful',
        );
        onSuccess();
        setTimeout(() => {
          window.location.href = '/student';
        }, 500);
        return;
      }

      // PATH B: RAZORPAY PAID CHECKOUT
      const res = await initiateCheckout(program.id, {
        currency,
        countryId: activeCountry?.id,
      });

      if (!res.razorpayKeyId || !res.gatewayOrderId) {
        throw new Error('Payment gateway order initialization failed.');
      }

      const options = {
        key: res.razorpayKeyId,
        amount: Math.round(res.amount * 100),
        currency: res.currency,
        name: 'Engineers Clinic',
        description: `Enrollment: ${program.title}`,
        order_id: res.gatewayOrderId,
        prefill: {
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email,
          email: user?.email,
        },
        theme: {
          color: '#7C5CFC',
        },
        modal: {
          ondismiss: function () {
            setCheckoutLoading(false);
          },
        },
        handler: async function (response: any) {
          setVerifying(true);
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            showToast.success(
              'Payment verified! Your guided workspace is ready.',
              'Payment Successful',
            );
            onSuccess();
            setTimeout(() => {
              window.location.href = '/student';
            }, 500);
          } catch (err: any) {
            showToast.error(
              err.message || 'Payment verification failed. Please contact support.',
              'Verification Failed',
            );
          } finally {
            setVerifying(false);
            setCheckoutLoading(false);
          }
        },
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          showToast.error(
            resp.error?.description || 'Payment was cancelled or failed.',
            'Payment Failed',
          );
          setCheckoutLoading(false);
        });
        rzp.open();
      } else {
        throw new Error('Razorpay SDK failed to load. Please refresh and try again.');
      }
    } catch (err: any) {
      showToast.error(
        err.message || 'Failed to initiate checkout. Please try again.',
        'Checkout Error',
      );
      setCheckoutLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !checkoutLoading && !verifying) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-borderLight/80 bg-white shadow-2xl transition-all">
        {/* Subtle Decorative Header Background Accent */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-brand/10 via-brandSoft/60 to-purple-50 pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="relative flex items-center justify-between px-6 pt-6 pb-4 sm:px-8 border-b border-borderLight/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white shadow-md shadow-brand/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-brand">
                Internship Program Enrollment
              </span>
              <h2 className="text-lg font-black text-textPrimary sm:text-xl tracking-tight leading-tight">
                Checkout & Confirmation
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={checkoutLoading || verifying}
            aria-label="Close checkout modal"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-borderLight bg-white text-textMuted shadow-xs hover:text-textPrimary hover:bg-bgSoft transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main Content Body */}
        <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-12">
          {/* Left Column: Program Identity & Deliverables */}
          <div className="space-y-4 lg:col-span-6">
            <div className="rounded-2xl border border-borderLight bg-bgBody/60 p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-brandSoft px-2.5 py-0.5 text-[10px] font-extrabold text-brand uppercase tracking-wider">
                  <Award className="h-3 w-3" /> Industry Certified
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                  <Clock className="h-3 w-3" /> {program.durationHours || 120} Hours
                </span>
              </div>

              <h3 className="text-base font-black text-textPrimary leading-snug">
                {program.title}
              </h3>

              <p className="text-xs text-textMuted line-clamp-2 leading-relaxed">
                {program.description ||
                  'Complete 3 industry capstone projects evaluated against rigorous automated AI rubrics.'}
              </p>
            </div>

            {/* Deliverables Checklist */}
            <div className="rounded-2xl border border-borderLight/70 bg-white p-4 space-y-2.5 shadow-xs">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-brand" /> What You Will Get:
              </h4>

              <div className="space-y-2 text-xs font-bold text-textSecondary">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>3 Real-World Capstone Project Workspaces</span>
                </div>
                <div className="flex items-start gap-2">
                  <Cpu className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  <span>Automated AI Rubric Code Evaluation</span>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Verifiable QR Completion Certificate</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>GitHub Repository Deliverable Tracking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Coupon & Action */}
          <div className="space-y-4 lg:col-span-6 flex flex-col justify-between">
            {/* Invoice Breakdown Card */}
            <div className="rounded-2xl border border-borderLight bg-bgSoft/40 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-textMuted">
                <span>Standard Program Fee</span>
                <span className="font-extrabold text-textPrimary">
                  {formatPrice(basePrice, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-textMuted">
                <span>IDE & AI Evaluation Compute</span>
                <span className="font-extrabold text-emerald-600 uppercase text-[10px]">
                  Included (Free)
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs font-black text-emerald-700 bg-emerald-100/70 -mx-2 px-2.5 py-1.5 rounded-xl border border-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Coupon ({appliedCoupon.code})</span>
                  </span>
                  <span>-{formatPrice(discountAmount, currency)}</span>
                </div>
              )}

              <div className="border-t border-borderLight pt-2.5 flex items-baseline justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-textPrimary">
                  Total Payable
                </span>
                <div className="text-right">
                  <span className="text-2xl font-black text-brand tracking-tight">
                    {formatPrice(finalPrice, currency)}
                  </span>
                  {appliedCoupon && (
                    <span className="block text-[10px] font-extrabold text-emerald-600">
                      100% Institutional Discount Applied
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Coupon Application Box */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-brand" /> College / Campaign Coupon Code
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-900 shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      Code <strong className="font-mono font-black text-emerald-700">{appliedCoupon.code}</strong> (100% OFF)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-extrabold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer shrink-0 ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    placeholder="Enter code (e.g. EC-VIT-002-B8C2)"
                    className="flex-1 rounded-xl border border-borderLight bg-bgBody px-3.5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-textPrimary placeholder:text-textMuted placeholder:font-sans focus:border-brand focus:outline-hidden focus:ring-2 focus:ring-brand/20 transition"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {couponLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span>Apply</span>
                    )}
                  </button>
                </form>
              )}

              {couponError && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 animate-in fade-in">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleProceedCheckout}
                disabled={checkoutLoading || verifying}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/25 hover:bg-brandHover hover:shadow-brand/35 transition-all disabled:opacity-60 cursor-pointer"
              >
                {checkoutLoading || verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {verifying
                        ? 'Verifying Signature & Enrolling...'
                        : 'Initiating Razorpay Checkout...'}
                    </span>
                  </>
                ) : appliedCoupon ? (
                  <>
                    <span>Claim Free Internship Seat (₹0)</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Pay {formatPrice(finalPrice, currency)} with Razorpay</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-textMuted">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  256-Bit SSL
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-brand" />
                  UPI / Cards / NetBanking
                </span>
                <span>•</span>
                <span>Instant Workspace Unlock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
