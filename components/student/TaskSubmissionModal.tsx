'use client';

import React, { useState, useEffect } from 'react';
import { Send, GitCommit, GitBranch, Sparkles, Loader2, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface TaskSubmissionModalProps {
  isOpen: boolean;
  taskId: number;
  taskTitle: string;
  repoUrl?: string | null;
  workspaceId?: number | null;
  onClose: () => void;
  onSubmitSuccess: (data: any) => void;
  submitFn: (
    workspaceTaskId: number,
    submission: string | { commitHash?: string; payloadUrl?: string }
  ) => Promise<any>;
}

export const TaskSubmissionModal: React.FC<TaskSubmissionModalProps> = ({
  isOpen,
  taskId,
  taskTitle,
  repoUrl: initialRepoUrl,
  workspaceId,
  onClose,
  onSubmitSuccess,
  submitFn,
}) => {
  const [repoUrl, setRepoUrl] = useState<string>(initialRepoUrl || '');
  const [commitHash, setCommitHash] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (initialRepoUrl) {
      setRepoUrl(initialRepoUrl);
    }
  }, [initialRepoUrl]);

  if (!isOpen) return null;

  const cleanRepo = repoUrl.trim().replace(/\.git\/?$/, '').replace(/\/+$/, '');
  const cleanHash = commitHash.trim();
  const previewCommitUrl = cleanRepo && cleanHash ? `${cleanRepo}/commit/${cleanHash}` : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanHash) {
      setErrorMsg('Please enter the Git commit hash for this task deliverable.');
      return;
    }
    if (!isConfirmed) {
      setErrorMsg('Please check the honor code confirmation before submitting.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const result = await submitFn(taskId, {
        commitHash: cleanHash,
        payloadUrl: previewCommitUrl || cleanHash,
      });

      showToast.success(
        `Commit #${cleanHash.substring(0, 8)} deliverable submitted for evaluation!`,
        'Task Submitted'
      );
      onSubmitSuccess(result);
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Failed to submit work. Please try again.';
      setErrorMsg(msg);
      showToast.error(msg, 'Submission Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-2xl space-y-5 selection:bg-brand selection:text-white">
        {/* Header */}
        <div className="border-b border-borderLight pb-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-brand uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>AI Rubric Evaluation Pipeline</span>
          </div>
          <h3 className="mt-1 text-lg font-black text-textPrimary">Submit Task Deliverable</h3>
          <p className="text-xs text-textMuted mt-0.5 max-w-md truncate">{taskTitle}</p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="rounded-xl border border-dangerBorder bg-dangerLight p-3 text-xs font-bold text-dangerDark flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Linked Project Repository Header */}
          {cleanRepo ? (
            <div className="rounded-2xl border border-borderLight/80 bg-bgSoft/60 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-textMuted">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5 text-brand" />
                  <span>Linked Capstone Repository</span>
                </span>
                <a
                  href={cleanRepo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-brand hover:underline"
                >
                  <span>Open Repo</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="text-xs font-black text-textPrimary truncate">{cleanRepo}</div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-textPrimary">
                GitHub Repository URL <span className="text-danger">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://github.com/username/capstone-repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full rounded-2xl border border-borderLight bg-bgSoft/50 py-2.5 px-3.5 text-xs font-semibold text-textPrimary placeholder:text-textMuted focus:border-brand focus:bg-white focus:outline-none transition-all"
              />
              <p className="text-[10px] text-textMuted">
                Set once for this capstone project. All subsequent tasks will reference this repository.
              </p>
            </div>
          )}

          {/* Commit Hash Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-textPrimary">
              Git Commit Hash <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-textMuted">
                <GitCommit className="h-4 w-4 text-brand" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. 7a9f1b2 or full SHA"
                value={commitHash}
                onChange={(e) => setCommitHash(e.target.value)}
                className="w-full rounded-2xl border border-borderLight bg-bgSoft/50 py-2.5 pl-10 pr-4 text-xs font-mono font-bold text-textPrimary placeholder:text-textMuted focus:border-brand focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-textMuted pt-0.5">
              <span>
                💡 Tip: Run <code className="rounded bg-bgSoft px-1.5 py-0.5 font-mono text-[10px] font-bold text-textPrimary">git rev-parse HEAD</code> in terminal
              </span>
            </div>
          </div>

          {/* Live Preview of Commit URL */}
          {previewCommitUrl && (
            <div className="rounded-xl border border-brand/20 bg-brand/5 p-2.5 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand shrink-0" />
                <span className="font-bold text-textMuted truncate">Diff:</span>
                <span className="font-mono text-[11px] font-bold text-textPrimary truncate">{previewCommitUrl}</span>
              </div>
              <a
                href={previewCommitUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brand hover:underline shrink-0 text-[10px] font-bold"
              >
                Inspect ↗
              </a>
            </div>
          )}

          {/* Honor Code Confirmation Checkbox */}
          <label className="flex items-start gap-3 rounded-2xl border border-borderLight/80 bg-bgSoft/60 p-3 cursor-pointer hover:bg-bgSoft transition-all">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded-md border-borderLight text-brand focus:ring-brand accent-brand cursor-pointer"
            />
            <span className="text-xs font-semibold text-textPrimary leading-snug">
              I confirm that this commit hash represents my completed work on this task and is ready for automated AI evaluation.
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-borderLight">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2 text-xs font-bold text-textMuted hover:bg-bgSoft hover:text-textPrimary transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !cleanHash || !isConfirmed}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-all ${
                loading || !cleanHash || !isConfirmed
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-brand hover:bg-brandDark shadow-xs cursor-pointer'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Deliverable...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Commit for AI Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
