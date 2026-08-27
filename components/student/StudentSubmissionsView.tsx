'use client';

import React, { useState, useMemo } from 'react';
import {
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  GitCommit,
  ExternalLink,
  ArrowUpDown,
  FileCheck2,
} from 'lucide-react';
import { CustomDropdown } from '@/components/shared/CustomDropdown';

interface StudentSubmissionsViewProps {
  submissions: any[];
  onNavigateProgram?: () => void;
}

type SortField = 'id' | 'taskTitle' | 'submittedAt' | 'score' | 'status';
type SortDirection = 'asc' | 'desc';

export const StudentSubmissionsView: React.FC<StudentSubmissionsViewProps> = ({
  submissions = [],
  onNavigateProgram,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PASSED' | 'EVALUATING' | 'NEEDS_WORK'>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<SortField>('submittedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Summary KPI statistics
  const passedCount = submissions.filter((s) => s.status === 'PASSED').length;
  const evaluatingCount = submissions.filter((s) => s.status === 'EVALUATING' || s.status === 'MANUAL_REVIEW').length;
  const needsWorkCount = submissions.filter((s) => s.status === 'NEEDS_WORK').length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.toLowerCase();

    const filtered = submissions.filter((sub) => {
      const title = (sub.taskTitle || sub.stepTitle || `Submission #${sub.id}`).toLowerCase();
      const commit = (sub.commitHash || '').toLowerCase();
      const evaluator = (sub.evaluator || '').toLowerCase();
      const matchesSearch =
        title.includes(term) || commit.includes(term) || evaluator.includes(term);
      const matchesStatus =
        filterStatus === 'ALL'
          ? true
          : filterStatus === 'EVALUATING'
          ? sub.status === 'EVALUATING' || sub.status === 'MANUAL_REVIEW'
          : sub.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'submittedAt') {
        valA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        valB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      } else if (sortField === 'score') {
        valA = a.score ?? -1;
        valB = b.score ?? -1;
      } else if (sortField === 'taskTitle') {
        valA = (a.taskTitle || a.stepTitle || '').toLowerCase();
        valB = (b.taskTitle || b.stepTitle || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [submissions, searchTerm, filterStatus, sortField, sortDirection]);

  const totalRows = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const activePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedItems = useMemo(() => {
    const startIdx = (activePage - 1) * pageSize;
    return filteredAndSorted.slice(startIdx, startIdx + pageSize);
  }, [filteredAndSorted, activePage, pageSize]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (status: 'ALL' | 'PASSED' | 'EVALUATING' | 'NEEDS_WORK') => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[28px] bg-white p-6 border border-borderLight shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand text-xs font-black uppercase tracking-wider mb-1">
            <Send className="h-4 w-4" />
            <span>Task Deliverables & Evaluation History</span>
          </div>
          <h1 className="text-2xl font-black text-textPrimary">Submissions DataTable</h1>
          <p className="text-xs text-textMuted mt-1">
            Review objective rubric scores, evaluator feedback, and GitHub commit diffs across all milestone tasks.
          </p>
        </div>

        {onNavigateProgram && (
          <button
            onClick={onNavigateProgram}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand px-4 py-2.5 text-xs font-bold text-white hover:bg-brandDark transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <span>Open Workspaces</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Summary KPI Filter Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => handleFilterChange('ALL')}
          className={`rounded-[22px] p-4 border transition-all cursor-pointer ${
            filterStatus === 'ALL'
              ? 'bg-brand/5 border-brand ring-2 ring-brand/20 shadow-xs'
              : 'bg-white border-borderLight hover:border-borderLight/80 shadow-2xs'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-textMuted">Total Submissions</div>
          <div className="mt-1 text-2xl font-black text-textPrimary">{submissions.length}</div>
        </div>

        <div
          onClick={() => handleFilterChange('PASSED')}
          className={`rounded-[22px] p-4 border transition-all cursor-pointer ${
            filterStatus === 'PASSED'
              ? 'bg-statusPassedBg border-success ring-2 ring-success/20 shadow-xs'
              : 'bg-white border-borderLight hover:border-borderLight/80 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-statusPassedText">Passed</span>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
          <div className="mt-1 text-2xl font-black text-statusPassedText">{passedCount}</div>
        </div>

        <div
          onClick={() => handleFilterChange('EVALUATING')}
          className={`rounded-[22px] p-4 border transition-all cursor-pointer ${
            filterStatus === 'EVALUATING'
              ? 'bg-statusEvaluatingBg border-warning ring-2 ring-warning/20 shadow-xs'
              : 'bg-white border-borderLight hover:border-borderLight/80 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-statusEvaluatingText">In Evaluation</span>
            <Clock className="h-4 w-4 text-warning" />
          </div>
          <div className="mt-1 text-2xl font-black text-statusEvaluatingText">{evaluatingCount}</div>
        </div>

        <div
          onClick={() => handleFilterChange('NEEDS_WORK')}
          className={`rounded-[22px] p-4 border transition-all cursor-pointer ${
            filterStatus === 'NEEDS_WORK'
              ? 'bg-statusErrorBg border-danger ring-2 ring-danger/20 shadow-xs'
              : 'bg-white border-borderLight hover:border-borderLight/80 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-statusErrorText">Needs Work</span>
            <XCircle className="h-4 w-4 text-danger" />
          </div>
          <div className="mt-1 text-2xl font-black text-statusErrorText">{needsWorkCount}</div>
        </div>
      </div>

      {/* Main DataTable Container */}
      <div className="rounded-[28px] border border-borderLight bg-white shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-5 border-b border-borderLight flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search tasks or commit hashes..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-2xl border border-borderLight bg-bgSoft/50 py-2 pl-10 pr-4 text-xs font-semibold text-textPrimary placeholder:text-textMuted focus:border-brand focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-bgSoft p-1 rounded-2xl border border-borderLight">
              {(['ALL', 'PASSED', 'EVALUATING', 'NEEDS_WORK'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === status
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  {status === 'ALL'
                    ? 'All'
                    : status === 'PASSED'
                    ? 'Passed'
                    : status === 'EVALUATING'
                    ? 'Evaluating'
                    : 'Needs Work'}
                </button>
              ))}
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2 text-xs text-textMuted font-bold">
              <span>Show:</span>
              <div className="w-20">
                <CustomDropdown
                  options={[5, 10, 20, 50]}
                  value={pageSize}
                  onChange={(val) => handlePageSizeChange(Number(val))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-borderLight bg-bgSoft/60 text-[11px] font-extrabold uppercase tracking-wider text-textMuted">
                <th
                  onClick={() => handleSort('taskTitle')}
                  className="py-3.5 px-5 cursor-pointer hover:text-textPrimary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Task & Deliverable</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Git Commit / Diff</th>
                <th
                  onClick={() => handleSort('submittedAt')}
                  className="py-3.5 px-4 cursor-pointer hover:text-textPrimary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Submitted</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('score')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-textPrimary transition-colors"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Score</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-textPrimary transition-colors"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-borderLight/70">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-textMuted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileCheck2 className="h-8 w-8 text-textMuted opacity-40" />
                      <p className="font-bold text-sm text-textPrimary">No task submissions found</p>
                      <p className="text-xs text-textMuted max-w-sm">
                        {submissions.length === 0
                          ? 'You have not submitted any task deliverables yet.'
                          : 'No submissions matched your current search or filter criteria.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((sub: any) => {
                  const isExpanded = expandedId === sub.id;
                  const isPassed = sub.status === 'PASSED';
                  const isNeedsWork = sub.status === 'NEEDS_WORK';
                  const isEvaluating = sub.status === 'EVALUATING' || sub.status === 'MANUAL_REVIEW';

                  const formattedDate = sub.submittedAt
                    ? new Date(sub.submittedAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recent';

                  return (
                    <React.Fragment key={sub.id}>
                      <tr className="hover:bg-bgSoft/40 transition-colors group">
                        {/* Task Title & Milestone */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                                isPassed
                                  ? 'bg-statusPassedBg text-statusPassedText'
                                  : isEvaluating
                                  ? 'bg-statusEvaluatingBg text-statusEvaluatingText'
                                  : 'bg-statusErrorBg text-statusErrorText'
                              }`}
                            >
                              {isPassed ? '✓' : isEvaluating ? '⏳' : '✕'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-extrabold text-textPrimary text-xs truncate max-w-xs">
                                {sub.taskTitle || sub.stepTitle || `Task #${sub.id}`}
                              </div>
                              <div className="text-[10px] text-textMuted font-medium flex items-center gap-1.5 mt-0.5">
                                <span>{sub.evaluator || 'AI Reviewer Engine'}</span>
                                {sub.attemptIndex && (
                                  <>
                                    <span>•</span>
                                    <span>Attempt #{sub.attemptIndex}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Commit Hash & Diff Link */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col items-start gap-1">
                            {sub.commitHash ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-bgSoft border border-borderLight text-[10px] font-mono font-bold text-brand">
                                <GitCommit className="h-3 w-3" />
                                <span>#{sub.commitHash.substring(0, 8)}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-textMuted font-medium">Deliverable Link</span>
                            )}

                            {sub.payloadUrl && (
                              <a
                                href={sub.payloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline"
                              >
                                <span>{sub.commitHash ? 'Inspect Diff' : 'View Payload'}</span>
                                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Submission Date */}
                        <td className="py-4 px-4 text-xs font-medium text-textMuted whitespace-nowrap">
                          {formattedDate}
                        </td>

                        {/* Score Column */}
                        <td className="py-4 px-4 text-center">
                          {sub.score !== undefined && sub.score !== null ? (
                            <span
                              className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black border ${
                                isPassed
                                  ? 'bg-statusPassedBg text-statusPassedText border-statusPassedBorder'
                                  : 'bg-statusErrorBg text-statusErrorText border-statusErrorBorder'
                              }`}
                            >
                              {sub.score} / {sub.maxScore || 100}
                            </span>
                          ) : (
                            <span className="text-textMuted font-bold">—</span>
                          )}
                        </td>

                        {/* Status Pill */}
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              isPassed
                                ? 'bg-statusPassedBg text-statusPassedText border-statusPassedBorder'
                                : isNeedsWork
                                ? 'bg-statusErrorBg text-statusErrorText border-statusErrorBorder'
                                : 'bg-statusEvaluatingBg text-statusEvaluatingText border-statusEvaluatingBorder'
                            }`}
                          >
                            {isPassed
                              ? '✓ Passed'
                              : isNeedsWork
                              ? '✕ Needs Work'
                              : '⏳ Evaluating'}
                          </span>
                        </td>

                        {/* Action Column */}
                        <td className="py-4 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-bgSoft hover:bg-brand hover:text-white text-textPrimary text-xs font-black transition-all cursor-pointer border border-borderLight shadow-2xs"
                          >
                            <span>{isExpanded ? 'Hide' : 'Details'}</span>
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Evaluation & Criteria Breakdown Row */}
                      {isExpanded && (
                        <tr className="bg-bgSoft/50 border-b border-borderLight">
                          <td colSpan={6} className="p-4 sm:p-5">
                            <div className="rounded-2xl border border-borderLight bg-white p-4 space-y-3 shadow-2xs">
                              <div className="flex items-center justify-between border-b border-borderLight/60 pb-2.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-brand">
                                  <ShieldCheck className="h-4 w-4" />
                                  <span>Automated AI Evaluator Review</span>
                                </div>
                                <div className="text-[11px] font-extrabold text-textMuted">
                                  Evaluation Status:{' '}
                                  <span
                                    className={
                                      isPassed
                                        ? 'text-statusPassedText'
                                        : isNeedsWork
                                        ? 'text-statusErrorText'
                                        : 'text-statusEvaluatingText'
                                    }
                                  >
                                    {sub.status}
                                  </span>
                                </div>
                              </div>

                              {/* Feedback Instruction */}
                              {sub.feedback ? (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-textMuted">
                                    Review Feedback:
                                  </span>
                                  <p className="rounded-xl bg-bgSoft/80 p-3 text-xs font-semibold text-textPrimary italic leading-relaxed border border-borderLight/40">
                                    &ldquo;{sub.feedback}&rdquo;
                                  </p>
                                </div>
                              ) : (
                                <p className="text-xs text-textMuted italic">
                                  No written feedback attached for this evaluation attempt.
                                </p>
                              )}

                              {/* Rubric Criteria Evaluation Breakdown */}
                              {Array.isArray(sub.criteriaBreakdown) && sub.criteriaBreakdown.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-textMuted block">
                                    Rubric Criteria Evaluation:
                                  </span>
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    {sub.criteriaBreakdown.map((crit: any, cIdx: number) => (
                                      <div
                                        key={cIdx}
                                        className="rounded-xl bg-bgSoft/70 border border-borderLight/60 p-2.5 flex items-center justify-between text-xs"
                                      >
                                        <span className="font-semibold text-textPrimary truncate mr-2">
                                          {crit.criterion || crit.name || `Criterion ${cIdx + 1}`}
                                        </span>
                                        <span className="font-black text-statusPassedText shrink-0">
                                          {crit.score} / {crit.maxScore}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* DataTable Footer & Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-bgSoft/40 border-t border-borderLight text-xs font-bold text-textMuted">
          <div>
            Showing{' '}
            <span className="font-black text-textPrimary">
              {totalRows === 0 ? 0 : (activePage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-black text-textPrimary">
              {Math.min(activePage * pageSize, totalRows)}
            </span>{' '}
            of <span className="font-black text-textPrimary">{totalRows}</span> submissions
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={activePage === 1}
              className="p-2 rounded-xl bg-white border border-borderLight text-textPrimary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-bgSoft transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - activePage) <= 1)
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-1">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 min-w-[32px] rounded-xl px-2.5 text-xs font-black transition-all cursor-pointer ${
                        activePage === page
                          ? 'bg-brand text-white shadow-xs'
                          : 'bg-white border border-borderLight text-textPrimary hover:bg-bgSoft'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={activePage >= totalPages}
              className="p-2 rounded-xl bg-white border border-borderLight text-textPrimary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-bgSoft transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
