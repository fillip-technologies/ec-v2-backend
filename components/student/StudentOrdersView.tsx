'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
  Gift,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';
import { getStudentOrders } from '@/lib/api/payment';
import { formatPrice } from '@/lib/utils/currency';
import { showToast } from '@/lib/toast';

interface StudentOrdersViewProps {
  onNavigateProgram?: () => void;
}

export const StudentOrdersView: React.FC<StudentOrdersViewProps> = ({
  onNavigateProgram,
}) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Selected Order for Receipt Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getStudentOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load order history', 'Load Error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const isCoupon = Boolean(order.couponId || order.coupon?.code || Number(order.amount) === 0);
      const programTitle = order.program?.title || '';
      const orderIdStr = String(order.id);
      const couponCode = order.coupon?.code || '';
      const txnId = order.payments?.[0]?.gatewayPaymentId || '';

      // Text search
      const matchesSearch =
        !searchQuery.trim() ||
        programTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orderIdStr.includes(searchQuery) ||
        couponCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txnId.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === 'ALL' || order.status?.toUpperCase() === statusFilter;

      // Method filter
      const matchesMethod =
        methodFilter === 'ALL' ||
        (methodFilter === 'COUPON' && isCoupon) ||
        (methodFilter === 'RAZORPAY' && !isCoupon);

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [orders, searchQuery, statusFilter, methodFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Overall counts
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.status === 'PAID').length;
  const totalSpent = orders
    .filter((o) => o.status === 'PAID')
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand">
            <Receipt className="h-4 w-4" />
            <span>Transaction Ledger</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-textPrimary tracking-tight">
            My Orders & Invoices
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Complete records of your direct payments, institutional coupons, and enrolment receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-bgSoft hover:bg-borderLight text-textPrimary text-xs font-extrabold transition cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <span>Refresh Ledger</span>
          )}
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[22px] border border-borderLight bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <CreditCard className="h-4 w-4 text-brand" />
            <span>Total Placed Orders</span>
          </div>
          <div className="mt-2 text-2xl font-black text-textPrimary">
            {totalOrders}
          </div>
        </div>

        <div className="rounded-[22px] border border-borderLight bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Paid & Active Enrolments</span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {paidOrders}
          </div>
        </div>

        <div className="rounded-[22px] border border-borderLight bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <Receipt className="h-4 w-4 text-brand" />
            <span>Total Tuition Settled</span>
          </div>
          <div className="mt-2 text-2xl font-black text-textPrimary">
            ₹{totalSpent.toLocaleString()}
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
              placeholder="Search by program, order ID, coupon, txn..."
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
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Selector */}
            <div className="flex items-center rounded-xl border border-borderLight bg-white p-1 text-xs font-bold">
              {['ALL', 'PAID', 'PENDING'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg transition text-[11px] font-extrabold cursor-pointer ${
                    statusFilter === st
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Method Selector */}
            <div className="flex items-center rounded-xl border border-borderLight bg-white p-1 text-xs font-bold">
              {[
                { label: 'All Methods', val: 'ALL' },
                { label: 'Razorpay', val: 'RAZORPAY' },
                { label: 'Coupons', val: 'COUPON' },
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => {
                    setMethodFilter(m.val);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg transition text-[11px] font-extrabold cursor-pointer ${
                    methodFilter === m.val
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-brand mx-auto mb-2" />
            <p className="text-xs font-bold text-textMuted">Loading datatable...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-bgSoft text-textMuted flex items-center justify-center mx-auto">
              <Receipt className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-black text-textPrimary">No Matching Orders</h3>
            <p className="text-xs text-textMuted max-w-sm mx-auto">
              No orders matched your active search and filter criteria. Try resetting your search query.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setMethodFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-brand text-white font-extrabold text-xs hover:bg-brandHover transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borderLight bg-bgBody/50 text-[11px] font-black uppercase tracking-wider text-textMuted">
                  <th className="py-3.5 px-4 sm:px-6">Order ID</th>
                  <th className="py-3.5 px-4">Internship Program</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight text-xs font-medium">
                {paginatedOrders.map((order) => {
                  const isPaid = order.status === 'PAID';
                  const isPending = order.status === 'PENDING';
                  const isCoupon = Boolean(
                    order.couponId || order.coupon?.code || Number(order.amount) === 0,
                  );
                  const latestPayment = order.payments?.[0];

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-bgSoft/40 transition-colors group"
                    >
                      {/* Order ID */}
                      <td className="py-4 px-4 sm:px-6 font-mono font-black text-textPrimary">
                        #{order.id}
                      </td>

                      {/* Program Title */}
                      <td className="py-4 px-4 max-w-[260px]">
                        <div className="font-extrabold text-textPrimary truncate" title={order.program?.title}>
                          {order.program?.title || 'Internship Track'}
                        </div>
                        <div className="text-[10px] text-textMuted">
                          120-Hour Track
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-textMuted">
                        <div>
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-textMuted font-mono">
                          {new Date(order.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isCoupon ? (
                          <div className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                            <Gift className="h-3 w-3 text-emerald-600" />
                            <span className="font-mono">
                              {order.coupon?.code || 'INSTITUTIONAL'}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-brand bg-brandSoft px-2.5 py-1 rounded-lg text-[11px] font-bold">
                            <CreditCard className="h-3 w-3" />
                            <span>Razorpay</span>
                          </div>
                        )}
                        {latestPayment?.gatewayPaymentId && (
                          <div className="text-[10px] font-mono text-textMuted mt-0.5">
                            {latestPayment.gatewayPaymentId}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 whitespace-nowrap font-extrabold text-textPrimary">
                        {isCoupon && Number(order.amount) === 0 ? (
                          <span className="text-emerald-600 font-black">
                            ₹0 (Free Seat)
                          </span>
                        ) : (
                          <span className="text-textPrimary font-black">
                            {formatPrice(Number(order.amount), order.currency || 'INR')}
                          </span>
                        )}
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
                            <Clock className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          <span>{order.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg text-textMuted hover:text-textPrimary hover:bg-bgSoft transition cursor-pointer"
                            title="View Receipt"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {isPaid && onNavigateProgram && (
                            <button
                              type="button"
                              onClick={onNavigateProgram}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white font-extrabold text-[11px] shadow-xs hover:bg-brandHover transition cursor-pointer"
                            >
                              <span>Workspace</span>
                              <ArrowRight className="h-3 w-3" />
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
              orders
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

      {/* Detailed Order Receipt Modal */}
      {selectedOrder && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-borderLight pb-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-brand">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Verified Order Receipt</span>
                </div>
                <h3 className="text-xl font-black text-textPrimary mt-0.5">
                  Order #{selectedOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-textMuted hover:text-textPrimary rounded-full hover:bg-bgSoft cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-borderLight bg-bgSoft/50 p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center text-textMuted">
                <span>Program</span>
                <span className="font-extrabold text-textPrimary text-right">
                  {selectedOrder.program?.title}
                </span>
              </div>

              <div className="flex justify-between items-center text-textMuted">
                <span>Date Placed</span>
                <span className="font-bold text-textPrimary">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-textMuted">
                <span>Status</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                    selectedOrder.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              {selectedOrder.coupon?.code && (
                <div className="flex justify-between items-center text-textMuted">
                  <span>Coupon Applied</span>
                  <span className="font-mono font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {selectedOrder.coupon.code}
                  </span>
                </div>
              )}

              {selectedOrder.payments?.[0]?.gatewayPaymentId && (
                <div className="flex justify-between items-center text-textMuted">
                  <span>Gateway Payment ID</span>
                  <span className="font-mono font-bold text-textPrimary">
                    {selectedOrder.payments[0].gatewayPaymentId}
                  </span>
                </div>
              )}

              <div className="border-t border-borderLight pt-2.5 flex justify-between items-center">
                <span className="font-black uppercase text-textPrimary">Total Paid</span>
                <span className="text-lg font-black text-brand">
                  {Number(selectedOrder.amount) === 0
                    ? '₹0 (100% Free Coupon)'
                    : formatPrice(Number(selectedOrder.amount), selectedOrder.currency || 'INR')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-3 rounded-xl border border-borderLight bg-bgSoft text-textPrimary font-extrabold text-xs hover:bg-borderLight transition cursor-pointer"
              >
                Close
              </button>
              {selectedOrder.status === 'PAID' && onNavigateProgram && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    onNavigateProgram();
                  }}
                  className="flex-1 py-3 rounded-xl bg-brand text-white font-extrabold text-xs hover:bg-brandHover transition cursor-pointer"
                >
                  Open Workspace
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
