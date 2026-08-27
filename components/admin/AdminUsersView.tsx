'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Eye,
  CheckCircle2,
  Ban,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CustomDropdown } from '@/components/shared/CustomDropdown';

interface AdminUsersViewProps {
  users: any[];
  onUpdateUserStatus: (id: number, status: string) => void;
  onViewStudentDetail?: (id: number) => void;
  onViewCollegeDetail?: (id: number) => void;
}

type UserSortField = 'displayName' | 'email' | 'roleName' | 'countryName' | 'status';
type SortOrder = 'asc' | 'desc';

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users,
  onUpdateUserStatus,
  onViewStudentDetail,
  onViewCollegeDetail,
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // DataTable State
  const [sortField, setSortField] = useState<UserSortField>('email');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (field: UserSortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 1. Filtered & Sorted Users
  const filteredAndSortedUsers = useMemo(() => {
    let result = users.filter((u) => {
      const matchesSearch =
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.phoneNo && u.phoneNo.includes(searchTerm));

      const matchesRole = roleFilter === 'all' || u.roleName === roleFilter;

      return matchesSearch && matchesRole;
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
  }, [users, searchTerm, roleFilter, sortField, sortOrder]);

  // 2. Pagination Calculations
  const totalEntries = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-borderLight shadow-xs">
        <div>
          <h1 className="text-xl font-black text-textPrimary flex items-center gap-2">
            <Users className="h-6 w-6 text-brand" />
            Platform Users Management
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Super Admin user accounts governance, RBAC role inspection, and account status enforcement.
          </p>
        </div>
      </div>

      {/* Datatable Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-[20px] border border-borderLight shadow-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
          <input
            type="text"
            placeholder="Search email, name, phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl bg-bgSoft pl-10 pr-4 py-2.5 text-xs font-bold text-textPrimary placeholder:text-textMuted border border-borderLight/60 focus:outline-none focus:border-brand"
          />
        </div>

        {/* Role Filters & Rows Per Page */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Filter className="h-4 w-4 text-textMuted shrink-0 mr-1" />
            {['all', 'student', 'college', 'admin', 'super_admin'].map((role) => (
              <button
                key={role}
                onClick={() => {
                  setRoleFilter(role);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer ${
                  roleFilter === role
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-bgSoft text-textPrimary hover:bg-borderLight'
                }`}
              >
                {role.replace('_', ' ')}
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

      {/* Datatable Wrapper */}
      <div className="bg-white rounded-[24px] border border-borderLight shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bgSoft/80 border-b border-borderLight text-[11px] font-extrabold uppercase tracking-wider text-textMuted select-none">
                <th
                  onClick={() => handleSort('email')}
                  className="py-4 px-5 cursor-pointer hover:text-brand transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <span>User Details</span>
                    <ArrowUpDown className="h-3 w-3 text-textMuted" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('roleName')}
                  className="py-4 px-4 cursor-pointer hover:text-brand transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <span>RBAC Role</span>
                    <ArrowUpDown className="h-3 w-3 text-textMuted" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('countryName')}
                  className="py-4 px-4 cursor-pointer hover:text-brand transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Country & Phone</span>
                    <ArrowUpDown className="h-3 w-3 text-textMuted" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-4 px-4 cursor-pointer hover:text-brand transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3 text-textMuted" />
                  </div>
                </th>
                <th className="py-4 px-5 text-right whitespace-nowrap min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLight/60 text-xs">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-textMuted font-bold">
                    No users found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-bgSoft/40 transition-all">
                    <td className="py-4 px-5">
                      <div className="font-black text-textPrimary">{u.displayName || u.email}</div>
                      <div className="text-[10px] text-textMuted">{u.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          u.roleName === 'super_admin'
                            ? 'bg-brand/10 text-brand'
                            : u.roleName === 'admin'
                            ? 'bg-brand/15 text-brandDark'
                            : u.roleName === 'college'
                            ? 'bg-warningLight text-warningDark'
                            : 'bg-infoLight text-infoDark'
                        }`}
                      >
                        {u.roleName}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-textPrimary">
                      {u.countryName}
                      <div className="text-[10px] text-textMuted">{u.phoneNo || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          u.status === 'active'
                            ? 'bg-statusPassedBg text-statusPassedText'
                            : u.status === 'disabled'
                            ? 'bg-statusErrorBg text-statusErrorText'
                            : 'bg-statusEvaluatingBg text-statusEvaluatingText'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap min-w-[100px]">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {u.roleName?.toLowerCase() === 'student' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onViewStudentDetail) {
                                onViewStudentDetail(u.id);
                              } else {
                                router.push(`/admin/studentdetail/${u.id}`);
                              }
                            }}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-brand/10 text-brand hover:bg-brand hover:text-white transition-all cursor-pointer shadow-2xs shrink-0"
                            title="View Student Dossier"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        {u.roleName?.toLowerCase() === 'college' && (
                          <button
                            type="button"
                            onClick={() => {
                              const cId = u.collegeId || u.id;
                              if (onViewCollegeDetail) {
                                onViewCollegeDetail(cId);
                              } else {
                                router.push(`/admin/collegedetail/${cId}`);
                              }
                            }}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white transition-all cursor-pointer shadow-2xs shrink-0"
                            title="View College Dossier"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        {u.status !== 'active' && (
                          <button
                            type="button"
                            onClick={() => onUpdateUserStatus(u.id, 'active')}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-2xs shrink-0"
                            title="Activate Account"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {u.status !== 'disabled' && u.roleName !== 'super_admin' && (
                          <button
                            type="button"
                            onClick={() => onUpdateUserStatus(u.id, 'disabled')}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-2xs shrink-0"
                            title="Disable Account"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Datatable Footer / Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-bgSoft/40 border-t border-borderLight text-xs font-bold text-textMuted">
          <div>
            Showing <span className="text-textPrimary font-black">{totalEntries > 0 ? startIndex + 1 : 0}</span> to{' '}
            <span className="text-textPrimary font-black">{Math.min(startIndex + pageSize, totalEntries)}</span> of{' '}
            <span className="text-textPrimary font-black">{totalEntries}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-borderLight bg-white text-textPrimary hover:bg-bgSoft disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-borderLight bg-white text-textPrimary hover:bg-bgSoft disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-3 text-xs font-black text-textPrimary">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-borderLight bg-white text-textPrimary hover:bg-bgSoft disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-borderLight bg-white text-textPrimary hover:bg-bgSoft disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
