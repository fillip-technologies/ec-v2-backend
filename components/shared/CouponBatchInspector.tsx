'use client';

import React, { useState, useMemo } from 'react';
import {
  Ticket,
  Copy,
  Download,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Building,
  BookOpen,
  CreditCard,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { CouponBatchDetail, CouponItem } from '@/lib/api/payment';
import { formatPrice } from '@/lib/utils/currency';
import { showToast } from '@/lib/toast';

interface CouponBatchInspectorProps {
  batch: CouponBatchDetail;
  onBack: () => void;
}

export const CouponBatchInspector: React.FC<CouponBatchInspectorProps> = ({
  batch,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'REDEEMED'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const coupons = batch.coupons || [];
  const seatOrder = batch.seatOrder;

  // Telemetry Calculations
  const totalCoupons = coupons.length || batch.totalCoupons || 0;
  const redeemedCount = coupons.filter((c) => c.status === 'REDEEMED').length;
  const activeCount = coupons.filter((c) => c.status === 'ACTIVE').length;
  const redemptionRate = totalCoupons > 0 ? Math.round((redeemedCount / totalCoupons) * 100) : 0;

  // Filter logic
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchesStatus =
        statusFilter === 'ALL' || c.status?.toUpperCase() === statusFilter;

      if (!searchQuery.trim()) return matchesStatus;

      const q = searchQuery.toLowerCase();
      const codeMatch = c.code.toLowerCase().includes(q);
      const studentNameMatch = c.student?.name?.toLowerCase().includes(q);
      const studentEmailMatch = c.student?.email?.toLowerCase().includes(q);
      const studentPhoneMatch = c.student?.phone?.includes(q);
      const orderIdMatch = String(c.student?.orderId || '').includes(q);

      return matchesStatus && (codeMatch || studentNameMatch || studentEmailMatch || studentPhoneMatch || orderIdMatch);
    });
  }, [coupons, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredCoupons.length / pageSize) || 1;
  const paginatedCoupons = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCoupons.slice(start, start + pageSize);
  }, [filteredCoupons, currentPage, pageSize]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast.success(`Copied "${text}" to clipboard!`, `${label} Copied`);
  };

  const handleExportFullCSV = () => {
    const headers = [
      'Coupon Code',
      'Status',
      'Student Name',
      'Student Email',
      'Student Phone',
      'User ID',
      'Order ID',
      'Redeemed At',
      'College Name',
      'Program Title',
      'Batch Code',
    ];

    const rows = coupons.map((c) => [
      `"${c.code}"`,
      `"${c.status}"`,
      `"${c.student?.name || ''}"`,
      `"${c.student?.email || ''}"`,
      `"${c.student?.phone || ''}"`,
      `"${c.student?.userId || ''}"`,
      `"${c.student?.orderId || ''}"`,
      `"${c.redeemedAt ? new Date(c.redeemedAt).toLocaleString() : ''}"`,
      `"${batch.college?.name || ''}"`,
      `"${batch.program?.title || ''}"`,
      `"${batch.batchCode}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(',')].concat(rows.map((r) => r.join(','))).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Batch_Audit_${batch.batchCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success(
      `Exported full audit of ${coupons.length} coupons with student records.`,
      'CSV Export Complete',
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Navigation Bar */}
      <div className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-textMuted hover:text-brand transition mb-2 cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to All Batches & Orders</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-black text-textPrimary font-mono">
              {batch.batchCode}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                redeemedCount === totalCoupons && totalCoupons > 0
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {redeemedCount === totalCoupons && totalCoupons > 0
                ? '100% Fully Redeemed'
                : 'Active Cohort Batch'}
            </span>
          </div>

          <p className="text-xs text-textMuted mt-1">
            {batch.college?.name} • {batch.program?.title}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch md:self-auto">
          <button
            type="button"
            onClick={handleExportFullCSV}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-xs font-extrabold shadow-md hover:bg-brandHover transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Full Audit (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[22px] border border-borderLight bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <Ticket className="h-4 w-4 text-brand" />
            <span>Total Seats Purchased</span>
          </div>
          <div className="mt-2 text-2xl font-black text-textPrimary font-mono">
            {totalCoupons}
          </div>
        </div>

        <div className="rounded-[22px] border border-borderLight bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
            <span>Redeemed by Students</span>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-600">
            {redeemedCount} <span className="text-xs font-bold text-textMuted font-mono">({redemptionRate}%)</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-bgSoft overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-600 transition-all"
              style={{ width: `${redemptionRate}%` }}
            />
          </div>
        </div>

        <div className="rounded-[22px] border border-borderLight bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Available Unused Codes</span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 font-mono">
            {activeCount}
          </div>
        </div>

        <div className="rounded-[22px] border border-borderLight bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <CreditCard className="h-4 w-4 text-brand" />
            <span>Invoice Contract Value</span>
          </div>
          <div className="mt-2 text-2xl font-black text-textPrimary">
            {seatOrder?.amount !== undefined
              ? formatPrice(Number(seatOrder.amount), seatOrder.currency || 'INR')
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Seat Order Record Details */}
      {seatOrder && (
        <div className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-borderLight pb-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand">
              <ShieldCheck className="h-4 w-4" />
              <span>Commercial Seat Order Ledger (Table: seat_orders)</span>
            </div>
            <span className="font-mono text-xs font-bold text-textMuted">
              Order ID #{seatOrder.id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1 p-3.5 rounded-xl bg-bgSoft/60 border border-borderLight/60">
              <span className="text-textMuted font-bold block">Partner Campus</span>
              <span className="font-black text-textPrimary flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-brand" />
                {batch.college?.name}
              </span>
            </div>

            <div className="space-y-1 p-3.5 rounded-xl bg-bgSoft/60 border border-borderLight/60">
              <span className="text-textMuted font-bold block">Internship Program</span>
              <span className="font-black text-textPrimary truncate block" title={batch.program?.title}>
                {batch.program?.title}
              </span>
            </div>

            <div className="space-y-1 p-3.5 rounded-xl bg-bgSoft/60 border border-borderLight/60">
              <span className="text-textMuted font-bold block">Invoice / PO Reference</span>
              <span className="font-mono font-black text-textPrimary truncate block">
                {seatOrder.invoiceRef || 'N/A'}
              </span>
            </div>

            <div className="space-y-1 p-3.5 rounded-xl bg-bgSoft/60 border border-borderLight/60">
              <span className="text-textMuted font-bold block">Payment Status</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-black text-[10px] bg-emerald-100 text-emerald-800 uppercase">
                <CheckCircle2 className="h-3 w-3" />
                {seatOrder.status}
              </span>
            </div>

            <div className="space-y-1 p-3.5 rounded-xl bg-bgSoft/60 border border-borderLight/60">
              <span className="text-textMuted font-bold block">Seats Purchased</span>
              <span className="font-mono font-black text-textPrimary">
                {seatOrder.seatsPurchased} Seats
              </span>
            </div>

            <div className="space-y-1 p-3.5 rounded-xl bg-bgSoft/60 border border-borderLight/60">
              <span className="text-textMuted font-bold block">Seats Redeemed</span>
              <span className="font-mono font-black text-purple-700">
                {seatOrder.seatsRedeemed} of {seatOrder.seatsPurchased}
              </span>
            </div>

            <div className="space-y-1 p-3.5 rounded-xl bg-bgSoft/60 border border-borderLight/60">
              <span className="text-textMuted font-bold block">Created Timestamp</span>
              <span className="font-mono font-bold text-textPrimary">
                {new Date(seatOrder.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="space-y-1 p-3.5 rounded-xl bg-bgSoft/60 border border-borderLight/60">
              <span className="text-textMuted font-bold block">Last Reconciled</span>
              <span className="font-mono font-bold text-textPrimary">
                {new Date(seatOrder.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Single-Use Coupons & Student Redemption Ledger DataTable */}
      <div className="rounded-[28px] border border-borderLight bg-white shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-6 border-b border-borderLight flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-bgBody/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by coupon code, student name, email, or order ID..."
              className="w-full pl-9 pr-4 py-2 text-xs font-bold rounded-xl border border-borderLight bg-white text-textPrimary placeholder:text-textMuted focus:border-brand focus:outline-hidden focus:ring-2 focus:ring-brand/20 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center rounded-xl border border-borderLight bg-white p-1 text-xs font-bold self-start md:self-auto">
            {[
              { id: 'ALL', label: `All Codes (${coupons.length})` },
              { id: 'ACTIVE', label: `Active / Unused (${activeCount})` },
              { id: 'REDEEMED', label: `Redeemed (${redeemedCount})` },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setStatusFilter(st.id as any);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition text-[11px] font-extrabold cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* DataTable */}
        {filteredCoupons.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-textMuted space-y-2">
            <Ticket className="h-8 w-8 mx-auto text-textMuted opacity-60" />
            <p>No coupons match your filter or search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borderLight bg-bgBody/50 text-[11px] font-black uppercase tracking-wider text-textMuted">
                  <th className="py-3.5 px-4 sm:px-6">#</th>
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Redeemed By Student</th>
                  <th className="py-3.5 px-4">Redeemed At</th>
                  <th className="py-3.5 px-4">Student Order ID</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight text-xs font-medium">
                {paginatedCoupons.map((coupon, idx) => {
                  const isRedeemed = coupon.status === 'REDEEMED';
                  const rowSeq = (currentPage - 1) * pageSize + idx + 1;

                  return (
                    <tr
                      key={coupon.id || idx}
                      className="hover:bg-bgSoft/40 transition-colors group"
                    >
                      {/* Seq */}
                      <td className="py-4 px-4 sm:px-6 font-mono text-textMuted font-bold">
                        {rowSeq}
                      </td>

                      {/* Code */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-black text-textPrimary text-xs bg-bgSoft px-2.5 py-1 rounded-md border border-borderLight">
                          {coupon.code}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isRedeemed
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isRedeemed ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          <span>{coupon.status}</span>
                        </span>
                      </td>

                      {/* Student Info */}
                      <td className="py-4 px-4">
                        {coupon.student ? (
                          <div className="space-y-0.5">
                            <div className="font-black text-textPrimary flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-brand shrink-0" />
                              <span>{coupon.student.name}</span>
                            </div>
                            {coupon.student.email && (
                              <div className="text-[11px] text-textMuted flex items-center gap-1">
                                <Mail className="h-3 w-3 text-textMuted shrink-0" />
                                <span>{coupon.student.email}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-textMuted text-[11px] font-bold italic">
                            — Awaiting Student Redemption —
                          </span>
                        )}
                      </td>

                      {/* Redeemed At */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-textPrimary text-[11px]">
                        {coupon.redeemedAt ? (
                          <div className="space-y-0.5">
                            <div className="font-bold">
                              {new Date(coupon.redeemedAt).toLocaleDateString()}
                            </div>
                            <div className="text-[10px] text-textMuted">
                              {new Date(coupon.redeemedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-textMuted italic">—</span>
                        )}
                      </td>

                      {/* Order ID */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono font-bold text-textPrimary">
                        {coupon.student?.orderId ? (
                          <span className="text-brand">#{coupon.student.orderId}</span>
                        ) : (
                          <span className="text-textMuted">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopy(coupon.code, 'Coupon Code')}
                            className="p-1.5 rounded-lg border border-borderLight bg-white hover:bg-bgSoft text-textPrimary transition cursor-pointer"
                            title="Copy Coupon Code"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          {coupon.student?.email && (
                            <button
                              type="button"
                              onClick={() => handleCopy(coupon.student!.email!, 'Student Email')}
                              className="p-1.5 rounded-lg border border-borderLight bg-white hover:bg-bgSoft text-textPrimary transition cursor-pointer"
                              title="Copy Student Email"
                            >
                              <Mail className="h-3.5 w-3.5 text-textMuted hover:text-textPrimary" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination Footer */}
        {filteredCoupons.length > 0 && (
          <div className="p-4 sm:px-6 border-t border-borderLight flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-textMuted font-bold">
            <div>
              Showing{' '}
              <span className="font-extrabold text-textPrimary">
                {(currentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-extrabold text-textPrimary">
                {Math.min(currentPage * pageSize, filteredCoupons.length)}
              </span>{' '}
              of{' '}
              <span className="font-extrabold text-textPrimary">
                {filteredCoupons.length}
              </span>{' '}
              coupons
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-borderLight bg-white text-textPrimary hover:bg-bgSoft disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`h-8 w-8 rounded-lg text-xs font-black transition cursor-pointer ${
                      currentPage === pg
                        ? 'bg-brand text-white'
                        : 'border border-borderLight bg-white text-textPrimary hover:bg-bgSoft'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-borderLight bg-white text-textPrimary hover:bg-bgSoft disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
