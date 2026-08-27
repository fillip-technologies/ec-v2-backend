'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Ticket,
  Copy,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Building,
  CreditCard,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  getSeatOrders,
  createSeatOrder,
  getCouponBatch,
  SeatOrder,
  CouponBatchDetail,
} from '@/lib/api/payment';
import { getPrograms } from '@/lib/api/catalog';
import { formatPrice } from '@/lib/utils/currency';
import { showToast } from '@/lib/toast';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { CouponBatchInspector } from '@/components/shared/CouponBatchInspector';

interface CollegeCouponsViewProps {
  coupons?: any[];
}

export const CollegeCouponsView: React.FC<CollegeCouponsViewProps> = () => {
  const [seatOrders, setSeatOrders] = useState<SeatOrder[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [selectedProgramId, setSelectedProgramId] = useState<number | ''>('');
  const [seatsCount, setSeatsCount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<number | ''>('');
  const [invoiceRef, setInvoiceRef] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Batch Detail Modal State
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [batchDetail, setBatchDetail] = useState<CouponBatchDetail | null>(null);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, progsData] = await Promise.all([
        getSeatOrders(),
        getPrograms(),
      ]);
      setSeatOrders(Array.isArray(ordersData) ? ordersData : []);
      setPrograms(Array.isArray(progsData) ? progsData : []);
      if (progsData && progsData.length > 0 && selectedProgramId === '') {
        setSelectedProgramId(progsData[0].id);
        const unit = progsData[0].pricings?.[0]?.amount ? Number(progsData[0].pricings[0].amount) : 4999;
        setCustomAmount(unit * 25);
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load seat orders.', 'Load Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProgramOrSeatsChange = (progId: number, seats: number) => {
    const selected = programs.find((p) => p.id === progId);
    const unitPrice = selected?.pricings?.[0]?.amount
      ? Number(selected.pricings[0].amount)
      : 4999;
    setCustomAmount(unitPrice * seats);
  };

  const handleCreateSeatOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId) {
      showToast.error('Please select an internship program.', 'Validation Error');
      return;
    }

    try {
      setSubmitting(true);
      await createSeatOrder({
        programId: Number(selectedProgramId),
        seatsPurchased: Number(seatsCount),
        amount: customAmount !== '' ? Number(customAmount) : undefined,
        invoiceRef: invoiceRef.trim() || undefined,
      });

      showToast.success(
        `Seat purchase request for ${seatsCount} seats submitted! An administrator will confirm your invoice.`,
        'Request Submitted',
      );
      setIsRequestModalOpen(false);
      setInvoiceRef('');
      fetchData();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to request seats.', 'Submission Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenBatchDetail = async (batchId: number) => {
    setSelectedBatchId(batchId);
    setBatchLoading(true);
    try {
      const detail = await getCouponBatch(batchId);
      setBatchDetail(detail);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load batch codes.', 'Error');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast.success(`Copied "${code}" to clipboard!`, 'Coupon Copied');
  };

  const handleExportCSV = (coupons: any[], batchCode: string) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Code,Status,Redeemed By User ID,Redeemed At']
        .concat(
          coupons.map(
            (c) =>
              `${c.code},${c.status},${c.redeemedByUserId || ''},${c.redeemedAt || ''}`,
          ),
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Coupons_${batchCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success(`Exported ${coupons.length} coupon codes as CSV!`, 'Export Complete');
  };

  // Filter logic
  const filteredOrders = useMemo(() => {
    return seatOrders.filter((order) => {
      const programTitle = order.program?.title || '';
      const orderIdStr = String(order.id);
      const invoiceRefVal = order.invoiceRef || '';
      const batchCode = order.couponBatch?.batchCode || '';

      const matchesSearch =
        !searchQuery.trim() ||
        programTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orderIdStr.includes(searchQuery) ||
        invoiceRefVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batchCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || order.status?.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [seatOrders, searchQuery, statusFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // KPI Metrics
  const totalOrders = seatOrders.length;
  const totalSeats = seatOrders.reduce((sum, o) => sum + (o.seatsPurchased || 0), 0);
  const totalRedeemed = seatOrders.reduce((sum, o) => sum + (o.seatsRedeemed || 0), 0);

  // If inspecting a specific batch, render the dedicated Inspector View
  if (selectedBatchId) {
    if (batchLoading || !batchDetail) {
      return (
        <div className="rounded-[28px] border border-borderLight bg-white p-16 text-center shadow-xs">
          <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-3" />
          <h3 className="text-sm font-black text-textPrimary">Loading Batch & Student Audit Records...</h3>
          <p className="text-xs text-textMuted mt-1">Fetching seat orders, coupon codes, and redemption ledger.</p>
        </div>
      );
    }

    return (
      <CouponBatchInspector
        batch={batchDetail}
        onBack={() => {
          setSelectedBatchId(null);
          setBatchDetail(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner & Request Action */}
      <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-borderLight shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand">
            <Ticket className="h-4 w-4" />
            <span>Institutional Distribution</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-textPrimary tracking-tight">
            Institutional Seat Allocation & Coupon Batches
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Request bulk seats on sellable programs and distribute zero-cost coupon codes to your students.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRequestModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white font-extrabold text-xs shadow-md hover:bg-brandHover transition cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Request Internship Seats
        </button>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[22px] border border-borderLight bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <CreditCard className="h-4 w-4 text-brand" />
            <span>Total Seat Orders</span>
          </div>
          <div className="mt-2 text-2xl font-black text-textPrimary">
            {totalOrders}
          </div>
        </div>

        <div className="rounded-[22px] border border-borderLight bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <Ticket className="h-4 w-4 text-brand" />
            <span>Seats Allocated</span>
          </div>
          <div className="mt-2 text-2xl font-black text-textPrimary">
            {totalSeats}
          </div>
        </div>

        <div className="rounded-[22px] border border-borderLight bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Redeemed by Students</span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {totalRedeemed} <span className="text-xs font-bold text-textMuted">/ {totalSeats}</span>
          </div>
        </div>
      </div>

      {/* DataTable Container */}
      <div className="rounded-[28px] border border-borderLight bg-white shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-borderLight flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-bgBody/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by program, invoice ref, batch code..."
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

          <div className="flex items-center rounded-xl border border-borderLight bg-white p-1 text-xs font-bold self-start sm:self-auto">
            {['ALL', 'PAID', 'PENDING'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg transition text-[11px] font-extrabold cursor-pointer ${
                  statusFilter === st
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-brand mx-auto mb-2" />
            <p className="text-xs font-bold text-textMuted">Loading institutional seat ledger...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-bgSoft text-textMuted flex items-center justify-center mx-auto">
              <Ticket className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-black text-textPrimary">No Seat Orders Found</h3>
            <p className="text-xs text-textMuted max-w-sm mx-auto">
              Click "Request Internship Seats" to order a batch of student seats on any program.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borderLight bg-bgBody/50 text-[11px] font-black uppercase tracking-wider text-textMuted">
                  <th className="py-3.5 px-4 sm:px-6">Order ID & Ref</th>
                  <th className="py-3.5 px-4">Internship Program</th>
                  <th className="py-3.5 px-4">Seats & Progress</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight text-xs font-medium">
                {paginatedOrders.map((order) => {
                  const isPaid = order.status === 'PAID';
                  const isPending = order.status === 'PENDING';
                  const progressPct =
                    order.seatsPurchased > 0
                      ? Math.round((order.seatsRedeemed / order.seatsPurchased) * 100)
                      : 0;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-bgSoft/40 transition-colors group"
                    >
                      {/* ID & Invoice Ref */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <div className="font-mono font-black text-textPrimary">
                          #{order.id}
                        </div>
                        {order.invoiceRef && (
                          <div className="font-mono text-[10px] text-textMuted">
                            {order.invoiceRef}
                          </div>
                        )}
                      </td>

                      {/* Program */}
                      <td className="py-4 px-4 max-w-[260px]">
                        <div className="font-extrabold text-textPrimary truncate" title={order.program?.title}>
                          {order.program?.title || 'Internship Program'}
                        </div>
                        {order.couponBatch && (
                          <div className="font-mono text-[10px] text-brand font-bold">
                            Batch: {order.couponBatch.batchCode}
                          </div>
                        )}
                      </td>

                      {/* Seats & Redemption Progress */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-textPrimary">
                            {order.seatsRedeemed} / {order.seatsPurchased}
                          </span>
                          <span className="text-[10px] text-textMuted font-bold">
                            ({progressPct}%)
                          </span>
                        </div>
                        {/* Mini Progress Bar */}
                        <div className="mt-1.5 h-1.5 w-24 rounded-full bg-bgSoft overflow-hidden">
                          <div
                            className="h-full rounded-full bg-brand transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 whitespace-nowrap font-black text-textPrimary">
                        {formatPrice(Number(order.amount), order.currency || 'INR')}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : isPending ? (
                            <CreditCard className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          <span>{order.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                        {order.couponBatch ? (
                          <button
                            type="button"
                            onClick={() => handleOpenBatchDetail(order.couponBatch!.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand text-white font-extrabold text-xs shadow-xs hover:bg-brandHover transition cursor-pointer"
                          >
                            <Ticket className="h-3.5 w-3.5" />
                            <span>View Coupons</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            Invoice Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination Footer */}
        {filteredOrders.length > 0 && (
          <div className="p-4 sm:px-6 border-t border-borderLight flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-textMuted font-bold">
            <div>
              Showing{' '}
              <span className="font-extrabold text-textPrimary">
                {(currentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-extrabold text-textPrimary">
                {Math.min(currentPage * pageSize, filteredOrders.length)}
              </span>{' '}
              of{' '}
              <span className="font-extrabold text-textPrimary">
                {filteredOrders.length}
              </span>{' '}
              seat orders
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

      {/* Request Seats Modal */}
      {isRequestModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRequestModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="border-b border-borderLight pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-textPrimary">
                  Request Program Seat Allocation
                </h3>
                <p className="text-xs text-textMuted mt-0.5">
                  Select program and number of seats for your cohort.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1.5 text-textMuted hover:text-textPrimary rounded-full hover:bg-bgSoft cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSeatOrder} className="space-y-4">
              <SearchableSelect
                label="Select Internship Program"
                required
                placeholder="Search & choose program..."
                searchPlaceholder="Type program title..."
                value={selectedProgramId}
                onChange={(val) => {
                  const numVal = Number(val);
                  setSelectedProgramId(numVal);
                  handleProgramOrSeatsChange(numVal, Number(seatsCount));
                }}
                options={programs.map((p) => ({
                  value: p.id,
                  label: p.title,
                  subLabel: p.clusterName || 'Internship Track',
                  badge: p.durationHours ? `${p.durationHours}h` : '120h',
                  icon: <Ticket className="h-4 w-4" />,
                }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-textPrimary">
                    Number of Seats <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={seatsCount}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      setSeatsCount(count);
                      if (selectedProgramId) {
                        handleProgramOrSeatsChange(Number(selectedProgramId), count);
                      }
                    }}
                    className="mt-1.5 w-full rounded-xl border border-borderLight bg-bgBody px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-textPrimary flex items-center justify-between">
                    <span>Estimated PO Amount (₹)</span>
                    <span className="text-[10px] text-textMuted font-medium">(Auto-calculated)</span>
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    readOnly
                    tabIndex={-1}
                    placeholder="Auto-calculated from seats"
                    className="mt-1.5 w-full rounded-xl border border-borderLight bg-bgSoft/80 px-3.5 py-2.5 text-xs font-black text-textPrimary cursor-not-allowed select-none focus:outline-none"
                  />
                  {customAmount !== '' && (
                    <div className="text-[10px] text-brand font-extrabold mt-1">
                      {formatPrice(Number(customAmount), 'INR')}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-textPrimary">
                  Invoice / PO Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PO-CAMPUS-2026-08"
                  value={invoiceRef}
                  onChange={(e) => setInvoiceRef(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-borderLight bg-bgBody px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-xs font-extrabold text-white shadow-md hover:bg-brandHover transition cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Submit Seat Request</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
