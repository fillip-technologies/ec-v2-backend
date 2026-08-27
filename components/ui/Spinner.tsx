'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'brand' | 'white' | 'muted' | 'emerald';
  label?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
  xl: 'h-9 w-9',
};

const TONE_MAP = {
  brand: 'text-brand',
  white: 'text-white',
  muted: 'text-textMuted',
  emerald: 'text-emerald-600',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  tone = 'brand',
  label,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Loader2 className={`${SIZE_MAP[size]} ${TONE_MAP[tone]} animate-spin shrink-0`} />
      {label && (
        <span className="text-xs font-bold text-textMuted select-none">
          {label}
        </span>
      )}
    </div>
  );
};

export interface SpinnerCardProps {
  label?: string;
  className?: string;
}

export const SpinnerCard: React.FC<SpinnerCardProps> = ({
  label = 'Loading data...',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-20 rounded-[28px] border border-borderLight bg-white shadow-xs ${className}`}
    >
      <Loader2 className="h-8 w-8 animate-spin text-brand" />
      <span className="text-xs font-black uppercase tracking-wider text-textMuted mt-3.5">
        {label}
      </span>
    </div>
  );
};
