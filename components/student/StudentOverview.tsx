'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/types/catalog';
import { useAuth } from '@/context/AuthContext';
import {
  Clock,
  FolderKanban,
  Award,
  Send,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  GitBranch,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface StudentOverviewProps {
  projects?: Project[];
  programTitle?: string;
  overview?: any;
  overviewData?: any;
  profile?: any;
  programs?: any[];
  programsData?: any[];
  onSelectSlug?: (slug: string) => void;
  onNavigateSlug?: (slug: string) => void;
  onOpenSubmitModal?: (taskId: number, taskTitle: string, repoUrl?: string, workspaceId?: number) => void;
}

export const StudentOverview: React.FC<StudentOverviewProps> = ({
  projects = [],
  programTitle = 'Enrolled Internship Track',
  overview,
  overviewData: overviewDataProp,
  onSelectSlug,
  onNavigateSlug,
  onOpenSubmitModal,
}) => {
  const effectiveOverview = overview || overviewDataProp;
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigateFn = (slug: string) => {
    if (typeof onNavigateSlug === 'function') {
      onNavigateSlug(slug);
    } else if (typeof onSelectSlug === 'function') {
      onSelectSlug(slug);
    } else if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', slug);
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const metrics = effectiveOverview?.metrics || {
    hoursLogged: 0,
    totalHours: 120,
    completionPercentage: 0,
    projectsDone: 0,
    totalProjects: 3,
    currentScore: 0,
    maxScore: 100,
    grade: 'N/A',
    totalSubmissions: 0,
    gradedSubmissions: 0,
    totalTasks: 9,
    passedTasks: 0,
    certificateStatus: 'IN_PROGRESS',
    certificateUrl: null,
  };

  const recentAiReview = effectiveOverview?.recentAiReview || null;
  const currentActiveTask = effectiveOverview?.currentActiveTask || null;
  const title = effectiveOverview?.programTitle || programTitle;

  const firstName = mounted
    ? effectiveOverview?.firstName ||
      (user as any)?.student?.firstName ||
      user?.firstName ||
      (user as any)?.displayName ||
      user?.email?.split('@')[0] ||
      'Learner'
    : 'Learner';

  const totalTasks = metrics.totalTasks || 9;
  const passedTasks = metrics.passedTasks || 0;
  const currentMilestoneIndex = Math.min(totalTasks, passedTasks + 1);

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
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/90" suppressHydrationWarning>
              Student Workspace Active
            </span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-brandPastel sm:self-center" suppressHydrationWarning>
            {title}
          </span>
        </div>
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-xs font-medium text-white/80 leading-relaxed" suppressHydrationWarning>
            Welcome back, {firstName} — Milestone {currentMilestoneIndex} of {totalTasks} in progress ({metrics.completionPercentage}% completed, {metrics.hoursLogged} of {metrics.totalHours} hours logged).
          </p>
        </div>
      </div>

      {/* 2. Four Minimal KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Hours Logged */}
        <div
          onClick={() => navigateFn('program')}
          className="rounded-[24px] border border-borderLight bg-white p-5 shadow-xs hover:border-brand/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-textMuted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Hours Logged</span>
            <Clock className="h-4 w-4 text-brand" />
          </div>
          <div className="text-2xl font-black text-textPrimary" suppressHydrationWarning>
            {metrics.hoursLogged} <span className="text-xs font-bold text-textMuted">/ {metrics.totalHours} Hrs</span>
          </div>
          <div className="text-[10px] font-semibold text-textMuted mt-1">
            {metrics.completionPercentage}% of Total Curriculum
          </div>
        </div>

        {/* Capstones Done */}
        <div
          onClick={() => navigateFn('program')}
          className="rounded-[24px] border border-borderLight bg-white p-5 shadow-xs hover:border-brand/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-textMuted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Projects Done</span>
            <FolderKanban className="h-4 w-4 text-brand" />
          </div>
          <div className="text-2xl font-black text-textPrimary" suppressHydrationWarning>
            {metrics.projectsDone} <span className="text-xs font-bold text-textMuted">/ {metrics.totalProjects || 3} Capstones</span>
          </div>
          <div className="text-[10px] font-semibold text-textMuted mt-1">
            {(metrics.totalProjects || 3) - metrics.projectsDone > 0
              ? `${(metrics.totalProjects || 3) - metrics.projectsDone} Project(s) Remaining`
              : 'All Capstones Completed'}
          </div>
        </div>

        {/* AI Rubric Average Score */}
        <div
          onClick={() => navigateFn('submissions')}
          className="rounded-[24px] border border-borderLight bg-white p-5 shadow-xs hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-textMuted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">AI Avg Score</span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600" suppressHydrationWarning>
            {metrics.currentScore > 0 ? `${metrics.currentScore} / 100` : 'N/A'}
          </div>
          <div className="text-[10px] font-bold text-emerald-700 mt-1">
            {metrics.grade && metrics.grade !== 'N/A' ? `Grade: ${metrics.grade} (Passed)` : 'Awaiting Review'}
          </div>
        </div>

        {/* Certificate Status */}
        <div
          onClick={() => navigateFn('certificate')}
          className="rounded-[24px] border border-borderLight bg-white p-5 shadow-xs hover:border-brand/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-textMuted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Certificate</span>
            <CheckCircle2 className="h-4 w-4 text-brand" />
          </div>
          <div className="text-base font-black text-textPrimary mt-1" suppressHydrationWarning>
            <StatusBadge status={metrics.certificateStatus || 'IN_PROGRESS'} size="sm" />
          </div>
          <div className="text-[10px] font-semibold text-textMuted mt-1">
            {metrics.certificateStatus === 'ISSUED'
              ? 'Verified & Downloadable'
              : metrics.certificateStatus === 'ELIGIBLE'
              ? 'Eligible for Issuance'
              : 'Unlocks upon 100% Completion'}
          </div>
        </div>
      </div>

      {/* 3. Two Minimal Operational Cards (Current Active Task & Latest AI Feedback) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Current Active Task */}
        <div
          onClick={() => navigateFn('program')}
          className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-7 shadow-xs space-y-4 cursor-pointer hover:border-brand/40 transition-all"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-borderLight pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                <h2 className="text-sm font-black text-textPrimary">Current Active Task</h2>
              </div>
              {currentActiveTask?.status && (
                <StatusBadge status={currentActiveTask.status} size="sm" />
              )}
            </div>

            {currentActiveTask ? (
              <div className="space-y-2.5">
                <div>
                  <div className="text-[11px] font-extrabold uppercase text-brand tracking-wider">
                    {currentActiveTask.projectTitle}
                  </div>
                  <h3 className="text-base font-extrabold text-textPrimary mt-0.5">
                    Task #{currentActiveTask.orderIndex}: {currentActiveTask.taskTitle}
                  </h3>
                </div>

                {currentActiveTask.repoUrl && (
                  <div className="flex items-center gap-2 rounded-xl bg-bgSoft px-3 py-2 text-xs font-bold text-textSecondary truncate">
                    <GitBranch className="h-3.5 w-3.5 text-textMuted shrink-0" />
                    <span className="truncate">{currentActiveTask.repoUrl}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-xs font-bold text-textMuted text-center">
                All milestone deliverables are currently up to date!
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Latest AI Evaluation Review */}
        <div
          onClick={() => navigateFn('submissions')}
          className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-7 shadow-xs space-y-4 cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-borderLight pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-black text-textPrimary">Latest AI Evaluation</h2>
              </div>
              {recentAiReview?.status && (
                <StatusBadge status={recentAiReview.status} size="sm" />
              )}
            </div>

            {recentAiReview ? (
              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xs font-extrabold text-textPrimary truncate">
                    {recentAiReview.taskTitle || recentAiReview.stepTitle}
                  </h3>
                  <span className="text-base font-black text-emerald-600 shrink-0">
                    {recentAiReview.score} / {recentAiReview.maxScore || 100}
                  </span>
                </div>

                {recentAiReview.feedback && (
                  <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3 text-xs text-emerald-950 italic leading-relaxed">
                    &quot;{recentAiReview.feedback}&quot;
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center space-y-1.5">
                <Sparkles className="h-6 w-6 text-textMuted/40 mx-auto" />
                <div className="text-xs font-bold text-textPrimary">No AI Evaluation Yet</div>
                <p className="text-[11px] text-textMuted">
                  Submit code deliverables to receive automated AI rubric evaluations and feedback.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
