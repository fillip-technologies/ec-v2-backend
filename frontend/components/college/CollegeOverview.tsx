'use client';

import React from 'react';
import {
  Users,
  Award,
  Ticket,
  CheckCircle2,
  ArrowRight,
  School,
  FileText,
  Building,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface CollegeOverviewProps {
  overviewData: any;
  onNavigateSlug?: (slug: string) => void;
}

export const CollegeOverview: React.FC<CollegeOverviewProps> = ({
  overviewData,
  onNavigateSlug,
}) => {
  const collegeInfo = overviewData?.college || {
    name: 'College Campus',
    address: 'Campus Address',
    status: 'ACTIVE',
  };

  const metrics = overviewData?.metrics || {
    totalStudents: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    totalSeatsAllocated: 0,
  };

  const activeCouponBatches = overviewData?.activeCouponBatches || [];
  const cohortByTrack = overviewData?.cohortByTrack || [];
  const recentCohortStudents = overviewData?.recentCohortStudents || [];

  const totalSeats = metrics.totalSeatsAllocated || 0;
  const utilizationPct = totalSeats > 0 ? Math.min(100, Math.round((metrics.totalStudents / totalSeats) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-[24px] bg-linear-to-r from-textPrimary via-gray-900 to-brand p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/90">
              Institutional Portal Active
            </span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-brandPastel sm:self-center">
            CAMPUS COHORT TELEMETRY
          </span>
        </div>
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-xs font-medium text-white/80 leading-relaxed">
            {collegeInfo.name} — {collegeInfo.address || 'Approved Partner Campus'}
          </p>
        </div>
      </div>

      {/* 2. Four Minimal KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Cohort Students */}
        <div
          onClick={() => onNavigateSlug?.('students')}
          className="rounded-[24px] border border-borderLight bg-white p-5 shadow-xs hover:border-brand/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-textMuted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cohort Students</span>
            <Users className="h-4 w-4 text-brand" />
          </div>
          <div className="text-2xl font-black text-textPrimary">{metrics.totalStudents}</div>
          <div className="text-[10px] font-semibold text-textMuted mt-1">Institutional Enrolments</div>
        </div>

        {/* Active Workspaces */}
        <div
          onClick={() => onNavigateSlug?.('students')}
          className="rounded-[24px] border border-borderLight bg-white p-5 shadow-xs hover:border-brand/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-textMuted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Workspaces</span>
            <Award className="h-4 w-4 text-brand" />
          </div>
          <div className="text-2xl font-black text-textPrimary">{metrics.activeEnrollments}</div>
          <div className="text-[10px] font-semibold text-brand mt-1">In-Progress Internships</div>
        </div>

        {/* Certifications */}
        <div
          onClick={() => onNavigateSlug?.('reports')}
          className="rounded-[24px] border border-borderLight bg-white p-5 shadow-xs hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-textMuted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Certifications</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{metrics.completedEnrollments}</div>
          <div className="text-[10px] font-semibold text-emerald-700 mt-1">100% QR Verified</div>
        </div>

        {/* Seats Allocated */}
        <div
          onClick={() => onNavigateSlug?.('coupons')}
          className="rounded-[24px] border border-borderLight bg-white p-5 shadow-xs hover:border-brand/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-textMuted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Seats Allocated</span>
            <Ticket className="h-4 w-4 text-brand" />
          </div>
          <div className="text-2xl font-black text-textPrimary">
            {metrics.totalStudents} <span className="text-xs font-bold text-textMuted">/ {totalSeats || 0}</span>
          </div>
          <div className="text-[10px] font-semibold text-textMuted mt-1">
            {utilizationPct}% Seat Utilization
          </div>
        </div>
      </div>

      {/* 3. Two Split Minimal Cards (Active Coupon Batches & Cohort by Track) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Active Coupon Batches */}
        <div className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-7 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-borderLight pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-brand" />
                <h2 className="text-sm font-black text-textPrimary">Active Coupon Batches</h2>
              </div>
              {onNavigateSlug && (
                <button
                  onClick={() => onNavigateSlug('coupons')}
                  className="text-xs font-bold text-brand hover:underline cursor-pointer"
                >
                  Manage All →
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {activeCouponBatches.length === 0 ? (
                <div className="py-6 text-center text-xs font-bold text-textMuted">
                  No active coupon batches generated yet.
                </div>
              ) : (
                activeCouponBatches.map((batch: any) => (
                  <div
                    key={batch.id}
                    className="p-3 rounded-2xl border border-borderLight/80 bg-bgSoft/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-brand bg-brand/10 px-2 py-0.5 rounded-lg border border-brand/20">
                          {batch.batchCode}
                        </span>
                        <StatusBadge status={batch.status || 'ACTIVE'} size="sm" />
                      </div>
                      <div className="text-[11px] font-medium text-textMuted truncate">
                        {batch.programTitle}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-textPrimary">
                        {batch.redeemedSeats} / {batch.totalSeats} Seats
                      </div>
                      <div className="text-[10px] font-bold text-textMuted">
                        ({batch.redemptionPercentage}% Redeemed)
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Cohort by Track */}
        <div className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-7 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-borderLight pb-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-brand" />
                <h2 className="text-sm font-black text-textPrimary">Cohort by Track</h2>
              </div>
              {onNavigateSlug && (
                <button
                  onClick={() => onNavigateSlug('reports')}
                  className="text-xs font-bold text-brand hover:underline cursor-pointer"
                >
                  Reports →
                </button>
              )}
            </div>

            <div className="space-y-3">
              {cohortByTrack.length === 0 ? (
                <div className="py-6 text-center text-xs font-bold text-textMuted">
                  No cohort enrollment data available yet.
                </div>
              ) : (
                cohortByTrack.map((track: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-textPrimary truncate">{track.programTitle}</span>
                      <span className="text-textMuted shrink-0">
                        {track.count} Students ({track.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-bgSoft overflow-hidden border border-borderLight">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${Math.min(100, Math.max(0, track.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Recent Campus Students */}
      <div className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-borderLight pb-3">
          <div>
            <h2 className="text-sm font-black text-textPrimary">Recent Campus Students</h2>
            <p className="text-xs text-textMuted">Latest student activity and milestone deliverable progress</p>
          </div>
          {onNavigateSlug && (
            <button
              onClick={() => onNavigateSlug('students')}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline cursor-pointer"
            >
              <span>View All Students</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-borderLight text-[11px] font-extrabold uppercase tracking-wider text-textMuted">
                <th className="pb-3 font-extrabold">Student Name</th>
                <th className="pb-3 font-extrabold">Enrolled Track</th>
                <th className="pb-3 font-extrabold">Milestones</th>
                <th className="pb-3 font-extrabold">Progress</th>
                <th className="pb-3 font-extrabold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLight/60">
              {recentCohortStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs font-bold text-textMuted">
                    No students currently enrolled in this college cohort.
                  </td>
                </tr>
              ) : (
                recentCohortStudents.map((s: any) => (
                  <tr key={s.id} className="hover:bg-bgSoft/50 transition-colors">
                    <td className="py-3.5 font-bold text-textPrimary">
                      <div>{s.displayName}</div>
                      <div className="text-[11px] font-medium text-textMuted">{s.email}</div>
                    </td>
                    <td className="py-3.5 text-textSecondary font-medium">{s.programTitle}</td>
                    <td className="py-3.5 font-bold text-textPrimary">
                      {s.passedTasks !== undefined && s.totalTasks !== undefined
                        ? `${s.passedTasks} / ${s.totalTasks} Tasks`
                        : `${s.completionPercentage}%`}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2 max-w-30">
                        <div className="h-1.5 flex-1 rounded-full bg-bgSoft overflow-hidden border border-borderLight">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${Math.min(100, Math.max(0, s.completionPercentage))}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-black text-textPrimary">{s.completionPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right">
                      <StatusBadge status={s.enrollmentStatus || 'ACTIVE'} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
