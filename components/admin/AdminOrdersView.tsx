'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Eye,
  Download,
  RefreshCw,
  Ticket,
  TrendingUp,
  User,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { getAdminOrders } from '@/lib/api/admin';
import { formatCurrency } from '@/lib/utils/currency';
import { showToast } from '@/lib/toast';
import { StatCard, StatGrid } from '@/components/ui/StatCard';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CustomDropdown } from '@/components/shared/CustomDropdown';
import { OrderInspectorModal } from './orders/OrderInspectorModal';

export interface AdminOrderItem {
  id: number;
  studentId: number;
  programId: number;
  couponId?: number | null;
  amount: number | string;
  currency: string;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  gateway?: string | null;
  gatewayOrderId?: string | null;
  receipt?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: any;
  program?: any;
  payments?: any[];
  coupon?: any;
  enrollment?: any;
}

type SortField = 'id' | 'createdAt' | 'amount' | 'status';
type SortOrder = 'asc' | 'desc';

export const AdminOrdersView: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // DataTable State
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderItem | null>(null);

  const fetchOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminOrders({
        page: currentPage,
        limit: pageSize,
        search: searchTerm.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });

      if (res && res.data && res.meta) {
        setOrders(res.data);
        setTotalCount(res.meta.total);
        setTotalPages(res.meta.totalPages);
      } else if (Array.isArray(res)) {
        setOrders(res);
        setTotalCount(res.length);
        setTotalPages(Math.ceil(res.length / pageSize) || 1);
      }
      if (isManual) {
        showToast.success('Orders registry updated', 'Synced');
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load student orders', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize, searchTerm, statusFilter]);

  const handleSort = (field: string) => {
    const sField = field as SortField;
    if (sortField === sField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(sField);
      setSortOrder('desc');
    }
  };

  const sortedOrders = useMemo(() => {
    const list = [...orders];
    list.sort((a, b) => {
      let valA: any = a[sortField] ?? '';
      let valB: any = b[sortField] ?? '';

      if (sortField === 'amount') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else if (sortField === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [orders, sortField, sortOrder]);

  // Summary Metrics Calculations
  const metrics = useMemo(() => {
    const totalGmv = orders.reduce(
      (sum, o) => (o.status === 'PAID' ? sum + (Number(o.amount) || 0) : sum),
      0
    );
    const paidCount = orders.filter((o) => o.status === 'PAID').length;
    const couponCount = orders.filter((o) => o.couponId !== null && o.couponId !== undefined).length;
    const failedCount = orders.filter((o) => o.status === 'FAILED' || o.status === 'PENDING').length;

    return { totalGmv, paidCount, couponCount, failedCount };
  }, [orders]);

  const handleExportCSV = () => {
    if (orders.length === 0) {
      showToast.error('No orders available to export', 'Export Error');
      return;
    }

    const headers = ['Order ID', 'Date', 'Student Name', 'Email', 'College', 'Program', 'Amount', 'Currency', 'Status', 'Gateway'];
    const rows = orders.map((o) => [
      `#${o.id}`,
      new Date(o.createdAt).toISOString().slice(0, 10),
      o.student?.firstName ? `${o.student.firstName} ${o.student.lastName || ''}`.trim() : 'Unknown',
      o.student?.user?.email || 'N/A',
      o.student?.college?.name || o.student?.customCollegeName || 'Direct',
      o.program?.title || 'Program Item',
      o.amount,
      o.currency,
      o.status,
      o.gateway || 'Razorpay',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `orders_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success('Orders exported as CSV', 'Exported');
  };

  const columns: ColumnDef<AdminOrderItem>[] = [
    {
      key: 'id',
      header: 'Order Ref',
      sortable: true,
      render: (o) => (
        <div>
          <span className="font-mono font-black text-textPrimary text-xs">
            #{o.id}
          </span>
          <div className="text-[10px] text-textMuted font-bold">
            {new Date(o.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: 'studentName',
      header: 'Student & Institution',
      render: (o) => {
        const name = o.student?.firstName
          ? `${o.student.firstName} ${o.student.lastName || ''}`.trim()
          : 'Direct Student';
        const college = o.student?.college?.name || o.student?.customCollegeName || 'Direct Checkout';
        return (
          <div>
            <div className="font-bold text-textPrimary text-xs flex items-center gap-1.5">
              <User className="h-3 w-3 text-textMuted shrink-0" />
              <span>{name}</span>
            </div>
            <div className="text-[11px] text-textMuted flex items-center gap-1 mt-0.5">
              <Building className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[180px]">{college}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'programTitle',
      header: 'Program Track',
      render: (o) => (
        <div className="font-bold text-textPrimary text-xs line-clamp-1 max-w-[200px]">
          {o.program?.title || 'Internship Program'}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Order Amount',
      sortable: true,
      render: (o) => (
        <div>
          <div className="font-black text-textPrimary text-xs">
            {formatCurrency(Number(o.amount), o.currency || 'INR')}
          </div>
          {o.coupon && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-brand bg-brand/5 px-1.5 py-0.2 rounded border border-brand/20 mt-0.5">
              <Ticket className="h-2.5 w-2.5" /> Coupon Applied
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Payment Status',
      sortable: true,
      align: 'center',
      render: (o) => <StatusBadge status={o.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (o) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(o);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-borderLight bg-white text-xs font-bold text-textPrimary hover:bg-brand hover:text-white hover:border-brand shadow-2xs transition cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Inspect</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-borderLight shadow-xs">
        <div>
          <h1 className="text-xl font-black text-textPrimary flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-brand" />
            Student Orders & Payment Telemetry
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Reconcile live checkouts, inspect payment attempts, track coupon claims, and audit transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2 text-xs font-bold text-textPrimary hover:bg-borderLight transition cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-textMuted" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-borderLight bg-white px-3.5 py-2 text-xs font-bold text-textPrimary hover:bg-bgSoft hover:text-brand transition cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <StatGrid cols={4}>
        <StatCard
          title="Active Page GMV"
          value={formatCurrency(metrics.totalGmv, 'INR')}
          subValue="Gross Transaction Volume on Page"
          icon={<TrendingUp className="h-4 w-4" />}
          tone="emerald"
        />
        <StatCard
          title="Paid Orders"
          value={metrics.paidCount}
          subValue="Successfully reconciled checkouts"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="emerald"
        />
        <StatCard
          title="Coupon Orders"
          value={metrics.couponCount}
          subValue="100% discount / seat claims"
          icon={<Ticket className="h-4 w-4" />}
          tone="brand"
        />
        <StatCard
          title="Pending / Failed"
          value={metrics.failedCount}
          subValue="Payment gateway drops or failures"
          icon={<Clock className="h-4 w-4" />}
          tone="amber"
        />
      </StatGrid>

      {/* Main DataTable */}
      <DataTable
        data={sortedOrders}
        columns={columns}
        keyExtractor={(o) => o.id}
        searchPlaceholder="Search by student, email, USN, college, or order #..."
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSort}
        loading={loading}
        onRowClick={(o) => setSelectedOrder(o)}
        headerActions={
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <span>Status:</span>
            <div className="w-28">
              <CustomDropdown
                options={['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED']}
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(String(val));
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        }
        pagination={{
          currentPage,
          totalPages,
          totalCount,
          pageSize,
          pageSizeOptions: [10, 25, 50],
          onPageChange: setCurrentPage,
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          },
          itemLabel: 'student orders',
        }}
        emptyTitle="No Orders Found"
        emptyDescription={
          searchTerm || statusFilter !== 'ALL'
            ? 'No orders match your filter criteria.'
            : 'No student orders recorded yet.'
        }
        emptyIcon={<CreditCard className="h-7 w-7 text-textMuted/40" />}
      />

      {/* Order Inspector Modal */}
      {selectedOrder && (
        <OrderInspectorModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
