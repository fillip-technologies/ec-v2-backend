'use client';

import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { SearchableSelect, SearchableSelectOption } from './SearchableSelect';

interface YearSelectProps {
  value: number | string | '';
  onChange: (year: number | '') => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  startYearOffset?: number; // e.g. +8 for future years
  minYear?: number; // e.g. 1990
  className?: string;
}

export const YearSelect: React.FC<YearSelectProps> = ({
  value,
  onChange,
  label = 'Expected Graduation Year',
  placeholder = 'Select Year...',
  required = false,
  startYearOffset = 8,
  minYear = 1990,
  className = '',
}) => {
  const currentYear = new Date().getFullYear();

  const options: SearchableSelectOption[] = useMemo(() => {
    const maxYear = currentYear + startYearOffset;
    const count = maxYear - minYear + 1;

    return Array.from({ length: count }, (_, i) => {
      const yr = maxYear - i;
      const isCurrent = yr === currentYear;
      return {
        value: yr,
        label: String(yr),
        badge: isCurrent ? 'CURRENT YEAR' : undefined,
        icon: <Calendar className="h-3.5 w-3.5 text-brand" />,
      };
    });
  }, [currentYear, startYearOffset, minYear]);

  return (
    <SearchableSelect
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Type year (e.g. 2026)..."
      options={options}
      value={value}
      onChange={(val) => onChange(val ? Number(val) : '')}
      required={required}
      className={className}
      emptyMessage="No matching year found."
    />
  );
};
