'use client';

import React, { useState, useMemo } from 'react';
import {
  School,
  CheckCircle2,
  XCircle,
  Eye,
  Building,
  MapPin,
  Users,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface AdminCollegesViewProps {
  colleges: any[];
  onApproveCollege: (id: number) => void;
  onRejectCollege: (id: number) => void;
  onSelectCollege?: (id: number) => void;
}

type SortField = 'name' | 'address' | 'countryName' | 'status' | 'studentCount' | 'memberCount';
type SortOrder = 'asc' | 'desc';

export const AdminCollegesView: React.FC<AdminCollegesViewProps> = ({
  colleges = [],
  onApproveCollege,
  onRejectCollege,
  onSelectCollege,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // DataTable State
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (field: string) => {
    const sField = field as SortField;
    if (sortField === sField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(sField);
      setSortOrder('asc');
    }
  };

  // Filtered and Sorted Data
  const filteredAndSortedColleges = useMemo(() => {
    let result = colleges.filter((c) => {
      const matchesSearch =
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.countryName || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || (c.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let valA = a[sortField] ?? '';
      let valB = b[sortField] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [colleges, searchTerm, statusFilter, sortField, sortOrder]);

  const totalEntries = filteredAndSortedColleges.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedColleges = filteredAndSortedColleges.slice(startIndex, startIndex + pageSize);

  const columns: ColumnDef<any>[] = [
    {
      key: 'name',
      header: 'College / University',
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200 font-black text-xs">
            <School className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-textPrimary text-xs">{c.name}</div>
            <div className="flex items-center gap-1 text-[11px] text-textMuted mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[200px]">{c.address || 'Address not specified'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'countryName',
      header: 'Country / Region',
      sortable: true,
      render: (c) => (
        <span className="text-xs font-bold text-textPrimary">
          {c.countryName || 'Global'}
        </span>
      ),
    },
    {
      key: 'studentCount',
      header: 'Enrolled Cohort',
      sortable: true,
      align: 'center',
      render: (c) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px] border border-blue-200">
          <Users className="h-3 w-3" />
          {c.studentCount ?? c.students?.length ?? 0}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Vetting Status',
      sortable: true,
      align: 'center',
      render: (c) => <StatusBadge status={c.status || 'PENDING'} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {c.status === 'PENDING' && (
            <>
              <button
                onClick={() => onApproveCollege(c.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                title="Approve institution"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => onRejectCollege(c.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                title="Reject application"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject</span>
              </button>
            </>
          )}

          {onSelectCollege && (
            <button
              onClick={() => onSelectCollege(c.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-borderLight bg-white text-xs font-bold text-textPrimary hover:bg-brand hover:text-white hover:border-brand shadow-2xs transition cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Dossier</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-borderLight shadow-xs">
        <div>
          <h1 className="text-xl font-black text-textPrimary flex items-center gap-2">
            <School className="h-6 w-6 text-brand" />
            B2B Colleges & Seats Administration
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Vet institution registration applications, manage zero-cost coupon batches, and monitor student cohorts.
          </p>
        </div>
      </div>

      {/* Main DataTable with Search on the Left and Filter Buttons on the Right */}
      <DataTable
        data={paginatedColleges}
        columns={columns}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Search colleges, address, country..."
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSort}
        onRowClick={(c) => onSelectCollege && onSelectCollege(c.id)}
        headerActions={
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Filter className="h-4 w-4 text-textMuted shrink-0 mr-1" />
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-brand text-white shadow-2xs'
                    : 'bg-bgSoft text-textPrimary hover:bg-borderLight'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        }
        pagination={{
          currentPage,
          totalPages,
          totalCount: totalEntries,
          pageSize,
          pageSizeOptions: [10, 25, 50],
          onPageChange: setCurrentPage,
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          },
          itemLabel: 'registered colleges',
        }}
        emptyTitle="No Colleges Found"
        emptyDescription={
          searchTerm || statusFilter !== 'all'
            ? 'No partner colleges match your filter keyword.'
            : 'No college institutions registered yet.'
        }
        emptyIcon={<School className="h-7 w-7 text-textMuted/40" />}
      />
    </div>
  );
};
