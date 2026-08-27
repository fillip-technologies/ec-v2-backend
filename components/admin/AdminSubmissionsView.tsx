'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getAdminSubmissions, reviewSubmission } from '@/lib/api/admin';
import { showToast } from '@/lib/toast';
import {
  Search,
  ExternalLink,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  Award,
  Pencil,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileCheck2,
  GitCommit,
} from 'lucide-react';
import { CustomDropdown } from '@/components/shared/CustomDropdown';

export function AdminSubmissionsView() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'EVALUATING' | 'PASSED' | 'NEEDS_WORK'>('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Sorting State
  const [sortField, setSortField] = useState<string>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Review & Score Modal State
  const [reviewingSub, setReviewingSub] = useState<any | null>(null);
  const [statusDecision, setStatusDecision] = useState<'PASSED' | 'NEEDS_WORK' | 'EVALUATING'>('PASSED');
  const [score, setScore] = useState<number>(85);
  const [feedback, setFeedback] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await getAdminSubmissions({
        page: currentPage,
        limit: pageSize,
        search: searchTerm.trim() || undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
      });

      if (res && res.data && res.meta) {
        setSubmissions(res.data);
        setTotalCount(res.meta.total);
        setTotalPages(res.meta.totalPages);
      } else if (Array.isArray(res)) {
        setSubmissions(res);
        setTotalCount(res.length);
        setTotalPages(Math.ceil(res.length / pageSize) || 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage, pageSize, searchTerm, filterStatus]);

  const handleOpenReview = (sub: any) => {
    setReviewingSub(sub);
    const initialStatus = (sub.status as 'PASSED' | 'NEEDS_WORK' | 'EVALUATING') || 'EVALUATING';
    setStatusDecision(initialStatus === 'EVALUATING' ? 'PASSED' : initialStatus);

    const maxScore = sub.maxScore || 100;
    const passThreshold = sub.passThreshold || 60;

    setScore(
      sub.score !== undefined && sub.score !== null
        ? Number(sub.score)
        : initialStatus === 'PASSED'
        ? Math.max(passThreshold, Math.round(maxScore * 0.85))
        : initialStatus === 'NEEDS_WORK'
        ? Math.round(passThreshold * 0.75)
        : Math.max(passThreshold, Math.round(maxScore * 0.85))
    );
    setFeedback(
      sub.feedback ||
        (initialStatus === 'PASSED'
          ? 'Great work! Code verified and passed all requirements.'
          : initialStatus === 'NEEDS_WORK'
          ? 'Please revise your submission according to the task requirements and resubmit.'
          : 'Great work! Implementation and tests verified successfully.')
    );
  };

  const handleStatusDecisionChange = (newStatus: 'PASSED' | 'NEEDS_WORK' | 'EVALUATING') => {
    setStatusDecision(newStatus);
    const maxScore = reviewingSub?.maxScore || 100;
    const passThreshold = reviewingSub?.passThreshold || 60;

    if (newStatus === 'PASSED') {
      if (score < passThreshold) {
        setScore(Math.max(passThreshold, Math.round(maxScore * 0.85)));
      }
      if (!feedback || feedback.includes('revise')) {
        setFeedback('Great work! Code verified and passed all requirements.');
      }
    } else if (newStatus === 'NEEDS_WORK') {
      if (score >= passThreshold) {
        setScore(Math.round(passThreshold * 0.75));
      }
      if (!feedback || feedback.includes('Great work')) {
        setFeedback('Please revise your submission according to the task requirements and resubmit.');
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSub) return;

    setSubmittingReview(true);
    try {
      const finalScore = statusDecision === 'EVALUATING' ? 0 : Number(score) || 0;
      const finalFeedback =
        feedback ||
        (statusDecision === 'PASSED'
          ? 'Approved by admin'
          : statusDecision === 'NEEDS_WORK'
          ? 'Changes requested by admin'
          : 'Moved back to evaluating');

      await reviewSubmission(reviewingSub.id, statusDecision, finalScore, finalFeedback);

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === reviewingSub.id
            ? { ...s, status: statusDecision, score: finalScore, feedback: finalFeedback }
            : s
        )
      );
      setReviewingSub(null);
      showToast.success(
        `Submission #${reviewingSub.id} graded as ${statusDecision} (${finalScore}/${reviewingSub.maxScore || 100}).`,
        'Evaluation Saved'
      );
    } catch (err: any) {
      const msg = err.message || 'Failed to submit review';
      showToast.error(msg, 'Review Failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filtered & Sorted Submissions
  const filteredAndSortedSubmissions = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return submissions
      .filter((sub) => {
        const matchesSearch =
          (sub.studentName || '').toLowerCase().includes(term) ||
          (sub.studentEmail || '').toLowerCase().includes(term) ||
          (sub.projectTitle || '').toLowerCase().includes(term) ||
          (sub.taskTitle || '').toLowerCase().includes(term);

        const matchesStatus = filterStatus === 'ALL' || sub.status === filterStatus;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [submissions, searchTerm, filterStatus, sortField, sortAsc]);

  // Pagination Calculations
  const totalRows = totalCount || filteredAndSortedSubmissions.length;
  const paginatedSubmissions = filteredAndSortedSubmissions;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Compute Presets for the active reviewingSub
  const computedPresets = useMemo(() => {
    if (!reviewingSub) return [];
    const max = reviewingSub.maxScore || 100;
    const threshold = reviewingSub.passThreshold || 60;

    if (statusDecision === 'PASSED') {
      const set = new Set<number>([
        max,
        Math.round(max * 0.95),
        Math.round(max * 0.9),
        Math.round(max * 0.85),
        Math.round(max * 0.8),
        threshold,
      ]);
      return Array.from(set)
        .filter((n) => n >= threshold && n <= max)
        .sort((a, b) => b - a);
    } else {
      const set = new Set<number>([
        Math.max(0, threshold - 5),
        Math.round(threshold * 0.75),
        Math.round(threshold * 0.5),
        Math.round(threshold * 0.25),
        0,
      ]);
      return Array.from(set)
        .filter((n) => n < threshold && n >= 0)
        .sort((a, b) => b - a);
    }
  }, [reviewingSub, statusDecision]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-borderLight shadow-xs">
        <div>
          <h1 className="text-xl font-black text-textPrimary flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-brand" />
            Review Submissions
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Vet, inspect, and evaluate deliverables submitted by enrolled students across all programs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSubmissions}
            className="rounded-xl border border-borderLight bg-white px-3.5 py-2 text-xs font-bold text-textPrimary hover:bg-bgSoft transition-all cursor-pointer shadow-2xs"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Datatable Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-[20px] border border-borderLight shadow-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
          <input
            type="text"
            placeholder="Search student, email, project, task..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl bg-bgSoft pl-10 pr-4 py-2.5 text-xs font-bold text-textPrimary placeholder:text-textMuted border border-borderLight/60 focus:outline-none focus:border-brand"
          />
        </div>

        {/* Status Filters & Rows Per Page */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Filter className="h-4 w-4 text-textMuted shrink-0 mr-1" />
            {(['ALL', 'EVALUATING', 'PASSED', 'NEEDS_WORK'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-bgSoft text-textPrimary hover:bg-borderLight'
                }`}
              >
                {status === 'EVALUATING' ? 'Pending' : status === 'ALL' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-textMuted border-l border-borderLight pl-3">
            <span>Rows:</span>
            <div className="w-20">
              <CustomDropdown
                options={[10, 25, 50]}
                value={pageSize}
                onChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Datatable Table Card */}
      <div className="bg-white rounded-[24px] border border-borderLight shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs font-bold text-textMuted flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            <span>Loading submissions...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-xs font-bold text-danger">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bgSoft/80 border-b border-borderLight text-[11px] font-extrabold uppercase tracking-wider text-textMuted select-none">
                    <th
                      onClick={() => handleSort('studentName')}
                      className="py-4 px-5 cursor-pointer hover:text-brand transition-all"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Student</span>
                        <ArrowUpDown className="h-3 w-3 text-textMuted" />
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('projectTitle')}
                      className="py-4 px-4 cursor-pointer hover:text-brand transition-all"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Project & Task</span>
                        <ArrowUpDown className="h-3 w-3 text-textMuted" />
                      </div>
                    </th>

                    <th className="py-4 px-4">Deliverable URL</th>

                    <th
                      onClick={() => handleSort('score')}
                      className="py-4 px-4 text-center cursor-pointer hover:text-brand transition-all"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Score</span>
                        <ArrowUpDown className="h-3 w-3 text-textMuted" />
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('status')}
                      className="py-4 px-4 text-center cursor-pointer hover:text-brand transition-all"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Status</span>
                        <ArrowUpDown className="h-3 w-3 text-textMuted" />
                      </div>
                    </th>

                    <th className="py-4 px-5 text-right">Review Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-borderLight/60 text-xs">
                  {paginatedSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-textMuted font-bold">
                        No submissions found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-bgSoft/40 transition-all">
                        {/* Student Details */}
                        <td className="py-4 px-5">
                          <div className="font-black text-textPrimary">{sub.studentName}</div>
                          <div className="text-[10px] text-textMuted">{sub.studentEmail}</div>
                        </td>

                        {/* Project & Task */}
                        <td className="py-4 px-4">
                          <div className="font-extrabold text-brand">{sub.projectTitle}</div>
                          <div className="text-[11px] font-semibold text-textPrimary mt-0.5">
                            {sub.taskTitle}
                          </div>
                        </td>

                        {/* Deliverable URL & Commit Hash */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col items-start gap-1">
                            {sub.commitHash && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-bgSoft border border-borderLight text-[10px] font-mono font-bold text-textPrimary">
                                <GitCommit className="h-3 w-3 text-brand" />
                                <span>#{sub.commitHash.substring(0, 8)}</span>
                              </span>
                            )}
                            <a
                              href={sub.payloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                            >
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {sub.commitHash ? 'Inspect Commit' : 'View Submission'}
                              </span>
                            </a>
                          </div>
                        </td>

                        {/* Score Badge (Dynamic against passThreshold & maxScore) */}
                        <td className="py-4 px-4 text-center">
                          {sub.score !== undefined && sub.score !== null ? (
                            <span
                              className={`inline-block px-2 py-1 rounded-lg text-xs font-black ${
                                Number(sub.score) >= (sub.passThreshold || 60)
                                  ? 'bg-statusPassedBg text-statusPassedText border border-statusPassedBorder'
                                  : 'bg-statusErrorBg text-statusErrorText border border-statusErrorBorder'
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
                              sub.status === 'PASSED'
                                ? 'bg-statusPassedBg text-statusPassedText border-statusPassedBorder'
                                : sub.status === 'NEEDS_WORK'
                                ? 'bg-statusErrorBg text-statusErrorText border-statusErrorBorder'
                                : 'bg-statusEvaluatingBg text-statusEvaluatingText border-statusEvaluatingBorder'
                            }`}
                          >
                            {sub.status === 'PASSED'
                              ? '✓ Passed'
                              : sub.status === 'NEEDS_WORK'
                              ? '✕ Needs Work'
                              : '⏳ Evaluating'}
                          </span>
                        </td>

                        {/* Review Action with Edit Icon & Status Pill Trigger */}
                        <td className="py-4 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenReview(sub)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bgSoft hover:bg-brand hover:text-white text-textPrimary text-xs font-black transition-all cursor-pointer border border-borderLight shadow-2xs"
                          >
                            <Pencil className="h-3 w-3" />
                            <span>Grade & Review</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Datatable Footer & Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-bgSoft/40 border-t border-borderLight text-xs font-bold text-textMuted">
              <div>
                Showing{' '}
                <span className="font-black text-textPrimary">
                  {totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-black text-textPrimary">
                  {Math.min(currentPage * pageSize, totalRows)}
                </span>{' '}
                of <span className="font-black text-textPrimary">{totalRows}</span> submissions
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white border border-borderLight text-textPrimary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-bgSoft transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-1">...</span>}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            currentPage === page
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-xl bg-white border border-borderLight text-textPrimary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-bgSoft transition-all cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Review, Grade & Mentoring Decision Popup Modal */}
      {reviewingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 selection:bg-brand selection:text-white">
          <div className="relative w-full max-w-lg rounded-[28px] bg-white p-6 sm:p-7 shadow-2xl border border-borderLight space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-borderLight pb-3.5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-black uppercase tracking-wider">
                  <Award className="h-3 w-3" />
                  Review & Grade Deliverable
                </div>
                <h3 className="text-base font-black text-textPrimary">
                  {reviewingSub.studentName}
                </h3>
                <p className="text-xs text-textMuted font-medium">
                  {reviewingSub.projectTitle} • {reviewingSub.taskTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewingSub(null)}
                className="rounded-full p-1.5 text-textMuted hover:bg-bgSoft hover:text-textPrimary transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              {/* Decision Selector */}
              <div>
                <label className="text-xs font-bold text-textPrimary block mb-2">
                  Status Decision *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusDecisionChange('PASSED')}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      statusDecision === 'PASSED'
                        ? 'bg-statusPassedBg text-statusPassedText border-statusPassedBorder shadow-xs ring-2 ring-success/20'
                        : 'bg-bgSoft/60 text-textMuted border-borderLight hover:bg-bgSoft'
                    }`}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Passed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusDecisionChange('NEEDS_WORK')}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      statusDecision === 'NEEDS_WORK'
                        ? 'bg-statusErrorBg text-statusErrorText border-statusErrorBorder shadow-xs ring-2 ring-danger/20'
                        : 'bg-bgSoft/60 text-textMuted border-borderLight hover:bg-bgSoft'
                    }`}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Needs Work</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusDecisionChange('EVALUATING')}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      statusDecision === 'EVALUATING'
                        ? 'bg-statusEvaluatingBg text-statusEvaluatingText border-statusEvaluatingBorder shadow-xs ring-2 ring-warning/20'
                        : 'bg-bgSoft/60 text-textMuted border-borderLight hover:bg-bgSoft'
                    }`}
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Evaluating</span>
                  </button>
                </div>
              </div>

              {/* Rubric Criteria Chips if available */}
              {reviewingSub.criteria && Array.isArray(reviewingSub.criteria) && reviewingSub.criteria.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-borderLight/60">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-textMuted">
                    <span>Task Evaluation Rubric</span>
                    <span className="text-brand font-black">
                      Pass Threshold: ≥ {reviewingSub.passThreshold || 60} / {reviewingSub.maxScore || 100}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2.5 rounded-xl bg-bgSoft border border-borderLight/60">
                    {reviewingSub.criteria.map((crit: any, cIdx: number) => (
                      <div
                        key={cIdx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-borderLight text-[11px] font-bold text-textPrimary shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                        <span>{crit.criterion || crit.name || `Criterion ${cIdx + 1}`}</span>
                        {crit.maxScore && (
                          <span className="text-textMuted font-black text-[10px]">
                            ({crit.maxScore} pts)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Score Input & Quick Presets */}
              {statusDecision !== 'EVALUATING' ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-textPrimary">
                      Assigned Score (0 - {reviewingSub.maxScore || 100}) *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-textMuted">
                        Threshold: ≥{reviewingSub.passThreshold || 60}
                      </span>
                      <span className={`text-xs font-black ${statusDecision === 'PASSED' ? 'text-successDark' : 'text-dangerDark'}`}>
                        {score} / {reviewingSub.maxScore || 100}
                      </span>
                    </div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={reviewingSub.maxScore || 100}
                    required
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full rounded-xl bg-bgSoft px-3.5 py-2.5 text-xs font-black text-textPrimary border border-borderLight outline-none focus:border-brand focus:bg-white transition-all"
                  />
                  {/* Dynamic Score Presets */}
                  {computedPresets.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] font-bold text-textMuted mr-1">Presets:</span>
                      {computedPresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setScore(preset)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                            score === preset
                              ? statusDecision === 'PASSED'
                                ? 'bg-success text-white border-success'
                                : 'bg-danger text-white border-danger'
                              : 'bg-white text-textPrimary border-borderLight hover:bg-bgSoft'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-warningLight/20 border border-warningBorder text-xs text-warningDark font-semibold">
                  This deliverable will be marked back as <strong>Pending / Evaluating</strong>. No score will be finalized until evaluated.
                </div>
              )}

              {/* Feedback Textarea */}
              <div>
                <label className="text-xs font-bold text-textPrimary block mb-1.5">
                  Mentoring Feedback / Review Instructions
                </label>
                <textarea
                  rows={3}
                  required={statusDecision !== 'EVALUATING'}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    statusDecision === 'PASSED'
                      ? 'Provide approval notes, code praise, or architectural feedback...'
                      : statusDecision === 'NEEDS_WORK'
                      ? 'Explain what requirements were missed, test failures, or changes needed...'
                      : 'Optional review notes...'
                  }
                  className="w-full rounded-xl bg-bgSoft p-3 text-xs font-semibold text-textPrimary border border-borderLight outline-none focus:border-brand focus:bg-white transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-borderLight">
                <button
                  type="button"
                  onClick={() => setReviewingSub(null)}
                  className="px-4 py-2 rounded-xl border border-borderLight bg-white text-xs font-bold text-textPrimary hover:bg-bgSoft transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`px-5 py-2 rounded-xl text-xs font-black text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                    statusDecision === 'PASSED'
                      ? 'bg-success hover:bg-successDark'
                      : statusDecision === 'NEEDS_WORK'
                      ? 'bg-danger hover:bg-dangerDark'
                      : 'bg-warning hover:bg-warningDark'
                  }`}
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Decision...</span>
                    </>
                  ) : (
                    <span>
                      {statusDecision === 'PASSED'
                        ? 'Pass Deliverable'
                        : statusDecision === 'NEEDS_WORK'
                        ? 'Request Changes'
                        : 'Set Evaluating'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
