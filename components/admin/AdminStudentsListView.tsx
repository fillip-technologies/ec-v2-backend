'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  Eye,
  Mail,
  Building,
  BookOpen,
  Award,
  RefreshCw,
} from 'lucide-react';
import { getAdminStudents } from '@/lib/api/admin';
import { showToast } from '@/lib/toast';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface AdminStudentsListViewProps {
  onSelectStudent: (studentId: number) => void;
}

type StudentSortField = 'name' | 'email' | 'collegeName' | 'usn' | 'enrollmentCount' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export const AdminStudentsListView: React.FC<AdminStudentsListViewProps> = ({
  onSelectStudent,
}) => {
  const [students, setStudents] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // DataTable State
  const [sortField, setSortField] = useState<StudentSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchStudentsList = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminStudents({
        page: currentPage,
        limit: pageSize,
        search: searchTerm.trim() || undefined,
      });

      if (res && res.data && res.meta) {
        setStudents(res.data);
        setTotalCount(res.meta.total);
        setTotalPages(res.meta.totalPages);
      } else if (Array.isArray(res)) {
        setStudents(res);
        setTotalCount(res.length);
        setTotalPages(Math.ceil(res.length / pageSize) || 1);
      }
      if (isManual) {
        showToast.success('Students directory refreshed', 'Synced');
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to fetch students list', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentsList();
  }, [currentPage, pageSize, searchTerm]);

  const handleSort = (field: string) => {
    const sField = field as StudentSortField;
    if (sortField === sField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(sField);
      setSortOrder('asc');
    }
  };

  const sortedStudents = useMemo(() => {
    const list = [...students];
    list.sort((a, b) => {
      let valA: any = a[sortField] ?? '';
      let valB: any = b[sortField] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [students, sortField, sortOrder]);

  const columns: ColumnDef<any>[] = [
    {
      key: 'name',
      header: 'Student Profile',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand border border-brand/20 font-black text-xs">
            {s.firstName?.[0]?.toUpperCase() || s.name?.[0]?.toUpperCase() || 'S'}
            {s.lastName?.[0]?.toUpperCase() || ''}
          </div>
          <div>
            <div className="font-black text-textPrimary text-xs flex items-center gap-1.5">
              <span>{s.firstName ? `${s.firstName} ${s.lastName || ''}` : s.name}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-textMuted mt-0.5">
              <Mail className="h-3 w-3" />
              <span>{s.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'collegeName',
      header: 'Institution / Branch',
      sortable: true,
      render: (s) => (
        <div>
          <div className="font-bold text-textPrimary flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-textMuted shrink-0" />
            <span className="truncate max-w-[200px]">{s.collegeName || 'Direct Online Learner'}</span>
          </div>
          <div className="text-[11px] text-textMuted mt-0.5">
            {s.branch ? `${s.branch} • Grad ${s.graduationYear || '—'}` : s.usn ? `USN: ${s.usn}` : 'Direct B2C'}
          </div>
        </div>
      ),
    },
    {
      key: 'usn',
      header: 'University USN',
      sortable: true,
      render: (s) => (
        <code className="font-mono text-[11px] bg-bgSoft px-2 py-0.5 rounded-md border border-borderLight font-bold">
          {s.usn || '—'}
        </code>
      ),
    },
    {
      key: 'enrollmentCount',
      header: 'Enrollments',
      sortable: true,
      align: 'center',
      render: (s) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px] border border-blue-200">
          <BookOpen className="h-3 w-3" />
          {s.enrollmentCount || 0}
        </span>
      ),
    },
    {
      key: 'certificatesCount',
      header: 'Certificates',
      align: 'center',
      render: (s) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-extrabold text-[11px] border border-amber-200">
          <Award className="h-3 w-3" />
          {s.certificatesCount || 0}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (s) => <StatusBadge status={s.status || 'ACTIVE'} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (s) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectStudent(s.id || s.userid);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-borderLight bg-white text-xs font-bold text-textPrimary hover:bg-brand hover:text-white hover:border-brand shadow-2xs transition cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View Dossier</span>
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
            <GraduationCap className="h-6 w-6 text-brand" />
            Students Directory & Dossier Registry
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Browse enrolled student cohorts, inspect academic progression, review submission metrics, and verify awarded certificates.
          </p>
        </div>

        <button
          onClick={() => fetchStudentsList(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2 text-xs font-bold text-textPrimary hover:bg-borderLight hover:text-brand transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Directory'}</span>
        </button>
      </div>

      {/* Main DataTable */}
      <DataTable
        data={sortedStudents}
        columns={columns}
        keyExtractor={(s, idx) => s.id || s.userid || idx}
        searchPlaceholder="Search by name, email, USN, college, or branch..."
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSort}
        loading={loading}
        onRowClick={(s) => onSelectStudent(s.id || s.userid)}
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
          itemLabel: 'registered students',
        }}
        emptyTitle="No Students Found"
        emptyDescription={
          searchTerm
            ? 'No students matched your search keyword.'
            : 'No students registered in the platform yet.'
        }
        emptyIcon={<GraduationCap className="h-7 w-7 text-textMuted/40" />}
      />
    </div>
  );
};
