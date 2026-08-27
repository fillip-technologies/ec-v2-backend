'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  GraduationCap,
  Award,
  Download,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { showToast } from '@/lib/toast';

interface CollegeStudentsViewProps {
  students: any[];
}

type StudentSortField = 'displayName' | 'programTitle' | 'completionPercentage' | 'enrollmentStatus';
type SortOrder = 'asc' | 'desc';

export const CollegeStudentsView: React.FC<CollegeStudentsViewProps> = ({ students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState<StudentSortField>('displayName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const handleSort = (field: StudentSortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedStudents = useMemo(() => {
    let result = (students || []).filter((s) => {
      const name = s.displayName || `${s.firstName || ''} ${s.lastName || ''}`.trim() || '';
      const email = s.email || '';
      const program = s.programTitle || s.program?.title || '';
      const status = (s.enrollmentStatus || s.status || '').toUpperCase();

      const matchesSearch =
        !searchTerm.trim() ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'COMPLETED' && (status === 'COMPLETED' || s.completionPercentage >= 100)) ||
        (statusFilter === 'ACTIVE' && (status === 'ACTIVE' || (s.completionPercentage > 0 && s.completionPercentage < 100))) ||
        (statusFilter === 'PENDING' && (status === 'PENDING' || s.completionPercentage === 0));

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
  }, [students, searchTerm, statusFilter, sortField, sortOrder]);

  const totalEntries = filteredAndSortedStudents.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStudents = filteredAndSortedStudents.slice(startIndex, startIndex + pageSize);

  const totalCohort = students.length;
  const completedCount = students.filter(
    (s) => s.enrollmentStatus?.toUpperCase() === 'COMPLETED' || s.completionPercentage >= 100,
  ).length;
  const activeCount = students.filter(
    (s) => s.enrollmentStatus?.toUpperCase() === 'ACTIVE' || (s.completionPercentage > 0 && s.completionPercentage < 100),
  ).length;

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Name,Email,Program,Completion %,Status']
        .concat(
          filteredAndSortedStudents.map(
            (s) =>
              `"${s.displayName || s.email}","${s.email}","${s.programTitle || ''}",${s.completionPercentage || 0}%,"${s.enrollmentStatus || 'ACTIVE'}"`,
          ),
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Campus_Cohort_Students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success(`Exported ${filteredAndSortedStudents.length} student records as CSV!`, 'Export Complete');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-[28px] border border-borderLight shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand">
            <Users className="h-4 w-4" />
            <span>Campus Learners</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-textPrimary tracking-tight">
            Institutional Student Cohort
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Monitor real-time task progress, active workspaces, and AI evaluation rubrics for your enrolled students.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-bgSoft hover:bg-borderLight text-textPrimary font-extrabold text-xs transition cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Export Cohort CSV</span>
        </button>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[22px] border border-borderLight bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <Users className="h-4 w-4 text-brand" />
            <span>Total Enrolled Cohort</span>
          </div>
          <div className="mt-2 text-2xl font-black text-textPrimary">
            {totalCohort}
          </div>
        </div>

        <div className="rounded-[22px] border border-borderLight bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <Clock className="h-4 w-4 text-amber-500" />
            <span>Active Workspaces</span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {activeCount}
          </div>
        </div>

        <div className="rounded-[22px] border border-borderLight bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <Award className="h-4 w-4 text-emerald-600" />
            <span>Certificates Completed</span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {completedCount}
          </div>
        </div>
      </div>

      {/* DataTable Container */}
      <div className="rounded-[28px] border border-borderLight bg-white shadow-xs overflow-hidden">
        {/* Table Search & Filter Toolbar */}
        <div className="p-4 sm:p-6 border-b border-borderLight flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-bgBody/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search students, email, program..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs font-bold rounded-xl border border-borderLight bg-white text-textPrimary placeholder:text-textMuted focus:border-brand focus:outline-hidden focus:ring-2 focus:ring-brand/20 transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center rounded-xl border border-borderLight bg-white p-1 text-xs font-bold self-start sm:self-auto">
            {['ALL', 'ACTIVE', 'COMPLETED'].map((st) => (
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
        {filteredAndSortedStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-bgSoft text-textMuted flex items-center justify-center mx-auto">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-black text-textPrimary">No Students Found</h3>
            <p className="text-xs text-textMuted max-w-sm mx-auto">
              No students matched your search criteria. Try adjusting your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borderLight bg-bgBody/50 text-[11px] font-black uppercase tracking-wider text-textMuted">
                  <th
                    onClick={() => handleSort('displayName')}
                    className="py-3.5 px-4 sm:px-6 cursor-pointer hover:text-textPrimary select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Student Learner</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('programTitle')}
                    className="py-3.5 px-4 cursor-pointer hover:text-textPrimary select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Enrolled Program</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('completionPercentage')}
                    className="py-3.5 px-4 cursor-pointer hover:text-textPrimary select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Milestone Progress</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('enrollmentStatus')}
                    className="py-3.5 px-4 cursor-pointer hover:text-textPrimary select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight text-xs font-medium">
                {paginatedStudents.map((student, idx) => {
                  const pct = student.completionPercentage || 0;
                  const isDone = pct >= 100 || student.enrollmentStatus?.toUpperCase() === 'COMPLETED';

                  return (
                    <tr
                      key={student.id || idx}
                      className="hover:bg-bgSoft/40 transition-colors"
                    >
                      {/* Student Learner */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-brand/10 text-brand font-black text-xs flex items-center justify-center">
                            {(student.displayName || student.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-textPrimary">
                              {student.displayName || 'Campus Student'}
                            </div>
                            <div className="text-[10px] text-textMuted">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Enrolled Program */}
                      <td className="py-4 px-4 max-w-[240px]">
                        <div className="font-extrabold text-textPrimary truncate">
                          {student.programTitle || 'Internship Program Track'}
                        </div>
                        <div className="text-[10px] text-textMuted">
                          Hands-on Capstone Track
                        </div>
                      </td>

                      {/* Milestone Progress */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-textPrimary">
                            {pct}%
                          </span>
                          <span className="text-[10px] text-textMuted font-bold">
                            {isDone ? 'Completed' : 'In-Progress'}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-24 rounded-full bg-bgSoft overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isDone ? 'bg-emerald-500' : 'bg-brand'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          <span>{student.enrollmentStatus || (isDone ? 'COMPLETED' : 'ACTIVE')}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredAndSortedStudents.length > 0 && (
          <div className="p-4 sm:px-6 border-t border-borderLight flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-textMuted font-bold">
            <div>
              Showing{' '}
              <span className="font-extrabold text-textPrimary">
                {startIndex + 1}
              </span>{' '}
              to{' '}
              <span className="font-extrabold text-textPrimary">
                {Math.min(startIndex + pageSize, totalEntries)}
              </span>{' '}
              of{' '}
              <span className="font-extrabold text-textPrimary">
                {totalEntries}
              </span>{' '}
              students
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
