'use client';

import React from 'react';
import { ArrowLeft, RefreshCw, Copy, Check } from 'lucide-react';
import { showToast } from '@/lib/toast';

export interface DetailTab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface DetailDossierLayoutProps {
  // Navigation
  onBack: () => void;
  backLabel?: string;
  // Hero Profile Header
  title: string;
  subtitle?: string;
  avatarIcon?: React.ReactNode;
  statusBadge?: React.ReactNode;
  quickChips?: React.ReactNode;
  headerActions?: React.ReactNode;
  // Refresh action
  onRefresh?: () => void;
  refreshing?: boolean;
  // Quick Key/ID Copy
  copyableId?: {
    label: string;
    value: string;
  };
  // Tab Bar
  tabs: DetailTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  // Content
  children: React.ReactNode;
  className?: string;
}

export const DetailDossierLayout: React.FC<DetailDossierLayoutProps> = ({
  onBack,
  backLabel = 'Back to List',
  title,
  subtitle,
  avatarIcon,
  statusBadge,
  quickChips,
  headerActions,
  onRefresh,
  refreshing = false,
  copyableId,
  tabs,
  activeTab,
  onTabChange,
  children,
  className = '',
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast.success('Copied to clipboard', 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Back and Utility Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-textMuted hover:text-brand transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{backLabel}</span>
        </button>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-borderLight bg-white px-3.5 py-1.5 text-xs font-bold text-textPrimary hover:bg-bgSoft hover:text-brand transition cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}
          {headerActions}
        </div>
      </div>

      {/* Hero Profile Dossier Card */}
      <div className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-7 shadow-xs relative overflow-hidden space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            {avatarIcon && (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand border border-brand/20 shadow-2xs">
                {avatarIcon}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-black text-textPrimary tracking-tight">
                  {title}
                </h1>
                {statusBadge}
              </div>
              {subtitle && (
                <p className="text-xs font-medium text-textMuted">{subtitle}</p>
              )}
            </div>
          </div>

          {copyableId && (
            <div className="flex items-center gap-2 rounded-xl bg-bgSoft px-3 py-1.5 border border-borderLight text-xs">
              <span className="text-textMuted font-bold">{copyableId.label}:</span>
              <code className="font-mono font-bold text-textPrimary text-[11px]">
                {copyableId.value}
              </code>
              <button
                onClick={() => handleCopy(copyableId.value)}
                className="p-1 rounded hover:bg-white text-textMuted hover:text-brand transition cursor-pointer"
                title="Copy"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}
        </div>

        {quickChips && (
          <div className="pt-4 border-t border-borderLight/60 flex flex-wrap items-center gap-4 text-xs font-bold text-textMuted">
            {quickChips}
          </div>
        )}
      </div>

      {/* Tab Navigation Strip */}
      {tabs.length > 0 && (
        <div className="flex items-center gap-2 border-b border-borderLight pb-px overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-brand text-brand bg-brand/5 rounded-t-xl'
                    : 'border-transparent text-textMuted hover:text-textPrimary hover:border-borderLight'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      isActive
                        ? 'bg-brand text-white'
                        : 'bg-bgSoft text-textMuted'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Tab Content Container */}
      <div>{children}</div>
    </div>
  );
};
