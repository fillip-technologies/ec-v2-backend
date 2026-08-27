'use client';

import React from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Pagination } from './Pagination';
import { EmptyState } from './EmptyState';
import { Spinner } from './Spinner';
import { CustomDropdown } from '@/components/shared/CustomDropdown';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (row: T, index: number) => string | number;
  // Header / Search
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  headerActions?: React.ReactNode;
  // Sorting
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (field: string) => void;
  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    pageSizeOptions?: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    itemLabel?: string;
  };
  // States
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  // Interactions
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  title,
  subtitle,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  headerActions,
  sortField,
  sortOrder,
  onSortChange,
  pagination,
  loading = false,
  emptyTitle = 'No Records Found',
  emptyDescription,
  emptyIcon,
  emptyAction,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const handleHeaderClick = (col: ColumnDef<T>) => {
    if (col.sortable && onSortChange) {
      onSortChange(col.key);
    }
  };

  const hasPageSizeInHeader = Boolean(pagination?.onPageSizeChange && pagination?.pageSizeOptions && pagination.pageSizeOptions.length > 0);
  const hasHeader = title || subtitle || onSearchChange || headerActions || hasPageSizeInHeader;

  return (
    <div
      className={`rounded-[28px] border border-borderLight bg-white shadow-xs overflow-hidden ${className}`}
    >
      {/* Header Toolbar */}
      {hasHeader && (
        <div className="p-6 border-b border-borderLight flex flex-col gap-4">
          {(title || subtitle) && (
            <div>
              {title && (
                <h3 className="text-base font-black text-textPrimary tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-textMuted mt-0.5">{subtitle}</p>
              )}
            </div>
          )}

          {(onSearchChange || headerActions || hasPageSizeInHeader) && (
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              {onSearchChange ? (
                <div className="relative w-full sm:w-80 md:w-96">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textMuted" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue || ''}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full rounded-xl bg-bgSoft pl-9 pr-3 py-2 text-xs font-bold text-textPrimary placeholder:text-textMuted border border-borderLight focus:outline-none focus:border-brand"
                  />
                </div>
              ) : (
                <div />
              )}

              {/* Top Right Controls: Rows Selector & Actions */}
              <div className="flex flex-wrap items-center gap-3 shrink-0 self-start sm:self-auto">
                {hasPageSizeInHeader && (
                  <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
                    <span>Rows:</span>
                    <div className="w-24 min-w-[88px]">
                      <CustomDropdown
                        options={pagination!.pageSizeOptions!}
                        value={pagination!.pageSize}
                        onChange={(val) => {
                          pagination!.onPageSizeChange!(Number(val));
                          pagination!.onPageChange(1);
                        }}
                      />
                    </div>
                  </div>
                )}

                {headerActions}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-borderLight bg-bgSoft/60 text-[11px] font-extrabold uppercase tracking-wider text-textMuted">
              {columns.map((col) => {
                const isSorted = sortField === col.key;
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';

                return (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => handleHeaderClick(col)}
                    className={`py-3.5 px-5 select-none ${alignClass} ${
                      col.sortable ? 'cursor-pointer hover:text-brand transition' : ''
                    } ${col.className || ''}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right'
                          ? 'justify-end'
                          : col.align === 'center'
                          ? 'justify-center'
                          : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span>
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="h-3 w-3 text-brand" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-brand" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-borderLight/60 text-xs font-medium text-textPrimary">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Spinner size="lg" label="Loading data..." />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-6">
                  <EmptyState
                    variant="inline"
                    title={emptyTitle}
                    description={emptyDescription}
                    icon={emptyIcon}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={keyExtractor(row, idx)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-bgSoft/40 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => {
                    const alignClass =
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left';

                    return (
                      <td
                        key={`${keyExtractor(row, idx)}-${col.key}`}
                        className={`py-4 px-5 ${alignClass} ${col.className || ''}`}
                      >
                        {col.render
                          ? col.render(row, idx)
                          : (row as any)[col.key] ?? '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={pagination.pageSize}
          pageSizeOptions={pagination.pageSizeOptions}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
          showPageSizeSelector={false}
          itemLabel={pagination.itemLabel}
          disabled={loading}
        />
      )}
    </div>
  );
}
