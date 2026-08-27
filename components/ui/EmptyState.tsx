'use client';

import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string | React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  variant?: 'card' | 'inline';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'card',
  className = '',
}) => {
  const containerClasses =
    variant === 'card'
      ? 'rounded-[28px] border border-dashed border-borderLight bg-white p-12 text-center shadow-xs'
      : 'py-10 px-4 text-center';

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses} ${className}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bgSoft text-textMuted border border-borderLight/80 mb-3.5">
        {icon || <Inbox className="h-7 w-7" />}
      </div>

      <h3 className="text-base font-black text-textPrimary tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs text-textMuted max-w-sm mt-1.5 leading-relaxed">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};
