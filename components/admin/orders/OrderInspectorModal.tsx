'use client';

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Building,
  User,
  Ticket,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Mail,
  BookOpen,
} from 'lucide-react';
import { AdminOrderItem } from '../AdminOrdersView';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/utils/currency';
import { showToast } from '@/lib/toast';

interface OrderInspectorModalProps {
  order: AdminOrderItem | null;
  onClose: () => void;
}

export const OrderInspectorModal: React.FC<OrderInspectorModalProps> = ({
  order,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!order) return null;

  const handleCopy = (text: string, key: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast.success('Copied to clipboard', 'Copied');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const studentName = order.student?.firstName
    ? `${order.student.firstName} ${order.student.lastName || ''}`.trim()
    : 'Unknown Student';

  const collegeName =
    order.student?.college?.name ||
    order.student?.customCollegeName ||
    order.coupon?.batch?.college?.name ||
    'Direct Online Checkout';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-[28px] border border-borderLight bg-white p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-borderLight pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand border border-brand/20">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-textPrimary">
                  Order #{order.id} Dossier
                </h3>
                <StatusBadge status={order.status} size="sm" />
              </div>
              <p className="text-xs text-textMuted mt-0.5">
                Created on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-borderLight hover:bg-bgSoft text-textMuted hover:text-textPrimary transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Amount Box */}
        <div className="rounded-2xl bg-bgSoft/60 border border-borderLight/60 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">
              Total Order Amount
            </span>
            <div className="text-2xl font-black text-textPrimary">
              {formatCurrency(Number(order.amount), order.currency || 'INR')}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-textMuted">Gateway:</span>
            <span className="font-mono text-xs font-black bg-white px-2.5 py-1 rounded-lg border border-borderLight text-brand">
              {order.gateway || (Number(order.amount) === 0 ? 'COUPON_100%' : 'RAZORPAY')}
            </span>
          </div>
        </div>

        {/* Student & Program Dossier Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Student Dossier */}
          <div className="rounded-2xl border border-borderLight p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-textMuted font-bold text-[11px] uppercase tracking-wider">
              <User className="h-3.5 w-3.5 text-brand" /> Student Information
            </div>
            <div>
              <div className="font-black text-textPrimary text-sm">{studentName}</div>
              <div className="flex items-center gap-1.5 text-textMuted mt-0.5">
                <Mail className="h-3 w-3" /> {order.student?.user?.email || 'No email registered'}
              </div>
            </div>
            <div className="pt-2 border-t border-borderLight/60 text-textMuted space-y-1">
              <div className="flex items-center gap-1.5">
                <Building className="h-3 w-3" />
                <span className="font-bold text-textPrimary truncate">{collegeName}</span>
              </div>
              {order.student?.usn && (
                <div>USN: <span className="font-mono font-bold text-textPrimary">{order.student.usn}</span></div>
              )}
            </div>
          </div>

          {/* Program Dossier */}
          <div className="rounded-2xl border border-borderLight p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-textMuted font-bold text-[11px] uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5 text-brand" /> Enrolled Program
            </div>
            <div>
              <div className="font-black text-textPrimary text-sm line-clamp-1">
                {order.program?.title || 'Program Item'}
              </div>
              <div className="text-textMuted mt-0.5">
                Duration: <span className="font-bold text-textPrimary">{order.program?.durationHours || 40} Hours</span>
              </div>
            </div>
            {order.coupon && (
              <div className="pt-2 border-t border-borderLight/60 space-y-1">
                <div className="flex items-center gap-1.5 text-brand font-bold">
                  <Ticket className="h-3 w-3" />
                  <span>Coupon Applied:</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-black text-textPrimary bg-bgSoft px-2 py-0.5 rounded border border-borderLight">
                    {order.coupon.code}
                  </code>
                  <button
                    onClick={() => handleCopy(order.coupon!.code, 'coupon')}
                    className="p-1 text-textMuted hover:text-brand transition"
                  >
                    {copiedKey === 'coupon' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Attempts Log */}
        {order.payments && order.payments.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-textMuted flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Gateway Payment Attempts & Receipts
            </h4>
            <div className="rounded-2xl border border-borderLight overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-bgSoft border-b border-borderLight text-[10px] font-black uppercase text-textMuted">
                    <th className="py-2.5 px-4">Attempt ID</th>
                    <th className="py-2.5 px-3">Gateway</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderLight/60">
                  {order.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-bgSoft/40">
                      <td className="py-2.5 px-4 font-mono font-bold">{p.gatewayPaymentId || `#${p.id}`}</td>
                      <td className="py-2.5 px-3 font-bold">{p.gateway || 'Razorpay'}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 font-black">
                        {formatCurrency(Number(p.amount), p.currency)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-textMuted">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end pt-3 border-t border-borderLight">
          <button
            onClick={onClose}
            className="rounded-xl bg-bgSoft px-4 py-2 text-xs font-bold text-textPrimary hover:bg-borderLight transition cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
