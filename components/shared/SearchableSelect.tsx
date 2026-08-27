'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SearchableSelectOption {
  value: number | string;
  label: string;
  subLabel?: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: number | string | '';
  onChange: (value: any) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  required?: boolean;
  emptyMessage?: string;
  className?: string;
  allowCustomAction?: {
    label: string;
    action: (query: string) => void;
  };
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to search...',
  label,
  required = false,
  emptyMessage = 'No matching options found.',
  className = '',
  allowCustomAction,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(value));
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(q)) ||
        (opt.badge && opt.badge.toLowerCase().includes(q)),
    );
  }, [options, searchQuery]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-textPrimary mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border bg-bgBody px-3.5 py-2.5 text-xs font-extrabold text-left transition-all cursor-pointer ${
          isOpen
            ? 'border-brand ring-2 ring-brand/20 bg-white'
            : 'border-borderLight hover:border-brand/40 text-textPrimary'
        }`}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {selectedOption?.icon && (
            <span className="shrink-0 text-brand">{selectedOption.icon}</span>
          )}
          {selectedOption ? (
            <div className="truncate">
              <span className="text-textPrimary font-extrabold">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="ml-2 font-mono text-[10px] text-textMuted bg-bgSoft px-1.5 py-0.5 rounded border border-borderLight">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-textMuted font-medium">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 text-textMuted shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-borderLight bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textMuted" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-7 py-2 text-xs font-bold rounded-xl border border-borderLight bg-bgSoft/60 text-textPrimary placeholder:text-textMuted focus:border-brand focus:bg-white focus:outline-hidden transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs space-y-2">
                <div className="font-bold text-textMuted">{emptyMessage}</div>
                {allowCustomAction && (
                  <button
                    type="button"
                    onClick={() => {
                      allowCustomAction.action(searchQuery);
                      setIsOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-xs font-black hover:bg-brand/20 transition cursor-pointer"
                  >
                    <span>{allowCustomAction.label}</span>
                  </button>
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-brand/10 text-brand font-black'
                        : 'hover:bg-bgSoft text-textPrimary font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="min-w-0 truncate">
                        <div className="truncate">{opt.label}</div>
                        {opt.subLabel && (
                          <div className="text-[10px] text-textMuted font-medium truncate">
                            {opt.subLabel}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span className="font-mono text-[10px] text-textMuted bg-bgSoft px-1.5 py-0.5 rounded border border-borderLight">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="h-3.5 w-3.5 text-brand" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
