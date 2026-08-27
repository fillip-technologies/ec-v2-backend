'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string | number;
  label: string;
  subLabel?: string;
  badge?: string;
  icon?: React.ReactNode;
}

export type RawDropdownOption = string | number | DropdownOption;

export interface CustomDropdownProps {
  options: RawDropdownOption[];
  value: string | number | '';
  onChange: (value: any) => void;
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  popoverMaxHeight?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options = [],
  value,
  onChange,
  label,
  placeholder = 'Select an option...',
  icon,
  required = false,
  disabled = false,
  className = '',
  popoverMaxHeight = 'max-h-[380px]',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to DropdownOption format
  const normalizedOptions: DropdownOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return {
          value: opt,
          label: String(opt),
        };
      }
      return opt;
    });
  }, [options]);

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

  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => String(opt.value) === String(value));
  }, [normalizedOptions, value]);

  return (
    <div className={`relative ${isOpen ? 'z-[60]' : ''} ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-textPrimary mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-extrabold text-left transition-all ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-bgSoft/40 border-borderLight'
            : isOpen
            ? 'border-brand ring-2 ring-brand/20 bg-white cursor-pointer'
            : 'border-borderLight bg-bgSoft/50 hover:border-brand/40 text-textPrimary cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {(selectedOption?.icon || icon) && (
            <span className="shrink-0 text-brand">
              {selectedOption?.icon || icon}
            </span>
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
        <div className={`absolute left-0 right-0 top-full mt-1.5 z-[100] rounded-2xl border border-borderLight bg-white p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${popoverMaxHeight} overflow-y-auto space-y-1 [scrollbar-width:thin] scrollbar-thin`}>
          {normalizedOptions.length === 0 ? (
            <div className="p-3 text-center text-xs font-bold text-textMuted">
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
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
      )}
    </div>
  );
};
