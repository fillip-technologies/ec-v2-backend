'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Zap,
  AlertCircle,
  ChevronLeft,
  Tag,
  Lock,
  Loader2,
  Gift,
  Award,
  Clock,
  Sparkles,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { Country, Program } from '@/types/catalog';
import { formatPrice, getCurrencySymbol, getFlagEmoji } from '@/lib/utils/currency';
import { useAuth } from '@/context/AuthContext';
import { CustomDropdown } from '@/components/shared/CustomDropdown';
import { showToast } from '@/lib/toast';
import { getStudentPrograms } from '@/lib/api/student';
import {
  initiateCheckout,
  validateCoupon,
  verifyPayment,
  ValidateCouponResponse,
} from '@/lib/api/payment';

interface ProgramDetailSidebarProps {
  program: Program;
  countries: Country[];
  selectedCountryCode: string;
  onCountryChange: (isoCode: string) => void;
}

export const ProgramDetailSidebar: React.FC<ProgramDetailSidebarProps> = ({
  program,
  countries,
  selectedCountryCode,
  onCountryChange,
}) => {
  const { user, roleName } = useAuth();
  const [viewMode, setViewMode] = useState<'overview' | 'checkout'>('overview');
  const [enrolledProgramIds, setEnrolledProgramIds] = useState<number[]>([]);
  const [checkingEnrollment, setCheckingEnrollment] = useState<boolean>(false);

  // Checkout states
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] =
    useState<ValidateCouponResponse | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);

  // Check student enrollments
  useEffect(() => {
    if (user && roleName?.toLowerCase() === 'student') {
      setCheckingEnrollment(true);
      getStudentPrograms()
        .then((progs) => {
          if (Array.isArray(progs)) {
            const ids = progs
              .map((p: any) => p.program?.id || p.programId || p.id)
              .filter(Boolean);
            setEnrolledProgramIds(ids);
          }
        })
        .catch((err) => {
          console.warn('Failed to load student programs:', err);
        })
        .finally(() => {
          setCheckingEnrollment(false);
        });
    }
  }, [user, roleName]);

  // Dynamically load Razorpay SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const isAlreadyEnrolled = enrolledProgramIds.includes(program.id);
  const canEnroll = (!user || roleName === 'student' || roleName === 'guest') && !isAlreadyEnrolled;

  // Filter country list to ONLY countries whose pricing is set in this program
  const pricedCountries = React.useMemo(() => {
    if (!program.pricings || program.pricings.length === 0) {
      return countries.length > 0 ? [countries[0]] : [];
    }

    const available = countries.filter((country) =>
      program.pricings?.some(
        (p) =>
          p.countryId === country.id ||
          p.currency?.toUpperCase() === country.currencyCode?.toUpperCase(),
      ),
    );

    return available.length > 0 ? available : countries.slice(0, 1);
  }, [countries, program.pricings]);

  // Ensure selected country is valid in pricedCountries list
  useEffect(() => {
    if (pricedCountries.length > 0) {
      const isCurrentValid = pricedCountries.some(
        (c) => c.isoCode.toUpperCase() === selectedCountryCode.toUpperCase(),
      );
      if (!isCurrentValid && pricedCountries[0]) {
        onCountryChange(pricedCountries[0].isoCode);
      }
    }
  }, [pricedCountries, selectedCountryCode, onCountryChange]);

  const activeCountry =
    pricedCountries.find(
      (c) => c.isoCode.toUpperCase() === selectedCountryCode.toUpperCase(),
    ) || pricedCountries[0];

  const activeCurrencyCode = activeCountry?.currencyCode || 'INR';

  // Find pricing by matching countryId OR currencyCode from program.pricings
  const pricing =
    program.pricings?.find(
      (p) =>
        (activeCountry ? p.countryId === activeCountry.id : false) ||
        p.currency?.toUpperCase() === activeCurrencyCode.toUpperCase(),
    ) ||
    program.pricings?.find(
      (p) => p.currency?.toUpperCase() === activeCurrencyCode.toUpperCase(),
    ) ||
    program.pricings?.[0];

  const basePrice = pricing ? Number(pricing.amount) : 4999;
  const currency = pricing ? pricing.currency : activeCurrencyCode;

  const discountAmount = appliedCoupon ? basePrice : 0;
  const finalPrice = appliedCoupon ? 0 : basePrice;

  const handleEnrollClick = () => {
    if (isAlreadyEnrolled) {
      window.location.href = '/student?tab=program';
      return;
    }

    if (!user || roleName === 'guest') {
      window.location.href = `/signup?role=student&redirect=/catalog/${program.slug || program.id}`;
      return;
    }

    if (!canEnroll) {
      const displayRole = roleName ? roleName.replace(/_/g, ' ') : 'this';
      showToast.warning(
        `Enrollment is restricted to student accounts. You are currently signed in as ${displayRole}.`,
        'Student Account Required',
      );
      return;
    }

    setViewMode('checkout');
  };

  // Handle Coupon Validation
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError('');
      const res = await validateCoupon(clean, program.id);
      setAppliedCoupon(res);
      showToast.success(
        `Coupon ${res.code} applied! 100% discount granted.`,
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
          result.message || 'Enrolled successfully! Redirecting to workspace...',
          'Enrollment Confirmed',
        );
        setTimeout(() => {
          window.location.href = '/student?tab=program';
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
            setTimeout(() => {
              window.location.href = '/student?tab=program';
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
            resp.error?.description || 'Payment cancelled or failed.',
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
    <aside className="sticky top-24 rounded-3xl border border-glassBorder bg-white p-6 shadow-xl backdrop-blur-xl transition-all duration-300">
      {viewMode === 'overview' ? (
        /* =========================================================================
           VIEW MODE 1: PROGRAM OVERVIEW & ENROLL TRIGGER
           ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Location / Country Selector (Filtered to Available Priced Countries) */}
          <div>
            <CustomDropdown
              label="Select Location & Pricing"
              icon={<Globe className="h-4 w-4 text-brand" />}
              value={selectedCountryCode}
              onChange={(val) => onCountryChange(val)}
              options={pricedCountries.map((c) => {
                const matchingPricing = program.pricings?.find(
                  (p) =>
                    p.countryId === c.id ||
                    p.currency?.toUpperCase() === c.currencyCode?.toUpperCase(),
                );
                const priceBadge = matchingPricing
                  ? formatPrice(Number(matchingPricing.amount), matchingPricing.currency)
                  : `${c.currencyCode} ${getCurrencySymbol(c.currencyCode)}`;

                return {
                  value: c.isoCode,
                  label: `${getFlagEmoji(c.isoCode)} ${c.name.toUpperCase()}`,
                  badge: priceBadge,
                };
              })}
            />
          </div>

          {/* Pricing Header Card / Enrolled Status Card */}
          {isAlreadyEnrolled ? (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-black text-white uppercase tracking-wider shadow-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
                </span>
                <span className="text-xs font-bold text-emerald-800">
                  Active Student
                </span>
              </div>
              <div className="text-sm font-extrabold text-emerald-950">
                You have active access to this internship
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Guided IDE & AI evaluation unlocked</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-borderLight bg-bgSoft/60 p-4">
              <div className="text-2xl font-black text-brand">
                {formatPrice(basePrice, currency)}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-successDark">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Industry Internship</span>
              </div>
            </div>
          )}

          {/* Primary Action CTA */}
          <div>
            {isAlreadyEnrolled ? (
              <a
                href="/student?tab=program"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold transition-all shadow-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Enrolled • Open Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <button
                type="button"
                onClick={handleEnrollClick}
                title={
                  !canEnroll
                    ? 'Enrollment is restricted to student accounts.'
                    : undefined
                }
                className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold transition-all shadow-md ${
                  canEnroll
                    ? 'bg-brand text-white hover:bg-brandHover shadow-brand/25 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed hover:bg-slate-100'
                }`}
              >
                <span>Enroll in Program</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {!canEnroll && !isAlreadyEnrolled && (
              <p className="mt-2 text-center text-[11px] font-semibold text-textMuted flex items-center justify-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Enrollment disabled for {roleName ? roleName.replace(/_/g, ' ') : 'unauthorized'} accounts</span>
              </p>
            )}

            {isAlreadyEnrolled && (
              <p className="mt-2 text-center text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Click above to resume your project tasks</span>
              </p>
            )}
          </div>

          {/* What's Included Checklist */}
          <div className="border-t border-borderLight/70 pt-4 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-brand" /> Program Deliverables Included:
            </h4>

            <div className="space-y-2 text-xs font-bold text-textSecondary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span>Guided IDE Browser Workspace</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span>Automated AI Rubric Code Evaluation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span>Task-Level Reference Guides & Docs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span>Verified Certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span>Dedicated Mentor Review Support</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           VIEW MODE 2: TRANSFORMED IN-PLACE CHECKOUT SIDEBAR
           ========================================================================= */
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Back Button & Checkout Header */}
          <div>
            <button
              type="button"
              onClick={() => setViewMode('overview')}
              disabled={checkoutLoading || verifying}
              className="inline-flex items-center gap-1 text-xs font-bold text-textMuted hover:text-textPrimary transition cursor-pointer mb-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Overview</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-brand">
                  Step 2: Confirmation
                </span>
                <h3 className="text-base font-black text-textPrimary leading-tight">
                  Enrollment Checkout
                </h3>
              </div>
            </div>
          </div>

          {/* Program Quick Badge */}
          <div className="rounded-2xl border border-borderLight bg-bgBody/70 p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-brandSoft px-2 py-0.5 text-[10px] font-extrabold text-brand uppercase tracking-wider">
                <Award className="h-3 w-3" /> Verified Track
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                <Clock className="h-3 w-3" /> {program.durationHours || 120} Hours
              </span>
            </div>
            <h4 className="text-xs font-black text-textPrimary leading-snug line-clamp-1">
              {program.title}
            </h4>
          </div>

          {/* Pricing Calculation Breakdown */}
          <div className="rounded-2xl border border-borderLight bg-bgSoft/60 p-3.5 space-y-2 text-xs font-bold">
            <div className="flex items-center justify-between text-textMuted">
              <span>Program Fee</span>
              <span className="font-extrabold text-textPrimary">
                {formatPrice(basePrice, currency)}
              </span>
            </div>

            <div className="flex items-center justify-between text-textMuted">
              <span>IDE & AI Compute</span>
              <span className="font-extrabold text-emerald-600 uppercase text-[10px]">
                Included
              </span>
            </div>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-emerald-700 bg-emerald-100/70 -mx-1.5 px-2 py-1 rounded-lg border border-emerald-300 font-extrabold">
                <span className="flex items-center gap-1">
                  <Gift className="h-3 w-3 text-emerald-600" />
                  <span>Coupon ({appliedCoupon.code})</span>
                </span>
                <span>-{formatPrice(discountAmount, currency)}</span>
              </div>
            )}

            <div className="border-t border-borderLight pt-2 flex items-baseline justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-textPrimary">
                Total Payable
              </span>
              <span className="text-xl font-black text-brand tracking-tight">
                {formatPrice(finalPrice, currency)}
              </span>
            </div>
          </div>

          {/* Coupon Code Section */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted flex items-center gap-1">
              <Tag className="h-3 w-3 text-brand" /> College Coupon Code
            </label>

            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900">
                <div className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate font-mono font-black">
                    {appliedCoupon.code}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-[11px] font-extrabold text-rose-600 hover:underline cursor-pointer shrink-0 ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError('');
                  }}
                  placeholder="e.g. EC-VIT-002-B8C2"
                  className="flex-1 rounded-xl border border-borderLight bg-bgBody px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-textPrimary placeholder:text-textMuted placeholder:font-sans focus:border-brand focus:outline-hidden focus:ring-2 focus:ring-brand/20 transition"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {couponLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <span>Apply</span>
                  )}
                </button>
              </form>
            )}

            {couponError && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{couponError}</span>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleProceedCheckout}
              disabled={checkoutLoading || verifying}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-brand/25 hover:bg-brandHover transition-all disabled:opacity-60 cursor-pointer"
            >
              {checkoutLoading || verifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {verifying
                      ? 'Verifying & Enrolling...'
                      : 'Opening Razorpay...'}
                  </span>
                </>
              ) : appliedCoupon ? (
                <>
                  <span>Claim Free Seat (₹0)</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Pay {formatPrice(finalPrice, currency)}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-textMuted">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                256-Bit SSL
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CreditCard className="h-3 w-3 text-brand" />
                UPI / Cards
              </span>
              <span>•</span>
              <span>Instant Access</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
