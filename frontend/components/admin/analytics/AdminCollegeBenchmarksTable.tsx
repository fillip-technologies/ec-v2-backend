'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Award, RefreshCw } from 'lucide-react';
import { getAdminAnalyticsColleges } from '@/lib/api/admin';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/utils/currency';

export const AdminCollegeBenchmarksTable: React.FC = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Sorting
  const [sortField, setSortField] = useState<string>('totalRevenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchColleges = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminAnalyticsColleges({
        page: currentPage,
        limit: pageSize,
        search: searchTerm.trim() || undefined,
      });

      if (res && res.data && res.meta) {
        setColleges(res.data);
        setTotalCount(res.meta.total);
        setTotalPages(res.meta.totalPages);
      } else if (Array.isArray(res)) {
        setColleges(res);
        setTotalCount(res.length);
        setTotalPages(Math.ceil(res.length / pageSize) || 1);
      }
    } catch (err) {
      console.error('Failed to fetch college benchmarks:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [currentPage, pageSize, searchTerm]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedColleges = [...colleges].sort((a, b) => {
    let valA = a[sortField] ?? '';
    let valB = b[sortField] ?? '';

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const columns: ColumnDef<any>[] = [
    {
      key: 'name',
      header: 'College / University',
      sortable: true,
      render: (c) => (
        <div className="font-bold text-textPrimary flex items-center gap-2">
          <Building2 className="h-4 w-4 text-brand shrink-0" />
          <span>{c.name}</span>
        </div>
      ),
    },
    {
      key: 'seatsBought',
      header: 'Seats Bought',
      sortable: true,
      render: (c) => <span className="font-bold">{c.seatsBought}</span>,
    },
    {
      key: 'redeemedSeats',
      header: 'Redeemed',
      sortable: true,
      render: (c) => <span className="font-bold">{c.redeemedSeats}</span>,
    },
    {
      key: 'seatUtilizationPct',
      header: 'Seat Util. %',
      sortable: true,
      render: (c) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md font-extrabold text-[11px] ${c.seatUtilizationPct >= 75
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : c.seatUtilizationPct >= 50
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
        >
          {c.seatUtilizationPct}%
        </span>
      ),
    },
    {
      key: 'avgScore',
      header: 'Avg Score',
      sortable: true,
      render: (c) => <span className="font-bold">{c.avgScore} / 100</span>,
    },
    {
      key: 'certCount',
      header: 'Passed Certs',
      sortable: true,
      render: (c) => (
        <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
          <Award className="h-3.5 w-3.5 text-emerald-500" />
          {c.certCount}
        </span>
      ),
    },
    {
      key: 'totalRevenue',
      header: 'Revenue (INR)',
      sortable: true,
      align: 'right',
      render: (c) => (
        <span className="font-black text-textPrimary">
          {formatCurrency(c.totalRevenue, 'INR')}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={sortedColleges}
      columns={columns}
      keyExtractor={(c) => c.id}
      title="5. B2B Institutional Cohort Benchmarks"
      searchPlaceholder="Search partner college..."
      searchValue={searchTerm}
      onSearchChange={(val) => {
        setSearchTerm(val);
        setCurrentPage(1);
      }}
      sortField={sortField}
      sortOrder={sortOrder}
      onSortChange={handleSort}
      loading={loading}
      headerActions={
        <button
          onClick={() => fetchColleges(true)}
          disabled={refreshing || loading}
          className="p-2 rounded-xl border border-borderLight hover:bg-bgSoft text-textMuted hover:text-brand transition cursor-pointer disabled:opacity-50"
          title="Refresh Benchmarks"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand' : ''}`} />
        </button>
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
        itemLabel: 'partner institutions',
      }}
      emptyTitle="No Institutions Found"
      emptyDescription={
        searchTerm
          ? 'No partner colleges match your search keyword.'
          : 'No partner colleges registered yet.'
      }
      emptyIcon={<Building2 className="h-7 w-7 text-textMuted/40" />}
    />
  );
};
