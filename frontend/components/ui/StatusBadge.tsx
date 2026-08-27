'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Lock,
  MinusCircle,
  HelpCircle,
} from 'lucide-react';

export type StatusTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'neutral';

export interface StatusBadgeProps {
  /**
   * Raw status string (e.g. 'PAID', 'PASSED', 'NEEDS_WORK', 'ACTIVE', 'REJECTED')
   * If tone is not provided, the badge will automatically map the status to the appropriate tone and icon.
   */
  status?: string | null;
  /**
   * Explicit semantic tone override
   */
  tone?: StatusTone;
  /**
   * Custom label text (defaults to formatted status string if omitted)
   */
  label?: string;
  /**
   * Optional custom icon to display
   */
  icon?: React.ReactNode;
  /**
   * Badge size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Extra className
   */
  className?: string;
  /**
   * Whether to display with a subtle pulse dot
   */
  withDot?: boolean;
}

const TONE_STYLES: Record<StatusTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
  info: 'bg-blue-50 text-blue-700 border-blue-200/80',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
  neutral: 'bg-bgSoft text-textMuted border-borderLight',
};

const DOT_STYLES: Record<StatusTone, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-blue-500',
  purple: 'bg-purple-500',
  neutral: 'bg-textMuted',
};

/**
 * Maps raw backend status strings to a semantic tone and icon
 */
export function getStatusMeta(rawStatus?: string | null): {
  tone: StatusTone;
  label: string;
  defaultIcon: React.ReactNode;
} {
  if (!rawStatus) {
    return {
      tone: 'neutral',
      label: 'Unknown',
      defaultIcon: <HelpCircle className="h-3 w-3" />,
    };
  }

  const s = rawStatus.toUpperCase().replace(/\s+/g, '_');

  // Success
  if (['PAID', 'PASSED', 'APPROVED', 'ACTIVE', 'DONE', 'COMPLETED', 'VERIFIED', 'ISSUED', 'SUCCESS'].includes(s)) {
    return {
      tone: 'success',
      label: s === 'DONE' ? 'Completed' : s.replace(/_/g, ' '),
      defaultIcon: <CheckCircle2 className="h-3 w-3 shrink-0" />,
    };
  }

  // Danger
  if (['FAILED', 'NEEDS_WORK', 'REJECTED', 'DISABLED', 'REVOKED', 'CANCELLED', 'BLOCKED', 'SUSPENDED', 'ERROR'].includes(s)) {
    return {
      tone: 'danger',
      label: s.replace(/_/g, ' '),
      defaultIcon: <XCircle className="h-3 w-3 shrink-0" />,
    };
  }

  // Warning
  if (['PENDING', 'PENDING_APPROVAL', 'EXPIRED', 'REVIEW_PENDING', 'ATTENTION'].includes(s)) {
    return {
      tone: 'warning',
      label: s.replace(/_/g, ' '),
      defaultIcon: <AlertTriangle className="h-3 w-3 shrink-0" />,
    };
  }

  // Info
  if (['IN_PROGRESS', 'OPEN', 'ACTIVE_BATCH', 'REDEEMED', 'CLAIMED', 'PROCESSING'].includes(s)) {
    return {
      tone: 'info',
      label: s.replace(/_/g, ' '),
      defaultIcon: <Clock className="h-3 w-3 shrink-0" />,
    };
  }

  // Purple / AI
  if (['EVALUATING', 'AI_REVIEWING', 'AI_SCORED', 'CALIBRATED'].includes(s)) {
    return {
      tone: 'purple',
      label: s.replace(/_/g, ' '),
      defaultIcon: <Sparkles className="h-3 w-3 shrink-0" />,
    };
  }

  // Neutral / Locked
  if (['LOCKED', 'UNAVAILABLE', 'DRAFT', 'NOT_SUBMITTED', 'ARCHIVED'].includes(s)) {
    return {
      tone: 'neutral',
      label: s.replace(/_/g, ' '),
      defaultIcon: <Lock className="h-3 w-3 shrink-0" />,
    };
  }

  return {
    tone: 'neutral',
    label: rawStatus,
    defaultIcon: <MinusCircle className="h-3 w-3 shrink-0" />,
  };
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  tone: explicitTone,
  label: explicitLabel,
  icon: explicitIcon,
  size = 'md',
  className = '',
  withDot = false,
}) => {
  const meta = getStatusMeta(status);
  const tone = explicitTone || meta.tone;
  const label = explicitLabel || meta.label;
  const icon = explicitIcon !== undefined ? explicitIcon : meta.defaultIcon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-bold',
    md: 'text-[11px] px-2.5 py-1 gap-1.5 font-extrabold',
    lg: 'text-xs px-3 py-1.5 gap-2 font-black',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs transition-colors select-none capitalize ${TONE_STYLES[tone]} ${sizeClasses} ${className}`}
    >
      {withDot && (
        <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[tone]} animate-pulse`} />
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </span>
  );
};
