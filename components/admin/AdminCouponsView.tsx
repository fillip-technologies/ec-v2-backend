'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
  Ticket,
  Copy,
  Download,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  ShieldCheck,
  Ban,
  FileCheck,
  Edit2,
} from 'lucide-react';
import {
  getSeatOrders,
  confirmSeatOrderPayment,
  rejectSeatOrder,
  getCouponBatch,
  createSeatOrder,
  SeatOrder,
  CouponBatchDetail,
} from '@/lib/api/payment';
import { getAdminColleges } from '@/lib/api/admin';
import { getPrograms } from '@/lib/api/catalog';
import { formatPrice } from '@/lib/utils/currency';
import { showToast } from '@/lib/toast';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { CouponBatchInspector } from '@/components/shared/CouponBatchInspector';

export const AdminCouponsView: React.FC = () => {
  const [seatOrders, setSeatOrders] = useState<SeatOrder[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Direct Issue Coupon Batch Modal State (Admin-initiated)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState<boolean>(false);
  const [issueCollegeId, setIssueCollegeId] = useState<number | ''>('');
  const [issueProgramId, setIssueProgramId] = useState<number | ''>('');
  const [issueSeatsCount, setIssueSeatsCount] = useState<number>(50);
  const [issueAmount, setIssueAmount] = useState<number | ''>('');
  const [issuePrefix, setIssuePrefix] = useState<string>('');
  const [issueInvoiceRef, setIssueInvoiceRef] = useState<string>('');
  const [issueMode, setIssueMode] = useState<'IMMEDIATE' | 'PENDING'>('IMMEDIATE');
  const [issuingBatch, setIssuingBatch] = useState<boolean>(false);

  // Review & Approval Modal State (For Pending Orders)
  const [reviewOrder, setReviewOrder] = useState<SeatOrder | null>(null);
  const [reviewSeats, setReviewSeats] = useState<number>(0);
  const [reviewAmount, setReviewAmount] = useState<number>(0);
  const [reviewPrefix, setReviewPrefix] = useState<string>('');
  const [reviewInvoiceRef, setReviewInvoiceRef] = useState<string>('');
  const [confirmingPayment, setConfirmingPayment] = useState<boolean>(false);
  const [rejectingOrder, setRejectingOrder] = useState<boolean>(false);

  // Batch Detail Modal State
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [batchDetail, setBatchDetail] = useState<CouponBatchDetail | null>(null);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [ordersData, collegesData, progsData] = await Promise.all([
        getSeatOrders(),
        getAdminColleges().catch(() => []),
        getPrograms().catch(() => []),
      ]);

      setSeatOrders(Array.isArray(ordersData) ? ordersData : []);
      setColleges(Array.isArray(collegesData) ? collegesData : []);
      setPrograms(Array.isArray(progsData) ? progsData : []);

      if (collegesData && collegesData.length > 0 && issueCollegeId === '') {
        setIssueCollegeId(collegesData[0].id);
      }
      if (progsData && progsData.length > 0 && issueProgramId === '') {
        setIssueProgramId(progsData[0].id);
        const p = progsData[0];
        const unit = p.pricings?.[0]?.amount ? Number(p.pricings[0].amount) : 4999;
        setIssueAmount(unit * 50);
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to fetch seat orders', 'Error');
      setSeatOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update default suggested amount when program or seat count changes
  const handleProgramOrSeatsChange = (progId: number, seats: number) => {
    const selected = programs.find((p) => p.id === progId);
    const unitPrice = selected?.pricings?.[0]?.amount
      ? Number(selected.pricings[0].amount)
      : 4999;
    setIssueAmount(unitPrice * seats);
  };

  const handleIssueBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueCollegeId || !issueProgramId) {
      showToast.error('Please select both a partner college and an internship program.', 'Validation Error');
      return;
    }

    try {
      setIssuingBatch(true);
      const isAutoConfirm = issueMode === 'IMMEDIATE';
      const res = await createSeatOrder({
        collegeId: Number(issueCollegeId),
        programId: Number(issueProgramId),
        seatsPurchased: Number(issueSeatsCount),
        amount: issueAmount !== '' ? Number(issueAmount) : undefined,
        autoGenerateCoupons: isAutoConfirm,
        batchCodePrefix: issuePrefix.trim() || undefined,
        invoiceRef: issueInvoiceRef.trim() || undefined,
      });

      showToast.success(
        res.message || (isAutoConfirm
          ? `Generated ${issueSeatsCount} single-use coupon codes!`
          : `Created pending seat order #${res.id} for college invoice tracking.`),
        isAutoConfirm ? 'Batch Generated' : 'Pending Order Created',
      );

      setIsIssueModalOpen(false);
      setIssuePrefix('');
      setIssueInvoiceRef('');
      await fetchOrders();

      if (isAutoConfirm && res.couponBatch?.id) {
        handleOpenBatch(res.couponBatch.id);
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to create seat order.', 'Creation Failed');
    } finally {
      setIssuingBatch(false);
    }
  };

  // Open Review & Confirmation Modal for Pending Order
  const handleOpenReviewModal = (order: SeatOrder) => {
    setReviewOrder(order);
    setReviewSeats(order.seatsPurchased);
    setReviewAmount(Number(order.amount));
    setReviewPrefix(`EC-${order.college?.name.substring(0, 4).toUpperCase() || 'CAMPUS'}`);
    setReviewInvoiceRef(order.invoiceRef || `INV-${Date.now()}`);
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;

    try {
      setConfirmingPayment(true);
      const res = await confirmSeatOrderPayment(reviewOrder.id, {
        seatsPurchased: Number(reviewSeats),
        amount: Number(reviewAmount),
        batchCodePrefix: reviewPrefix.trim() || undefined,
        invoiceRef: reviewInvoiceRef.trim() || undefined,
      });

      showToast.success(
        res.message || `Order confirmed! Generated ${reviewSeats} coupons.`,
        'Payment Verified & Activated',
      );

      setReviewOrder(null);
      await fetchOrders();

      if (res.batchId) {
        handleOpenBatch(res.batchId);
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to confirm order payment', 'Confirmation Error');
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleRejectReview = async () => {
    if (!reviewOrder) return;
    const reason = window.prompt(
      `Reject Seat Order #${reviewOrder.id} for ${reviewOrder.college?.name}?\nEnter cancellation reason:`,
      'Invoice payment expired or cancelled by college',
    );
    if (reason === null) return; // User cancelled prompt

    try {
      setRejectingOrder(true);
      await rejectSeatOrder(reviewOrder.id, { reason: reason || 'Cancelled by Admin' });
      showToast.info(`Seat order #${reviewOrder.id} has been marked as rejected.`, 'Order Rejected');
      setReviewOrder(null);
      await fetchOrders();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to reject seat order', 'Action Error');
    } finally {
      setRejectingOrder(false);
    }
  };

  const handleOpenBatch = async (batchId: number) => {
    setSelectedBatchId(batchId);
    setBatchLoading(true);
    try {
      const data = await getCouponBatch(batchId);
      setBatchDetail(data);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load batch detail', 'Error');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast.success(`Copied "${code}" to clipboard!`, 'Code Copied');
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
      const collegeName = order.college?.name || '';
      const programTitle = order.program?.title || '';
      const orderIdStr = String(order.id);
      const invoiceRef = order.invoiceRef || '';
      const batchCode = order.couponBatch?.batchCode || '';

      const matchesSearch =
        !searchQuery.trim() ||
        collegeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        programTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orderIdStr.includes(searchQuery) ||
        invoiceRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batchCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PAID' && order.status === 'PAID') ||
        (statusFilter === 'PENDING' && order.status === 'PENDING') ||
        (statusFilter === 'FAILED' && (order.status === 'FAILED' || order.status === 'REFUNDED'));

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
  const pendingApprovals = seatOrders.filter((o) => o.status === 'PENDING').length;

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
      {/* Header Banner */}
      <div className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand">
            <ShieldCheck className="h-4 w-4" />
            <span>Admin Governance & B2B Seat Management</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-textPrimary tracking-tight">
            Institutional Seat Orders & Coupon Batches
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Review college seat requests, verify invoices, approve custom allocations, and govern single-use coupon cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsIssueModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white text-xs font-extrabold shadow-md hover:bg-brandHover transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Issue / Create Seat Order</span>
          </button>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-bgSoft hover:bg-borderLight text-textPrimary text-xs font-extrabold transition cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span>Refresh</span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <span>Total Seats Governed</span>
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

        <div
          onClick={() => setStatusFilter('PENDING')}
          className={`rounded-[22px] border bg-white p-5 shadow-xs cursor-pointer transition ${
            pendingApprovals > 0 ? 'border-amber-300 ring-2 ring-amber-100' : 'border-borderLight'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span>Awaiting Admin Review</span>
          </div>
          <div className={`mt-2 text-2xl font-black ${pendingApprovals > 0 ? 'text-amber-600' : 'text-textPrimary'}`}>
            {pendingApprovals} {pendingApprovals > 0 && <span className="text-xs font-bold text-amber-500">Action Required</span>}
          </div>
        </div>
      </div>

      {/* DataTable Container */}
      <div className="rounded-[28px] border border-borderLight bg-white shadow-xs overflow-hidden">
        {/* Table Search & Filter Toolbar */}
        <div className="p-4 sm:p-6 border-b border-borderLight flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 bg-bgBody/30">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by college, program, invoice ref, batch code..."
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

          {/* Filter Pills */}
          <div className="flex items-center rounded-xl border border-borderLight bg-white p-1 text-xs font-bold self-start sm:self-auto">
            {[
              { id: 'ALL', label: 'All Orders' },
              { id: 'PENDING', label: `Pending (${pendingApprovals})` },
              { id: 'PAID', label: 'Approved & Active' },
              { id: 'FAILED', label: 'Rejected' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setStatusFilter(st.id);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg transition text-[11px] font-extrabold cursor-pointer ${
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

        {/* Table Body */}
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-brand mx-auto mb-2" />
            <p className="text-xs font-bold text-textMuted">Loading institutional governance ledger...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-bgSoft text-textMuted flex items-center justify-center mx-auto">
              <ShieldCheck className="h-6 w-6 text-brand" />
            </div>
            <h3 className="text-sm font-black text-textPrimary">No Orders Matching Filters</h3>
            <p className="text-xs text-textMuted max-w-sm mx-auto">
              All institutional requests are reconciled or no entries match your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borderLight bg-bgBody/50 text-[11px] font-black uppercase tracking-wider text-textMuted">
                  <th className="py-3.5 px-4 sm:px-6">Order ID & PO Ref</th>
                  <th className="py-3.5 px-4">Partner College</th>
                  <th className="py-3.5 px-4">Internship Program</th>
                  <th className="py-3.5 px-4">Seats & Progress</th>
                  <th className="py-3.5 px-4">Agreed Amount</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight text-xs font-medium">
                {paginatedOrders.map((order) => {
                  const isPaid = order.status === 'PAID';
                  const isPending = order.status === 'PENDING';
                  const isFailed = order.status === 'FAILED' || order.status === 'REFUNDED';
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
                          <div className="font-mono text-[10px] text-textMuted truncate max-w-[160px]" title={order.invoiceRef}>
                            {order.invoiceRef}
                          </div>
                        )}
                      </td>

                      {/* College */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-extrabold text-textPrimary">
                          <Building className="h-3.5 w-3.5 text-brand shrink-0" />
                          <span>{order.college?.name || 'Partner College'}</span>
                        </div>
                      </td>

                      {/* Program */}
                      <td className="py-4 px-4 max-w-[240px]">
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
                          {isPaid && (
                            <span className="text-[10px] text-textMuted font-bold">
                              ({progressPct}%)
                            </span>
                          )}
                        </div>
                        {/* Mini Progress Bar */}
                        {isPaid && (
                          <div className="mt-1.5 h-1.5 w-24 rounded-full bg-bgSoft overflow-hidden">
                            <div
                              className="h-full rounded-full bg-brand transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        )}
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
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : isPending ? (
                            <AlertCircle className="h-3 w-3" />
                          ) : (
                            <Ban className="h-3 w-3" />
                          )}
                          <span>{isPending ? 'Pending Review' : isPaid ? 'Approved & Paid' : 'Rejected'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          {isPending ? (
                            <button
                              type="button"
                              onClick={() => handleOpenReviewModal(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand hover:bg-brandHover text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
                            >
                              <FileCheck className="h-3.5 w-3.5" />
                              <span>Review & Confirm</span>
                            </button>
                          ) : isPaid && order.couponBatch ? (
                            <button
                              type="button"
                              onClick={() => handleOpenBatch(order.couponBatch!.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bgSoft hover:bg-borderLight text-textPrimary font-extrabold text-xs transition cursor-pointer"
                            >
                              <Ticket className="h-3.5 w-3.5 text-brand" />
                              <span>Inspect Coupons</span>
                            </button>
                          ) : isFailed ? (
                            <span className="text-[11px] text-textMuted font-bold italic">
                              No action required
                            </span>
                          ) : null}
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

                {(() => {
                  const maxButtons = 5;
                  let start = Math.max(1, currentPage - 2);
                  let end = Math.min(totalPages, start + maxButtons - 1);
                  if (end - start + 1 < maxButtons) {
                    start = Math.max(1, end - maxButtons + 1);
                  }
                  const pages = [];
                  for (let i = start; i <= end; i++) pages.push(i);

                  return (
                    <>
                      {start > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCurrentPage(1)}
                            className="h-8 w-8 rounded-lg text-xs font-black border border-borderLight bg-white text-textPrimary hover:bg-bgSoft transition cursor-pointer"
                          >
                            1
                          </button>
                          {start > 2 && <span className="px-1 text-xs text-textMuted font-black">...</span>}
                        </>
                      )}
                      {pages.map((pg) => (
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
                      {end < totalPages && (
                        <>
                          {end < totalPages - 1 && <span className="px-1 text-xs text-textMuted font-black">...</span>}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(totalPages)}
                            className="h-8 w-8 rounded-lg text-xs font-black border border-borderLight bg-white text-textPrimary hover:bg-bgSoft transition cursor-pointer"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </>
                  );
                })()}

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

      {/* 1. Admin Direct Issue / Create Seat Order Modal */}
      {isIssueModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsIssueModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="border-b border-borderLight pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-textPrimary flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-brand" />
                  Issue Institutional Seat Order
                </h3>
                <p className="text-xs text-textMuted mt-0.5">
                  Create a seat allocation order for a partner college.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsIssueModalOpen(false)}
                className="p-1.5 text-textMuted hover:text-textPrimary rounded-full hover:bg-bgSoft cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleIssueBatch} className="space-y-4">
              <SearchableSelect
                label="Select Partner College"
                required
                placeholder="Search & choose college..."
                searchPlaceholder="Type college name or code..."
                value={issueCollegeId}
                onChange={(val) => setIssueCollegeId(Number(val))}
                options={colleges.map((c) => ({
                  value: c.id,
                  label: c.name,
                  badge: c.code || `#${c.id}`,
                  icon: <Building className="h-4 w-4" />,
                }))}
              />

              <SearchableSelect
                label="Select Internship Program"
                required
                placeholder="Search & choose program..."
                searchPlaceholder="Type program title or track..."
                value={issueProgramId}
                onChange={(val) => {
                  const numVal = Number(val);
                  setIssueProgramId(numVal);
                  handleProgramOrSeatsChange(numVal, Number(issueSeatsCount));
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
                    max={1000}
                    value={issueSeatsCount}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      setIssueSeatsCount(count);
                      if (issueProgramId) {
                        handleProgramOrSeatsChange(Number(issueProgramId), count);
                      }
                    }}
                    className="mt-1.5 w-full rounded-xl border border-borderLight bg-bgBody px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-textPrimary">
                    Agreed Total Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={issueAmount}
                    onChange={(e) => setIssueAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 50000"
                    className="mt-1.5 w-full rounded-xl border border-borderLight bg-bgBody px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand"
                    required
                  />
                  {issueAmount !== '' && (
                    <div className="text-[10px] text-brand font-extrabold mt-1">
                      {formatPrice(Number(issueAmount), 'INR')}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-textPrimary">
                    Custom Prefix (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EC-VIT"
                    value={issuePrefix}
                    onChange={(e) => setIssuePrefix(e.target.value.toUpperCase())}
                    className="mt-1.5 w-full rounded-xl border border-borderLight bg-bgBody px-3.5 py-2.5 text-xs font-bold text-textPrimary uppercase focus:border-brand"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-textPrimary">
                    Invoice / Bank PO Ref (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-08-01"
                    value={issueInvoiceRef}
                    onChange={(e) => setIssueInvoiceRef(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-borderLight bg-bgBody px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand"
                  />
                </div>
              </div>

              {/* Admin Governance Choice */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-textPrimary block">
                  Workflow Execution Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIssueMode('IMMEDIATE')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      issueMode === 'IMMEDIATE'
                        ? 'border-brand bg-brand/5 ring-1 ring-brand'
                        : 'border-borderLight bg-bgSoft/40 hover:bg-bgSoft'
                    }`}
                  >
                    <div className="text-xs font-black text-textPrimary flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
                      <span>Instant Confirm</span>
                    </div>
                    <p className="text-[10px] text-textMuted mt-0.5">
                      Payment verified. Generate coupon codes immediately.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIssueMode('PENDING')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      issueMode === 'PENDING'
                        ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500'
                        : 'border-borderLight bg-bgSoft/40 hover:bg-bgSoft'
                    }`}
                  >
                    <div className="text-xs font-black text-textPrimary flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      <span>Save as Pending</span>
                    </div>
                    <p className="text-[10px] text-textMuted mt-0.5">
                      Raise invoice and wait for college bank clearance.
                    </p>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-borderLight bg-bgSoft text-textPrimary font-extrabold text-xs hover:bg-borderLight transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={issuingBatch}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-xs font-extrabold text-white shadow-md hover:bg-brandHover transition cursor-pointer"
                >
                  {issuingBatch ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>{issueMode === 'IMMEDIATE' ? 'Generate & Activate' : 'Create Pending Order'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Admin Review & Approve Modal (For Governance of Pending Requests) */}
      {reviewOrder && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setReviewOrder(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="border-b border-borderLight pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-textPrimary flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-brand" />
                  Audit & Approve Seat Order #{reviewOrder.id}
                </h3>
                <p className="text-xs text-textMuted mt-0.5">
                  Verify payment receipt before activating coupon batch generation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewOrder(null)}
                className="p-1.5 text-textMuted hover:text-textPrimary rounded-full hover:bg-bgSoft cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Request Summary Card */}
            <div className="rounded-2xl border border-borderLight bg-bgSoft/60 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-textMuted font-bold">Partner Campus:</span>
                <span className="font-black text-textPrimary">{reviewOrder.college?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textMuted font-bold">Internship Track:</span>
                <span className="font-extrabold text-textPrimary truncate max-w-[240px]">
                  {reviewOrder.program?.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-textMuted font-bold">Requested On:</span>
                <span className="font-mono text-textPrimary">
                  {new Date(reviewOrder.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmReview} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-textPrimary">
                    Approved Seats Count <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={reviewSeats}
                    onChange={(e) => setReviewSeats(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-borderLight bg-bgBody px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-textPrimary">
                    Final Invoice Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={reviewAmount}
                    onChange={(e) => setReviewAmount(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-borderLight bg-bgBody px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-textPrimary">
                    Batch Code Prefix
                  </label>
                  <input
                    type="text"
                    value={reviewPrefix}
                    onChange={(e) => setReviewPrefix(e.target.value.toUpperCase())}
                    className="mt-1.5 w-full rounded-xl border border-borderLight bg-bgBody px-3.5 py-2.5 text-xs font-bold text-textPrimary uppercase focus:border-brand"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-textPrimary">
                    Bank Ref / Invoice No.
                  </label>
                  <input
                    type="text"
                    value={reviewInvoiceRef}
                    onChange={(e) => setReviewInvoiceRef(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-borderLight bg-bgBody px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                  <span>Admin Confirmation Gate</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Clicking confirm will mark the invoice as PAID and generate {reviewSeats} single-use coupon codes for the college cohort.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRejectReview}
                  disabled={rejectingOrder}
                  className="px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-extrabold text-xs hover:bg-rose-100 transition cursor-pointer"
                >
                  {rejectingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Reject Request</span>}
                </button>

                <button
                  type="submit"
                  disabled={confirmingPayment}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
                >
                  {confirmingPayment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Confirm Payment & Issue Coupons</span>
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
