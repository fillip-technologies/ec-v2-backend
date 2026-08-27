'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Download,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { getAdminAnalyticsOverview } from '@/lib/api/admin';
import { showToast } from '@/lib/toast';
import { AdminCollegeBenchmarksTable } from './analytics/AdminCollegeBenchmarksTable';
import { AdminGeographicReachCard } from './analytics/AdminGeographicReachCard';

export const AdminAnalyticsView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminAnalyticsOverview();
      if (res) {
        setData(res);
        if (isManual) {
          showToast.success('Analytics intelligence updated', 'Synced');
        }
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load analytics', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Metric', 'Value'],
        ['Total Revenue (INR)', data.kpis.totalRevenue],
        ['B2C Revenue', data.kpis.b2cRevenue],
        ['B2B Revenue', data.kpis.b2bRevenue],
        ['Active Interns', data.kpis.activeInterns],
        ['Partner Colleges', data.kpis.partnerColleges],
        ['Total Seats Sold', data.kpis.totalSeatsSold],
        ['Seat Utilization %', `${data.kpis.seatUtilizationPercentage}%`],
        ['AI Evaluations Total', data.kpis.aiEvaluations.total],
        ['AI Evaluations Passed', data.kpis.aiEvaluations.passed],
        ['AI Evaluations Needs Work', data.kpis.aiEvaluations.needsWork],
      ]
        .map((e) => e.join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `engineers_clinic_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success('Analytics data exported as CSV', 'Exported');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 rounded-[28px] border border-borderLight bg-white shadow-xs">
        <Loader2 className="h-9 w-9 animate-spin text-brand" />
        <span className="text-xs font-black text-textMuted uppercase tracking-wider mt-3">
          Aggregating Executive Intelligence & Telemetry...
        </span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-[28px] border border-dashed border-borderLight bg-white p-12 text-center shadow-xs">
        <BarChart3 className="h-10 w-10 text-textMuted/40 mx-auto" />
        <h3 className="text-base font-black text-textPrimary mt-3">Analytics Unavailable</h3>
        <p className="text-xs text-textMuted mt-1">Could not retrieve aggregated metrics from the database.</p>
        <button
          onClick={() => fetchOverview(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brandHover transition cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry Sync
        </button>
      </div>
    );
  }

  const { kpis, revenueTrends, learningFunnel, programPopularity, aiRubricQuality } = data;
  const maxMonthlyRevenue = Math.max(...revenueTrends.map((m: any) => m.total || 0), 1000);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-borderLight shadow-xs">
        <div>
          <h1 className="text-xl font-black text-textPrimary flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-brand" />
            Analytics & Executive Intelligence
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Real-time financial performance, learning pipeline funnel, AI rubric grading quality, and institutional cohort benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2 text-xs font-bold text-textPrimary hover:bg-borderLight transition cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-textMuted" />
            <span>Export Report</span>
          </button>
          <button
            onClick={() => fetchOverview(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-borderLight bg-white px-3.5 py-2 text-xs font-bold text-textPrimary hover:bg-bgSoft hover:text-brand transition cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Row 1: Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Revenue */}
        <div className="rounded-[24px] border border-borderLight bg-white p-5 shadow-xs relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted">TOTAL REVENUE (GMV)</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-textPrimary">
              ₹ {kpis.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                B2C: {kpis.b2cPercentage}%
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                B2B: {kpis.b2bPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Student Cohorts */}
        <div className="rounded-[24px] border border-borderLight bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted">ACTIVE STUDENT COHORTS</span>
            <div className="h-8 w-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-textPrimary">
              {kpis.activeInterns.toLocaleString('en-IN')} <span className="text-xs font-bold text-textMuted">Interns</span>
            </div>
            <div className="text-xs font-bold text-textMuted mt-1">
              Registered across all active programs
            </div>
          </div>
        </div>

        {/* Card 3: B2B Institutional Adoption */}
        <div className="rounded-[24px] border border-borderLight bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted">B2B INSTITUTIONS</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-textPrimary">
              {kpis.partnerColleges} <span className="text-xs font-bold text-textMuted">Partner Colleges</span>
            </div>
            <div className="text-xs font-bold text-textMuted mt-1">
              {kpis.totalSeatsSold} seats sold • <span className="text-brand font-black">{kpis.seatUtilizationPercentage}% utilized</span>
            </div>
          </div>
        </div>

        {/* Card 4: AI Evaluations (Pass & Needs Work Only) */}
        <div className="rounded-[24px] border border-borderLight bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted">AI EVALUATIONS</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-textPrimary">
              {kpis.aiEvaluations.total} <span className="text-xs font-bold text-textMuted">Total Graded</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Passed: {kpis.aiEvaluations.passed} ({kpis.aiEvaluations.passedPercentage}%)
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                <XCircle className="h-3.5 w-3.5" /> Needs Work: {kpis.aiEvaluations.needsWork}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Financial Intelligence & 4-Stage Learning Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Financial & Revenue Trends */}
        <div className="rounded-[28px] border border-borderLight bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-textPrimary">1. Financial & Revenue Intelligence</h3>
              <p className="text-xs text-textMuted">12-month rolling revenue breakdown (B2C Direct vs B2B Seats)</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>B2C</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                <span>B2B</span>
              </div>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 pt-6 border-b border-borderLight/60 pb-2">
            {revenueTrends.map((m: any, idx: number) => {
              const b2cHeight = (m.b2c / maxMonthlyRevenue) * 100;
              const b2bHeight = (m.b2b / maxMonthlyRevenue) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-textPrimary text-white text-[10px] font-bold py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-10 shadow-lg">
                    {m.month}: ₹{(m.total || 0).toLocaleString('en-IN')}
                  </div>

                  <div className="w-full max-w-[28px] flex flex-col justify-end h-full">
                    {m.b2b > 0 && (
                      <div
                        className="w-full bg-brand rounded-t-sm transition-all duration-300"
                        style={{ height: `${Math.max(b2bHeight, 4)}%` }}
                        title={`B2B: ₹${m.b2b}`}
                      />
                    )}
                    {m.b2c > 0 && (
                      <div
                        className={`w-full bg-emerald-500 transition-all duration-300 ${m.b2b === 0 ? 'rounded-t-sm' : ''}`}
                        style={{ height: `${Math.max(b2cHeight, 4)}%` }}
                        title={`B2C: ₹${m.b2c}`}
                      />
                    )}
                    {m.total === 0 && (
                      <div className="w-full bg-bgSoft h-1 rounded-sm" />
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-textMuted truncate max-w-[36px]">
                    {m.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Student Learning Funnel (4 Stages) */}
        <div className="rounded-[28px] border border-borderLight bg-white p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-black text-textPrimary">2. Student Learning Funnel & Pipeline</h3>
            <p className="text-xs text-textMuted">Conversion progression across key academic milestones</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {learningFunnel.map((step: any, idx: number) => {
              const bgColors = ['bg-blue-500', 'bg-brand', 'bg-purple-500', 'bg-emerald-500'];
              const color = bgColors[idx % bgColors.length];

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-textPrimary flex items-center gap-2">
                      <span className="flex h-5 w-5 rounded-full bg-bgSoft items-center justify-center text-[10px] font-black text-textMuted">
                        {idx + 1}
                      </span>
                      {step.stage}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-textPrimary">{step.count} students</span>
                      <span className="text-[11px] text-textMuted">({step.conversionPct}%)</span>
                    </div>
                  </div>
                  <div className="h-3 w-full rounded-full bg-bgSoft overflow-hidden border border-borderLight/60">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(step.conversionPct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Program Popularity & AI Rubric Quality */}
      {/* Row 3: Program Popularity & AI Rubric Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Section 3: Program Popularity */}
        <div className="rounded-[28px] border border-borderLight bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-textPrimary">3. Top Program Popularity & Enrollments</h3>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand bg-brand/10 px-2 py-0.5 rounded-md">
                {programPopularity.length} Tracks
              </span>
            </div>
            <p className="text-xs text-textMuted mt-0.5">Student distribution across published industry tracks</p>
          </div>

          <div className="space-y-3 pt-2 max-h-[220px] overflow-y-auto pr-2 [scrollbar-width:thin] scrollbar-thin scrollbar-thumb-borderLight hover:scrollbar-thumb-brand/40 flex-1">
            {programPopularity.map((prog: any, idx: number) => (
              <div key={prog.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-textPrimary truncate max-w-[260px] sm:max-w-[280px]" title={prog.title}>
                    {idx + 1}. {prog.title}
                  </span>
                  <span className="text-brand font-black shrink-0 text-[11px]">
                    {prog.enrolledCount} enrolled ({prog.sharePct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-bgSoft overflow-hidden border border-borderLight/60">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(prog.sharePct, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: AI Rubric Score Distribution */}
        <div className="rounded-[28px] border border-borderLight bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-textPrimary">4. AI Rubric Evaluation Quality & Score Spread</h3>
              <p className="text-xs text-textMuted mt-0.5">Score distribution curve ({aiRubricQuality.totalEvaluated} reviews)</p>
            </div>
            <div className="rounded-xl bg-purple-50 border border-purple-200 px-3 py-1 text-center shrink-0">
              <div className="text-[9px] font-black uppercase tracking-wider text-purple-700">AVG SCORE</div>
              <div className="text-sm font-black text-purple-900">{aiRubricQuality.avgScore} / 100</div>
            </div>
          </div>

          <div className="space-y-3 pt-2 max-h-[220px] overflow-y-auto pr-1 flex-1">
            {aiRubricQuality.distribution.map((bucket: any, idx: number) => {
              const barColors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500'];
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-textPrimary">{bucket.label}</span>
                    <span className="text-textMuted font-bold text-[11px]">
                      {bucket.count} submissions ({bucket.pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-bgSoft overflow-hidden border border-borderLight/60">
                    <div
                      className={`h-full ${barColors[idx % barColors.length]} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(bucket.pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 4: Section 5 - B2B Institutional Benchmarks Dedicated Datatable */}
      <AdminCollegeBenchmarksTable />

      {/* Row 5: Section 6 - Global Geographic Reach Dedicated Scrollable Card (Shows 6 items then scrolls) */}
      <AdminGeographicReachCard />
    </div>
  );
};
