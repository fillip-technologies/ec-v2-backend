'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { CustomDropdown } from '@/components/shared/CustomDropdown';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSizeSelector?: boolean;
  itemLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  pageSizeOptions = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = false,
  itemLabel = 'items',
  className = '',
  disabled = false,
}) => {
  const startIndex = Math.max(0, (currentPage - 1) * pageSize);
  const endIndex = Math.min(startIndex + pageSize, totalCount);

  // Generate windowed page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-bgSoft/40 border-t border-borderLight text-xs font-bold text-textMuted ${className}`}
    >
      {/* Left: Summary and Optional Page Size */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          Showing{' '}
          <span className="text-textPrimary font-black">
            {totalCount > 0 ? startIndex + 1 : 0}
          </span>{' '}
          to <span className="text-textPrimary font-black">{endIndex}</span> of{' '}
          <span className="text-textPrimary font-black">{totalCount}</span> {itemLabel}
        </div>

        {showPageSizeSelector && onPageSizeChange && pageSizeOptions.length > 0 && (
          <div className="flex items-center gap-2 border-l border-borderLight pl-4">
            <span>Per page:</span>
            <div className="w-24 min-w-22">
              <CustomDropdown
                options={pageSizeOptions}
                value={pageSize}
                onChange={(val) => {
                  onPageSizeChange(Number(val));
                  onPageChange(1);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || disabled}
          className="p-1.5 rounded-lg border border-borderLight bg-white text-textPrimary hover:bg-bgSoft disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
          className="p-1.5 rounded-lg border border-borderLight bg-white text-textPrimary hover:bg-bgSoft disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((page, idx) => {
          if (typeof page === 'string') {
            return (
              <span key={`dots-${idx}`} className="px-2 text-textMuted">
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page)}
              disabled={disabled}
              className={`h-7 w-7 rounded-lg text-xs font-black transition cursor-pointer ${isActive
                  ? 'bg-brand text-white shadow-2xs'
                  : 'bg-white border border-borderLight text-textPrimary hover:bg-bgSoft'
                }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0 || disabled}
          className="p-1.5 rounded-lg border border-borderLight bg-white text-textPrimary hover:bg-bgSoft disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0 || disabled}
          className="p-1.5 rounded-lg border border-borderLight bg-white text-textPrimary hover:bg-bgSoft disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
