'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export type StatTone = 'brand' | 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'neutral';

export interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: StatTone;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  badge?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

const TONE_ICON_STYLES: Record<StatTone, string> = {
  brand: 'bg-brand/10 text-brand border-brand/20',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  rose: 'bg-rose-50 text-rose-600 border-rose-200',
  neutral: 'bg-bgSoft text-textMuted border-borderLight',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon,
  tone = 'brand',
  trend,
  badge,
  onClick,
  className = '',
  loading = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-[24px] border border-borderLight bg-white p-5 shadow-xs transition-all duration-200 space-y-3 relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-brand/40' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted truncate">
          {title}
        </span>
        {badge ? (
          <div>{badge}</div>
        ) : icon ? (
          <div
            className={`h-8 w-8 rounded-xl flex items-center justify-center border shrink-0 ${TONE_ICON_STYLES[tone]}`}
          >
            {icon}
          </div>
        ) : null}
      </div>

      <div>
        {loading ? (
          <div className="h-8 w-24 bg-bgSoft animate-pulse rounded-lg my-1" />
        ) : (
          <div className="text-2xl font-black text-textPrimary tracking-tight">
            {value}
          </div>
        )}

        {trend && !loading && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold">
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}
            </span>
            {trend.label && <span className="text-textMuted text-[11px]">{trend.label}</span>}
          </div>
        )}

        {subValue && !loading && (
          <div className="text-xs font-bold text-textMuted mt-1.5 line-clamp-1">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};

export interface StatGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

export const StatGrid: React.FC<StatGridProps> = ({
  children,
  cols = 4,
  className = '',
}) => {
  const gridClasses = {
    2: 'grid grid-cols-1 sm:grid-cols-2',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[cols];

  return <div className={`${gridClasses} gap-5 ${className}`}>{children}</div>;
};
