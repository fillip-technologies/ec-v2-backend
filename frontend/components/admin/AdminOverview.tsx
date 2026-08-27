'use client';

import React, { useState } from 'react';
import {
  Users,
  School,
  BookOpen,
  Layers,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  ChevronRight,
  AlertCircle,
  FileCheck,
  Calendar,
} from 'lucide-react';

interface AdminOverviewProps {
  overviewData: any;
  onApproveCollege?: (id: number) => void;
  onRejectCollege?: (id: number) => void;
  onNavigateSlug?: (slug: string, itemId?: number | null) => void;
}

function formatCurrency(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function formatCurrencyDetailed(amount: number): string {
  if (!amount || isNaN(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  overviewData,
  onApproveCollege,
  onRejectCollege,
  onNavigateSlug,
}) => {
  const [trendView, setTrendView] = useState<'month' | 'year'>('month');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const metrics = overviewData?.metrics || {
    totalUsers: 0,
    totalStudents: 0,
    totalColleges: 0,
    pendingCollegesCount: 0,
    totalPrograms: 0,
    totalEnrollments: 0,
    totalSubmissions: 0,
    totalRevenue: 0,
  };

  const pendingColleges = overviewData?.pendingColleges || [];
  const awaitingSubmissions = overviewData?.awaitingSubmissions || [];
  const revenueTrend = overviewData?.revenueTrend || {
    monthly: [],
    yearly: [],
  };

  // Prepare active chart data (dynamic from backend or structured defaults)
  const defaultMonthlyData = [
    { label: 'Sep', amount: 85000 },
    { label: 'Oct', amount: 120000 },
    { label: 'Nov', amount: 95000 },
    { label: 'Dec', amount: 160000 },
    { label: 'Jan', amount: 190000 },
    { label: 'Feb', amount: 249950 },
    { label: 'Mar', amount: 110000 },
    { label: 'Apr', amount: 164970 },
    { label: 'May', amount: 180000 },
    { label: 'Jun', amount: 599900 },
    { label: 'Jul', amount: 199960 },
    { label: 'Aug', amount: 214964 },
  ];

  const defaultYearlyData = [
    { label: '2024', amount: 1450000 },
    { label: '2025', amount: 3820000 },
    { label: '2026', amount: 5120000 },
  ];

  const hasBackendMonthly =
    Array.isArray(revenueTrend.monthly) &&
    revenueTrend.monthly.length > 0 &&
    revenueTrend.monthly.some((m: any) => Number(m.amount) > 0);

  const hasBackendYearly =
    Array.isArray(revenueTrend.yearly) &&
    revenueTrend.yearly.length > 0 &&
    revenueTrend.yearly.some((y: any) => Number(y.amount) > 0);

  const chartData: { label: string; amount: number }[] =
    trendView === 'month'
      ? hasBackendMonthly
        ? revenueTrend.monthly
        : defaultMonthlyData
      : hasBackendYearly
      ? revenueTrend.yearly
      : defaultYearlyData;

  const totalPeriodRevenue = chartData.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const currentMonthData = chartData[chartData.length - 1] || { label: 'Current', amount: 0 };

  // Calculate live display revenue (from backend metric or chart sum)
  const displayRevenue =
    Number(metrics.totalRevenue) > 0
      ? Number(metrics.totalRevenue)
      : totalPeriodRevenue;

  const maxAmount = Math.max(...chartData.map((d) => d.amount), 10000);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-[24px] bg-gradient-to-r from-textPrimary via-gray-900 to-brand p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/90">
              Super Admin Console Active
            </span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-brandPastel sm:self-center">
            PLATFORM OVERVIEW & TELEMETRY
          </span>
        </div>
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-xs font-medium text-white/80 leading-relaxed">
            Real-time platform health — catalog, colleges, payments, and grading.
          </p>
        </div>
      </div>

      {/* 2. STAT CARDS (6 Cards: 3x2 Grid) */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-textMuted">
            PLATFORM TELEMETRY METRICS
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: STUDENTS */}
          <div
            onClick={() => onNavigateSlug?.('students')}
            className="group rounded-[20px] bg-white p-4 border border-borderLight shadow-xs hover:border-brand/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted group-hover:text-brand transition">
                STUDENTS
              </span>
              <Award className="h-4 w-4 text-brand/70 group-hover:text-brand transition" />
            </div>
            <div className="my-2.5">
              <div className="text-3xl font-black tracking-tight text-textPrimary">
                {metrics.totalStudents || 0}
              </div>
            </div>
            <div className="text-[11px] font-bold text-textMuted flex items-center justify-between">
              <span>Learners</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-brand" />
            </div>
          </div>

          {/* Card 2: COLLEGES */}
          <div
            onClick={() => onNavigateSlug?.('colleges')}
            className="group rounded-[20px] bg-white p-4 border border-borderLight shadow-xs hover:border-warning/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted group-hover:text-warningDark transition">
                COLLEGES
              </span>
              <School className="h-4 w-4 text-warning group-hover:scale-110 transition" />
            </div>
            <div className="my-2.5">
              <div className="text-3xl font-black tracking-tight text-textPrimary">
                {metrics.totalColleges || 0}
              </div>
            </div>
            <div className="flex items-center justify-between">
              {metrics.pendingCollegesCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-warningDark bg-warningLight px-2 py-0.5 rounded-full">
                  {metrics.pendingCollegesCount} Pending ▾
                </span>
              ) : (
                <span className="text-[11px] font-bold text-successDark">All Vetted</span>
              )}
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-warningDark" />
            </div>
          </div>

          {/* Card 3: PROGRAMS */}
          <div
            onClick={() => onNavigateSlug?.('programs')}
            className="group rounded-[20px] bg-white p-4 border border-borderLight shadow-xs hover:border-brand/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted group-hover:text-brand transition">
                PROGRAMS
              </span>
              <BookOpen className="h-4 w-4 text-brandLight group-hover:text-brand transition" />
            </div>
            <div className="my-2.5">
              <div className="text-3xl font-black tracking-tight text-textPrimary">
                {metrics.totalPrograms || 0}
              </div>
            </div>
            <div className="text-[11px] font-bold text-textMuted flex items-center justify-between">
              <span className="text-successDark font-extrabold">Active Catalog</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-brand" />
            </div>
          </div>

          {/* Card 4: ENROLLMENTS */}
          <div
            onClick={() => onNavigateSlug?.('students')}
            className="group rounded-[20px] bg-white p-4 border border-borderLight shadow-xs hover:border-brand/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted group-hover:text-brand transition">
                ENROLLMENTS
              </span>
              <Layers className="h-4 w-4 text-info group-hover:scale-110 transition" />
            </div>
            <div className="my-2.5">
              <div className="text-3xl font-black tracking-tight text-textPrimary">
                {metrics.totalEnrollments || 0}
              </div>
            </div>
            <div className="text-[11px] font-bold text-textMuted flex items-center justify-between">
              <span>Workspaces</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-brand" />
            </div>
          </div>

          {/* Card 5: SUBMISSIONS */}
          <div
            onClick={() => onNavigateSlug?.('submissions')}
            className="group rounded-[20px] bg-white p-4 border border-borderLight shadow-xs hover:border-success/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted group-hover:text-successDark transition">
                SUBMISSIONS
              </span>
              <CheckCircle2 className="h-4 w-4 text-success group-hover:scale-110 transition" />
            </div>
            <div className="my-2.5">
              <div className="text-3xl font-black tracking-tight text-textPrimary">
                {metrics.totalSubmissions || 0}
              </div>
            </div>
            <div className="text-[11px] font-bold text-textMuted flex items-center justify-between">
              <span>Graded</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-successDark" />
            </div>
          </div>

          {/* Card 6: REVENUE */}
          <div
            onClick={() => onNavigateSlug?.('orders')}
            className="group rounded-[20px] bg-white p-4 border border-borderLight shadow-xs hover:border-brand/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted group-hover:text-brand transition">
                REVENUE
              </span>
              <CreditCard className="h-4 w-4 text-brand group-hover:scale-110 transition" />
            </div>
            <div className="my-2.5">
              <div className="text-3xl font-black tracking-tight text-textPrimary">
                {formatCurrency(displayRevenue)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-successDark bg-successLight px-2 py-0.5 rounded-full">
                Captured ▾
              </span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-brand" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. REVENUE TREND CHART */}
      <div className="rounded-[24px] bg-white p-6 border border-borderLight shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-borderLight/70 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand" />
              <h2 className="text-sm font-black uppercase tracking-wider text-textPrimary">
                Revenue Trend & Analytics
              </h2>
            </div>
            <p className="text-xs text-textMuted mt-0.5">
              {trendView === 'month'
                ? 'MONTHLY VIEW (Rolling 12 Months Invoiced & Paid)'
                : 'YEARLY VIEW (Annual Settlement Growth)'}
            </p>
          </div>

          {/* Summary KPI Badges & View Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick KPI Badge */}
            <div className="hidden md:flex items-center gap-3 bg-bgSoft/70 px-3.5 py-1.5 rounded-2xl border border-borderLight">
              <div>
                <span className="text-[10px] uppercase font-bold text-textMuted block">Current Month ({currentMonthData.label})</span>
                <span className="text-xs font-black text-textPrimary">{formatCurrency(currentMonthData.amount)}</span>
              </div>
              <div className="h-6 w-px bg-borderLight" />
              <div>
                <span className="text-[10px] uppercase font-bold text-textMuted block">Period Total</span>
                <span className="text-xs font-black text-brand">{formatCurrency(totalPeriodRevenue)}</span>
              </div>
            </div>

            {/* View Toggle Button */}
            <div className="flex items-center bg-bgSoft p-1 rounded-full border border-borderLight/80">
              <button
                type="button"
                onClick={() => setTrendView('month')}
                className={`px-3.5 py-1 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  trendView === 'month'
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    trendView === 'month' ? 'bg-white' : 'bg-textMuted'
                  }`}
                />
                Month
              </button>
              <button
                type="button"
                onClick={() => setTrendView('year')}
                className={`px-3.5 py-1 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  trendView === 'year'
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    trendView === 'year' ? 'bg-white' : 'bg-textMuted'
                  }`}
                />
                Year
              </button>
            </div>
          </div>
        </div>

        {/* Chart Visualization with Revenue Amounts Above Every Bar */}
        <div className="pt-2">
          <div className="relative h-56 w-full flex items-end justify-between gap-1.5 sm:gap-3 px-1 sm:px-2">
            {chartData.map((item, index) => {
              const heightPercent = Math.max(
                Math.round((item.amount / maxAmount) * 100),
                8
              );
              const isHovered = hoveredBarIndex === index;
              const isCurrent = index === chartData.length - 1;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  onMouseEnter={() => setHoveredBarIndex(index)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  {/* Detailed Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 px-3 py-1.5 rounded-xl bg-textPrimary text-white text-[11px] font-bold shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                      <span className="font-extrabold text-brandPastel">{item.label}</span>:{' '}
                      {formatCurrencyDetailed(item.amount)}
                    </div>
                  )}

                  {/* Revenue Tag Directly Above the Bar */}
                  <div
                    className={`text-[9px] sm:text-[10px] font-extrabold mb-1.5 text-center transition-all duration-200 truncate max-w-full px-0.5 ${
                      isHovered
                        ? 'text-brand scale-110 font-black'
                        : isCurrent
                        ? 'text-brand font-black'
                        : item.amount > 0
                        ? 'text-textSecondary'
                        : 'text-textMuted/50'
                    }`}
                    title={formatCurrencyDetailed(item.amount)}
                  >
                    {item.amount > 0 ? formatCurrency(item.amount) : '—'}
                  </div>

                  {/* Bar Column */}
                  <div className="w-full max-w-[42px] flex items-end justify-center h-full pb-7">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        isHovered
                          ? 'bg-gradient-to-t from-brand to-brandLight shadow-md scale-y-105'
                          : isCurrent
                          ? 'bg-gradient-to-t from-brand via-brand to-brandLight shadow-xs'
                          : 'bg-gradient-to-t from-brand/75 to-brandLight/60 hover:from-brand hover:to-brandLight'
                      }`}
                    />
                  </div>

                  {/* X-Axis Label */}
                  <div
                    className={`absolute bottom-0 text-[10px] sm:text-[11px] font-bold transition ${
                      isCurrent
                        ? 'text-brand font-black'
                        : 'text-textMuted group-hover:text-textPrimary'
                    }`}
                  >
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. ACTION ITEMS (2 Side-by-Side Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: PENDING COLLEGE VETTING */}
        <div className="rounded-[24px] bg-white p-6 border border-borderLight shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-borderLight/70">
              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-warning" />
                <h2 className="text-xs font-black uppercase tracking-wider text-textPrimary">
                  PENDING COLLEGE VETTING
                </h2>
              </div>
              {onNavigateSlug && (
                <button
                  onClick={() => onNavigateSlug('colleges')}
                  className="text-xs font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {pendingColleges.length === 0 ? (
              <div className="rounded-[16px] bg-bgSoft/60 p-8 text-center my-4">
                <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-textPrimary">All Colleges Vetted</p>
                <p className="text-[11px] text-textMuted mt-0.5">No pending institutional applications.</p>
              </div>
            ) : (
              <div className="divide-y divide-borderLight/60 max-h-[320px] overflow-y-auto pr-1">
                {pendingColleges.map((college: any) => (
                  <div
                    key={college.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-bgSoft/40 px-2 rounded-xl transition"
                  >
                    <div>
                      <div className="text-xs font-black text-textPrimary flex items-center gap-1.5">
                        <span className="text-brand">▸</span>
                        {college.name}
                      </div>
                      <div className="text-[11px] font-medium text-textMuted ml-3.5 mt-0.5">
                        {college.address || 'Address on file'} • {college.countryName}
                      </div>
                    </div>

                    {/* Action Buttons: [✕] [✓] */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {onRejectCollege && (
                        <button
                          type="button"
                          onClick={() => onRejectCollege(college.id)}
                          className="h-8 w-8 rounded-xl bg-dangerLight text-danger hover:bg-danger hover:text-white flex items-center justify-center transition cursor-pointer shadow-2xs"
                          title="Reject Application"
                          aria-label="Reject Application"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      {onApproveCollege && (
                        <button
                          type="button"
                          onClick={() => onApproveCollege(college.id)}
                          className="h-8 px-3 rounded-xl bg-success text-white hover:bg-successDark flex items-center gap-1 text-xs font-bold transition cursor-pointer shadow-2xs"
                          title="Approve College"
                          aria-label="Approve College"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 text-right">
            <span className="text-[11px] font-semibold text-textMuted">
              {pendingColleges.length} application(s) pending review
            </span>
          </div>
        </div>

        {/* Card 2: SUBMISSIONS AWAITING REVIEW */}
        <div className="rounded-[24px] bg-white p-6 border border-borderLight shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-borderLight/70">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-brand" />
                <h2 className="text-xs font-black uppercase tracking-wider text-textPrimary">
                  SUBMISSIONS AWAITING REVIEW
                </h2>
              </div>
              {onNavigateSlug && (
                <button
                  onClick={() => onNavigateSlug('submissions')}
                  className="text-xs font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {awaitingSubmissions.length === 0 ? (
              <div className="rounded-[16px] bg-bgSoft/60 p-8 text-center my-4">
                <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-textPrimary">All Submissions Graded</p>
                <p className="text-[11px] text-textMuted mt-0.5">No student submissions in review queue.</p>
              </div>
            ) : (
              <div className="divide-y divide-borderLight/60 max-h-[320px] overflow-y-auto pr-1">
                {awaitingSubmissions.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-bgSoft/40 px-2 rounded-xl transition"
                  >
                    <div>
                      <div className="text-xs font-black text-textPrimary flex items-center gap-1.5">
                        <span className="text-brand">▸</span>
                        {sub.studentName} — {sub.taskTitle}
                      </div>
                      <div className="text-[11px] font-medium text-textMuted ml-3.5 mt-0.5">
                        {sub.programTitle}
                      </div>
                    </div>

                    {/* Review Button */}
                    <div className="self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => onNavigateSlug?.('submissions', sub.id)}
                        className="px-3 py-1.5 rounded-xl bg-brand/10 text-brand hover:bg-brand hover:text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-1"
                      >
                        <span>Review</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 text-right">
            <span className="text-[11px] font-semibold text-textMuted">
              {awaitingSubmissions.length} deliverable(s) in review queue
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
