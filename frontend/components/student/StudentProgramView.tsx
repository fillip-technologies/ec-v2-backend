'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/types/catalog';
import { SharedProjectsView } from '@/components/shared/SharedProjectsView';
import {
  BookOpen,
  Sparkles,
  FolderKanban,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { getStudentPrograms } from '@/lib/api/student';
import { showToast } from '@/lib/toast';

export interface ProgramDetail {
  id: number;
  title: string;
  slug: string;
  clusterName?: string;
  durationHours: number;
  description: string;
  outcomes?: string;
  status: string;
  hoursLogged: number;
  completionPercentage: number;
  projectsDone: number;
  totalProjects: number;
  projects: Project[];
}

interface StudentProgramViewProps {
  programsData?: ProgramDetail[];
  programs?: ProgramDetail[];
  fallbackProjects?: Project[];
  projects?: Project[];
  submissions?: any[];
  onSelectProject?: (project: Project) => void;
  onEditProject?: (project: Project) => void;
  onSubmitTaskWork?: (taskId: number, taskTitle: string, repoUrl?: string, workspaceId?: number) => void;
  onOpenSubmitModal?: (taskId: number, taskTitle: string, repoUrl?: string, workspaceId?: number) => void;
  onRepoUpdated?: () => void;
}

export const StudentProgramView: React.FC<StudentProgramViewProps> = ({
  programsData,
  programs: programsProp,
  fallbackProjects = [],
  projects: projectsProp = [],
  submissions,
  onSelectProject,
  onEditProject,
  onSubmitTaskWork,
  onOpenSubmitModal,
  onRepoUpdated,
}) => {
  const initialList =
    Array.isArray(programsData) && programsData.length > 0
      ? programsData
      : Array.isArray(programsProp) && programsProp.length > 0
      ? programsProp
      : [];

  const [programsList, setProgramsList] = useState<ProgramDetail[]>(initialList);
  const [loading, setLoading] = useState<boolean>(initialList.length === 0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeProgramId, setActiveProgramId] = useState<number>(initialList[0]?.id || 0);
  const [showProgramDetails, setShowProgramDetails] = useState<boolean>(true);

  const fetchEnrolledPrograms = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getStudentPrograms();
      if (Array.isArray(data) && data.length > 0) {
        setProgramsList(data);
        if (!activeProgramId || !data.some((p) => p.id === activeProgramId)) {
          setActiveProgramId(data[0].id);
        }
        if (isManual) {
          showToast.success('Enrolled internship programs refreshed', 'Synced');
        }
      } else {
        setProgramsList([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch student programs:', err);
      if (isManual) {
        showToast.error('Could not refresh internship programs', 'Sync Failed');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (initialList.length > 0) {
      setProgramsList(initialList);
      if (!activeProgramId) {
        setActiveProgramId(initialList[0].id);
      }
    } else {
      fetchEnrolledPrograms();
    }
  }, [programsData, programsProp]);

  const handleSubmitTask = onSubmitTaskWork || onOpenSubmitModal;

  const selectedProgram =
    programsList.find((p) => p.id === activeProgramId) ||
    programsList[0] ||
    null;

  const effectiveProjects: Project[] =
    selectedProgram?.projects && selectedProgram.projects.length > 0
      ? selectedProgram.projects
      : Array.isArray(fallbackProjects) && fallbackProjects.length > 0
      ? fallbackProjects
      : Array.isArray(projectsProp) && projectsProp.length > 0
      ? projectsProp
      : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 rounded-[28px] border border-borderLight bg-white shadow-xs">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <span className="text-xs font-bold text-textMuted uppercase tracking-wider mt-3">
          Loading Your Enrolled Internship Programmes...
        </span>
      </div>
    );
  }

  if (!selectedProgram && programsList.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-borderLight bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <BookOpen className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-black text-textPrimary">No Enrolled Programmes Found</h3>
        <p className="mt-1 text-xs text-textMuted max-w-md mx-auto">
          You are not currently enrolled in any active internship tracks. Browse the catalogue to enroll in industry capstone programs.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={() => fetchEnrolledPrograms(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white hover:bg-brandHover transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Check Enrolments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Multi-Program Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[24px] border border-borderLight bg-white p-4 shadow-xs">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-textMuted mb-2 px-1">
            YOUR ENROLLED INTERNSHIP PROGRAMMES ({programsList.length})
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {programsList.map((prog) => {
              const isActive = prog.id === activeProgramId;
              return (
                <button
                  key={prog.id}
                  onClick={() => setActiveProgramId(prog.id)}
                  className={`flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-brand text-white shadow-xs ring-2 ring-brand/20'
                      : 'bg-bgSoft text-textPrimary hover:bg-white hover:border-borderLight border border-borderLight/60'
                  }`}
                >
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="truncate max-w-[240px]">{prog.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                      isActive ? 'bg-white/20 text-white' : 'bg-brand/10 text-brand'
                    }`}
                  >
                    {prog.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => fetchEnrolledPrograms(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2 text-xs font-bold text-textPrimary hover:bg-borderLight hover:text-brand transition cursor-pointer disabled:opacity-50 self-end sm:self-auto shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* 2. Program Details Header Card (Collapsible) */}
      {selectedProgram && (
        <div className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
                  {selectedProgram.clusterName || 'Software Engineering'}
                </span>
                <span className="rounded-full bg-bgSoft px-3 py-1 text-xs font-bold text-textMuted border border-borderLight/60">
                  {selectedProgram.durationHours || 120} Hours Internship
                </span>
                <span className="rounded-full bg-statusPassedBg px-3 py-1 text-xs font-bold text-statusPassedText uppercase">
                  {selectedProgram.status}
                </span>
              </div>

              <h2 className="text-2xl font-black text-textPrimary">{selectedProgram.title}</h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Program Progress Counter Badge */}
              <div className="rounded-2xl border border-borderLight bg-bgSoft px-4 py-2.5 text-center min-w-[140px]">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-textMuted">
                  COMPLETION
                </div>
                <div className="text-lg font-black text-brand">
                  {selectedProgram.completionPercentage || 0}%
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProgramDetails((prev) => !prev)}
                className="p-2.5 rounded-2xl border border-borderLight hover:bg-bgSoft text-xs font-extrabold text-textPrimary transition cursor-pointer"
                title={showProgramDetails ? 'Collapse details' : 'Expand details'}
              >
                {showProgramDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Collapsible Overview Details */}
          {showProgramDetails && (
            <div className="space-y-5 pt-4 border-t border-borderLight/60 animate-in fade-in duration-200">
              {selectedProgram.description && (
                <p className="text-xs text-textMuted leading-relaxed">{selectedProgram.description}</p>
              )}

              {/* Program Learning Outcomes */}
              {selectedProgram.outcomes && (
                <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 flex items-start gap-3 text-xs text-textPrimary">
                  <Sparkles className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-brand uppercase tracking-wider block mb-0.5">
                      Core Internship Outcomes:
                    </span>
                    <span>{selectedProgram.outcomes}</span>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-textMuted">
                  <span>Overall Programme Completion</span>
                  <span>
                    {selectedProgram.projectsDone || 0} of {selectedProgram.totalProjects || effectiveProjects.length || 3} Projects Completed
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-bgSoft overflow-hidden border border-borderLight/60">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-500"
                    style={{ width: `${selectedProgram.completionPercentage || 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Nested Projects Inside Program Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-brand" />
            <h3 className="text-lg font-black text-textPrimary">
              Capstone Projects ({effectiveProjects.length})
            </h3>
          </div>
          <span className="text-xs font-medium text-textMuted">
            Deliverables and evaluation rubrics for this programme
          </span>
        </div>

        {/* Render nested capstone projects */}
        {effectiveProjects.length > 0 ? (
          <SharedProjectsView
            projects={effectiveProjects}
            onSelectProject={onSelectProject}
            onEditProject={onEditProject}
            onSubmitTaskWork={handleSubmitTask}
            onRepoUpdated={onRepoUpdated}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 rounded-[24px] border border-dashed border-borderLight bg-white text-center">
            <AlertCircle className="h-8 w-8 text-textMuted/50 mb-2" />
            <h4 className="text-sm font-black text-textPrimary">No Capstone Projects Configured</h4>
            <p className="text-xs text-textMuted mt-1 max-w-sm">
              Capstone projects for this track are being synchronized by the curriculum coordinator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
