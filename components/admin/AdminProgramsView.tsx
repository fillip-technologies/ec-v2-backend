'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Globe,
  Trash2,
  Pencil,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Program } from '@/types/catalog';
import { deleteProgram, getPrograms } from '@/lib/api/catalog';
import { AdminCreateProgramView } from './AdminCreateProgramView';
import { useAuth } from '@/context/AuthContext';
import { CustomDropdown } from '@/components/shared/CustomDropdown';
import { showToast } from '@/lib/toast';

interface AdminProgramsViewProps {
  programs?: Program[];
  onProgramUpdated?: () => void;
}

type ProgramSortField = 'title' | 'durationHours' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export const AdminProgramsView: React.FC<AdminProgramsViewProps> = ({
  programs: initialPrograms,
  onProgramUpdated,
}) => {
  const { user, roleName } = useAuth();
  const activeRole =
    roleName ||
    (user as any)?.role?.name ||
    (typeof user?.role === 'string' ? user.role : 'student');
  const canManageCatalogue = activeRole === 'super_admin' || activeRole === 'admin';

  const [programsList, setProgramsList] = useState<Program[]>(initialPrograms || []);
  const [loading, setLoading] = useState<boolean>(!initialPrograms || initialPrograms.length === 0);
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // DataTable State
  const [sortField, setSortField] = useState<ProgramSortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sync with prop updates
  useEffect(() => {
    if (initialPrograms && initialPrograms.length > 0) {
      setProgramsList(initialPrograms);
      setLoading(false);
    }
  }, [initialPrograms]);

  // Fetch programs if not provided by parent
  const fetchProgramsData = async () => {
    setLoading(true);
    try {
      const data = await getPrograms();
      if (Array.isArray(data)) {
        setProgramsList(data);
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load programs list', 'Data Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialPrograms || initialPrograms.length === 0) {
      fetchProgramsData();
    }
  }, []);

  const handleSort = (field: ProgramSortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteProgram = async (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete the program "${title}"?`)) {
      try {
        await deleteProgram(id);
        setProgramsList((prev) => prev.filter((p) => p.id !== id));
        if (onProgramUpdated) onProgramUpdated();
        showToast.success(`Program "${title}" deleted successfully.`, 'Program Deleted');
      } catch (err: any) {
        showToast.error(err.message || 'Failed to delete program', 'Action Failed');
      }
    }
  };

  // 1. Filtered & Sorted Programs
  const filteredAndSortedPrograms = useMemo(() => {
    let result = (programsList || []).filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let valA: any = a[sortField] ?? '';
      let valB: any = b[sortField] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [programsList, searchTerm, statusFilter, sortField, sortOrder]);

  // 2. Pagination Calculations
  const totalEntries = filteredAndSortedPrograms.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPrograms = filteredAndSortedPrograms.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Full Page Create View Mode (Fallback if embedded)
  if (mode === 'create') {
    return (
      <AdminCreateProgramView
        onBack={() => setMode('list')}
        onSuccess={() => {
          fetchProgramsData();
          if (onProgramUpdated) onProgramUpdated();
          setMode('list');
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-borderLight shadow-xs">
        <div>
          <h1 className="text-xl font-black text-textPrimary flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-brand" />
            Catalog Internship Programs Management
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Author and publish 120-hour internship programs, configure multi-country pricing, and structure capstone project pools.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProgramsData}
            className="rounded-xl border border-borderLight bg-bgSoft p-2.5 text-textPrimary hover:bg-borderLight transition cursor-pointer"
            title="Refresh Programs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-brand' : ''}`} />
          </button>
          {canManageCatalogue && (
            <Link
              href="/admin/program"
              className="rounded-xl bg-gradient-to-r from-textPrimary via-gray-900 to-brand text-white px-4 py-2.5 text-xs font-black transition-all hover:scale-[1.01] cursor-pointer shadow-md flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Program</span>
            </Link>
          )}
        </div>
      </div>

      {/* Datatable Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-[20px] border border-borderLight shadow-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
          <input
            type="text"
            placeholder="Search title, slug, description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl bg-bgSoft pl-10 pr-4 py-2.5 text-xs font-bold text-textPrimary placeholder:text-textMuted border border-borderLight/60 focus:outline-none focus:border-brand"
          />
        </div>

        {/* Status Filters & Page Size Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Filter className="h-4 w-4 text-textMuted shrink-0 mr-1" />
            {['all', 'published', 'draft', 'archived'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-bgSoft text-textPrimary hover:bg-borderLight'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-textMuted border-l border-borderLight pl-3">
            <span>Rows:</span>
            <div className="w-20">
              <CustomDropdown
                options={[10, 25, 50]}
                value={pageSize}
                onChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Programs DataTable Container */}
      <div className="bg-white rounded-[24px] border border-borderLight shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-xs font-bold text-textMuted uppercase tracking-wider">Loading Catalogue Programs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borderLight bg-bgSoft/60 text-[11px] font-extrabold uppercase tracking-wider text-textMuted">
                  <th
                    className="py-4 px-6 cursor-pointer hover:text-brand transition"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Program Curriculum</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-6">Domain / Topics</th>
                  <th
                    className="py-4 px-6 cursor-pointer hover:text-brand transition"
                    onClick={() => handleSort('durationHours')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Duration</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-6">Multi-Country Pricing</th>
                  <th
                    className="py-4 px-6 cursor-pointer hover:text-brand transition"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight/60 text-xs">
                {paginatedPrograms.length > 0 ? (
                  paginatedPrograms.map((p) => {
                    const topicList = p.topics?.map((t) => t.topic.name) || [];
                    const pricingsCount = p.pricings?.length || 0;

                    return (
                      <tr key={p.id} className="hover:bg-bgSoft/40 transition">
                        {/* Title & Slug */}
                        <td className="py-4 px-6 max-w-xs">
                          <div className="font-black text-textPrimary text-sm line-clamp-1">{p.title}</div>
                          <div className="text-[11px] font-mono text-textMuted mt-0.5">{p.slug}</div>
                        </td>

                        {/* Domain / Topics */}
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {topicList.length > 0 ? (
                              topicList.map((top, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block rounded-md bg-bgSoft px-2 py-0.5 text-[10px] font-bold text-textPrimary border border-borderLight"
                                >
                                  {top}
                                </span>
                              ))
                            ) : (
                              <span className="text-textMuted text-[11px] italic">General Track</span>
                            )}
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="py-4 px-6 font-bold text-textPrimary whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-brand" />
                            <span>{p.durationHours} Hours</span>
                          </div>
                        </td>

                        {/* Multi-Country Pricing */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-textMuted" />
                            <span className="font-extrabold text-textPrimary">
                              {pricingsCount} {pricingsCount === 1 ? 'Country' : 'Countries'}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              p.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.status === 'draft'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {p.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/program?id=${p.id}`}
                              className="p-2 rounded-xl bg-bgSoft text-textPrimary hover:bg-brand hover:text-white transition cursor-pointer"
                              title="Edit Program"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                            {canManageCatalogue && (
                              <button
                                type="button"
                                onClick={() => handleDeleteProgram(p.id, p.title)}
                                className="p-2 rounded-xl bg-dangerLight text-danger hover:bg-danger hover:text-white transition cursor-pointer"
                                title="Delete Program"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-textMuted">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <BookOpen className="h-8 w-8 text-textMuted/40" />
                        <span className="text-sm font-black text-textPrimary">No Programs Found</span>
                        <p className="text-xs text-textMuted">
                          {searchTerm || statusFilter !== 'all'
                            ? 'No programs matched your current search or status filter.'
                            : 'No internship programs have been created yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && totalEntries > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-borderLight bg-bgSoft/20">
            <div className="text-xs font-bold text-textMuted">
              Showing{' '}
              <span className="font-extrabold text-textPrimary">
                {startIndex + 1}
              </span>{' '}
              to{' '}
              <span className="font-extrabold text-textPrimary">
                {Math.min(startIndex + pageSize, totalEntries)}
              </span>{' '}
              of <span className="font-extrabold text-textPrimary">{totalEntries}</span> programs
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-borderLight bg-white text-textPrimary hover:bg-bgSoft disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => handlePageChange(pg)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
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
