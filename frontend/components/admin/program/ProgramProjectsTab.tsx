'use client';

import React from 'react';
import {
  FolderKanban,
  FileCode,
  ClipboardList,
  Link as LinkIcon,
  Plus,
  Trash2,
} from 'lucide-react';
import { CustomDropdown } from '@/components/shared/CustomDropdown';

export interface ProjectTaskRubricCriteria {
  criterion: string;
  maxScore: number;
}

export interface ProjectTaskRubric {
  maxScore: number;
  passThreshold: number;
  criteria: ProjectTaskRubricCriteria[];
}

export interface ProjectTaskResource {
  type: string;
  title: string;
  url: string;
}

export interface ProjectTask {
  title: string;
  description: string;
  orderIndex: number;
  resources: ProjectTaskResource[];
  rubric: ProjectTaskRubric;
}

export interface ProjectWorkspaceTemplate {
  version: number;
  isActive: boolean;
  tasks: ProjectTask[];
}

export interface ProgramProject {
  title: string;
  description: string;
  orderIndex: number;
  resources: Array<{ type: string; title: string; url: string }>;
  workspaceTemplate: ProjectWorkspaceTemplate;
}

interface ProgramProjectsTabProps {
  projects: ProgramProject[];
  setProjects: React.Dispatch<React.SetStateAction<ProgramProject[]>>;
}

export const ProgramProjectsTab: React.FC<ProgramProjectsTabProps> = ({
  projects,
  setProjects,
}) => {
  // Projects Builder Handlers
  const handleAddProject = () => {
    setProjects((prev) => [
      ...prev,
      {
        title: '',
        description: '',
        orderIndex: prev.length,
        resources: [],
        workspaceTemplate: {
          version: 1,
          isActive: true,
          tasks: [
            {
              title: '',
              description: '',
              orderIndex: 0,
              resources: [],
              rubric: {
                maxScore: 100,
                passThreshold: 60,
                criteria: [{ criterion: '', maxScore: 100 }],
              },
            },
          ],
        },
      },
    ]);
  };

  const handleRemoveProject = (pIdx: number) => {
    setProjects((prev) => prev.filter((_, i) => i !== pIdx));
  };

  const handleProjectFieldChange = (pIdx: number, field: string, value: any) => {
    setProjects((prev) =>
      prev.map((proj, i) => (i === pIdx ? { ...proj, [field]: value } : proj))
    );
  };

  // Project Resources
  const handleAddProjectResource = (pIdx: number) => {
    setProjects((prev) =>
      prev.map((proj, i) =>
        i === pIdx
          ? {
              ...proj,
              resources: [...proj.resources, { type: 'DOCUMENTATION', title: '', url: '' }],
            }
          : proj
      )
    );
  };

  const handleRemoveProjectResource = (pIdx: number, rIdx: number) => {
    setProjects((prev) =>
      prev.map((proj, i) =>
        i === pIdx
          ? {
              ...proj,
              resources: proj.resources.filter((_, idx) => idx !== rIdx),
            }
          : proj
      )
    );
  };

  const handleProjectResourceChange = (pIdx: number, rIdx: number, field: string, value: string) => {
    setProjects((prev) =>
      prev.map((proj, i) =>
        i === pIdx
          ? {
              ...proj,
              resources: proj.resources.map((res, idx) =>
                idx === rIdx ? { ...res, [field]: value } : res
              ),
            }
          : proj
      )
    );
  };

  // Task Handlers
  const handleAddTask = (pIdx: number) => {
    setProjects((prev) =>
      prev.map((proj, i) =>
        i === pIdx
          ? {
              ...proj,
              workspaceTemplate: {
                ...proj.workspaceTemplate,
                tasks: [
                  ...proj.workspaceTemplate.tasks,
                  {
                    title: '',
                    description: '',
                    orderIndex: proj.workspaceTemplate.tasks.length,
                    resources: [],
                    rubric: {
                      maxScore: 100,
                      passThreshold: 60,
                      criteria: [{ criterion: '', maxScore: 100 }],
                    },
                  },
                ],
              },
            }
          : proj
      )
    );
  };

  const handleRemoveTask = (pIdx: number, tIdx: number) => {
    setProjects((prev) =>
      prev.map((proj, i) =>
        i === pIdx
          ? {
              ...proj,
              workspaceTemplate: {
                ...proj.workspaceTemplate,
                tasks: proj.workspaceTemplate.tasks.filter((_, idx) => idx !== tIdx),
              },
            }
          : proj
      )
    );
  };

  const handleTaskFieldChange = (pIdx: number, tIdx: number, field: string, value: any) => {
    setProjects((prev) =>
      prev.map((proj, i) =>
        i === pIdx
          ? {
              ...proj,
              workspaceTemplate: {
                ...proj.workspaceTemplate,
                tasks: proj.workspaceTemplate.tasks.map((task, idx) =>
                  idx === tIdx
                    ? {
                        ...task,
                        [field]: value,
                      }
                    : task
                ),
              },
            }
          : proj
      )
    );
  };

  // Task Rubric Criteria Handlers
  const handleAddCriteria = (pIdx: number, tIdx: number) => {
    setProjects((prev) =>
      prev.map((proj, i) =>
        i === pIdx
          ? {
              ...proj,
              workspaceTemplate: {
                ...proj.workspaceTemplate,
                tasks: proj.workspaceTemplate.tasks.map((task, idx) =>
                  idx === tIdx
                    ? {
                        ...task,
                        rubric: {
                          ...task.rubric,
                          criteria: [
                            ...task.rubric.criteria,
                            { criterion: '', maxScore: 20 },
                          ],
                        },
                      }
                    : task
                ),
              },
            }
          : proj
      )
    );
  };

  const handleRemoveCriteria = (pIdx: number, tIdx: number, cIdx: number) => {
    setProjects((prev) =>
      prev.map((proj, i) =>
        i === pIdx
          ? {
              ...proj,
              workspaceTemplate: {
                ...proj.workspaceTemplate,
                tasks: proj.workspaceTemplate.tasks.map((task, idx) =>
                  idx === tIdx
                    ? {
                        ...task,
                        rubric: {
                          ...task.rubric,
                          criteria: task.rubric.criteria.filter((_, critIdx) => critIdx !== cIdx),
                        },
                      }
                    : task
                ),
              },
            }
          : proj
      )
    );
  };

  const handleCriteriaChange = (pIdx: number, tIdx: number, cIdx: number, field: string, value: any) => {
    setProjects((prev) =>
      prev.map((proj, i) =>
        i === pIdx
          ? {
              ...proj,
              workspaceTemplate: {
                ...proj.workspaceTemplate,
                tasks: proj.workspaceTemplate.tasks.map((task, idx) =>
                  idx === tIdx
                    ? {
                        ...task,
                        rubric: {
                          ...task.rubric,
                          criteria: task.rubric.criteria.map((crit, critIdx) =>
                            critIdx === cIdx
                              ? {
                                  ...crit,
                                  [field]: field === 'maxScore' ? Number(value) : value,
                                }
                              : crit
                          ),
                        },
                      }
                    : task
                ),
              },
            }
          : proj
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-borderLight shadow-xs">
        <div>
          <h2 className="text-base font-black text-textPrimary flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-brand" />
            Capstone Projects & Template Task Architecture
          </h2>
          <p className="text-xs text-textMuted mt-1">
            Each project includes a versioned workspace template containing guided tasks, evaluation rubrics, and technical resources.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddProject}
          className="px-4 py-2.5 rounded-xl bg-brand text-white text-xs font-black hover:bg-brandHover transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Capstone Project
        </button>
      </div>

      {projects.map((proj, pIdx) => (
        <div
          key={pIdx}
          className="bg-white rounded-[24px] p-6 sm:p-8 border border-borderLight shadow-xs space-y-6"
        >
          {/* Project Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-borderLight pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand font-black text-xs">
                #{pIdx + 1}
              </span>
              <h3 className="text-sm font-black text-textPrimary">
                {proj.title.trim() ? proj.title : `Project #${pIdx + 1} Configuration`}
              </h3>
            </div>

            {projects.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveProject(pIdx)}
                className="text-xs font-bold text-danger hover:text-dangerDark flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" /> Remove Project
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-extrabold text-textPrimary">Project Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Capstone Project 1: Real-Time Order Dispatch Architecture"
                value={proj.title}
                onChange={(e) => handleProjectFieldChange(pIdx, 'title', e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-borderLight/80 bg-bgSoft px-4 py-2.5 text-xs font-bold text-textPrimary outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-textPrimary">Project Description</label>
              <input
                type="text"
                placeholder="e.g. High-level engineering problem and architectural objectives..."
                value={proj.description}
                onChange={(e) => handleProjectFieldChange(pIdx, 'description', e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-borderLight/80 bg-bgSoft px-4 py-2.5 text-xs font-bold text-textPrimary outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Project-Level Resources */}
          <div className="p-4 rounded-2xl bg-bgSoft/60 border border-borderLight/60 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-textPrimary flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5 text-brand" /> Project Documentation & Resources ({proj.resources.length})
              </span>
              <button
                type="button"
                onClick={() => handleAddProjectResource(pIdx)}
                className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Resource
              </button>
            </div>

            {proj.resources.map((res, rIdx) => (
              <div key={rIdx} className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-borderLight">
                <div className="w-44">
                  <CustomDropdown
                    value={res.type}
                    onChange={(val) => handleProjectResourceChange(pIdx, rIdx, 'type', val)}
                    options={[
                      { value: "DOCUMENTATION", label: "DOCUMENTATION" },
                      { value: "STARTER_REPO", label: "STARTER_REPO" },
                      { value: "API_SPEC", label: "API_SPEC" },
                      { value: "ASSETS", label: "ASSETS" },
                    ]}
                  />
                </div>

                <input
                  type="text"
                  placeholder="e.g. System Architecture Specification / Blueprint"
                  value={res.title}
                  onChange={(e) => handleProjectResourceChange(pIdx, rIdx, 'title', e.target.value)}
                  className="flex-1 min-w-[150px] rounded-lg bg-bgSoft px-3 py-1.5 text-xs font-bold text-textPrimary border border-borderLight"
                />

                <input
                  type="url"
                  placeholder="e.g. https://docs.engineersclinic.com/specs/..."
                  value={res.url}
                  onChange={(e) => handleProjectResourceChange(pIdx, rIdx, 'url', e.target.value)}
                  className="flex-1 min-w-[200px] rounded-lg bg-bgSoft px-3 py-1.5 text-xs font-bold text-textPrimary border border-borderLight"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveProjectResource(pIdx, rIdx)}
                  className="text-danger hover:text-dangerDark cursor-pointer p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Workspace Template & Tasks Builder */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase tracking-wider text-textPrimary flex items-center gap-2">
                <FileCode className="h-4 w-4 text-brand" />
                Workspace Template Tasks & Rubrics ({proj.workspaceTemplate.tasks.length})
              </h4>
              <button
                type="button"
                onClick={() => handleAddTask(pIdx)}
                className="text-xs font-extrabold text-brand hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Template Task
              </button>
            </div>

            <div className="space-y-4">
              {proj.workspaceTemplate.tasks.map((task, tIdx) => (
                <div
                  key={tIdx}
                  className="p-5 rounded-2xl border border-brand/20 bg-brand/5 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-brand text-white font-black text-[10px]">
                        Task #{tIdx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Task 1: Database Schema & Auth Setup"
                        value={task.title}
                        onChange={(e) => handleTaskFieldChange(pIdx, tIdx, 'title', e.target.value)}
                        className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-textPrimary border border-borderLight w-72 sm:w-96"
                      />
                    </div>

                    {proj.workspaceTemplate.tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(pIdx, tIdx)}
                        className="text-xs font-bold text-danger hover:text-dangerDark cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      placeholder="e.g. Task technical instructions, acceptance criteria, test commands, and delivery requirements..."
                      value={task.description}
                      onChange={(e) => handleTaskFieldChange(pIdx, tIdx, 'description', e.target.value)}
                      className="w-full rounded-xl bg-white p-3 text-xs font-bold text-textPrimary border border-borderLight"
                    />
                  </div>

                  {/* Task Rubric Configuration */}
                  <div className="bg-white p-4 rounded-xl border border-borderLight space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-borderLight pb-2">
                      <span className="text-xs font-black text-textPrimary flex items-center gap-1.5">
                        <ClipboardList className="h-4 w-4 text-brand" />
                        AI Evaluation Rubric Configuration
                      </span>

                      <div className="flex items-center gap-4 text-xs font-bold text-textMuted">
                        <div>
                          Max Score:{' '}
                          <input
                            type="number"
                            placeholder="100"
                            value={task.rubric.maxScore}
                            onChange={(e) =>
                              handleTaskFieldChange(pIdx, tIdx, 'rubric', {
                                ...task.rubric,
                                maxScore: Number(e.target.value),
                              })
                            }
                            className="w-14 rounded-md bg-bgSoft px-2 py-0.5 text-xs font-black text-textPrimary border border-borderLight ml-1"
                          />
                        </div>
                        <div>
                          Pass Threshold:{' '}
                          <input
                            type="number"
                            placeholder="60"
                            value={task.rubric.passThreshold}
                            onChange={(e) =>
                              handleTaskFieldChange(pIdx, tIdx, 'rubric', {
                                ...task.rubric,
                                passThreshold: Number(e.target.value),
                              })
                            }
                            className="w-14 rounded-md bg-bgSoft px-2 py-0.5 text-xs font-black text-textPrimary border border-borderLight ml-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Criteria List */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[11px] font-extrabold text-textMuted">
                        <span>Evaluation Criteria Items</span>
                        <button
                          type="button"
                          onClick={() => handleAddCriteria(pIdx, tIdx)}
                          className="text-brand hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> Add Criterion
                        </button>
                      </div>

                      {task.rubric.criteria.map((crit, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="e.g. Implementation & Clean Architecture / Unit Tests"
                            value={crit.criterion}
                            onChange={(e) => handleCriteriaChange(pIdx, tIdx, cIdx, 'criterion', e.target.value)}
                            className="flex-1 rounded-lg bg-bgSoft px-3 py-1.5 text-xs font-bold text-textPrimary border border-borderLight"
                          />
                          <div className="flex items-center gap-1 text-xs font-bold text-textMuted">
                            <span>Max:</span>
                            <input
                              type="number"
                              placeholder="50"
                              value={crit.maxScore}
                              onChange={(e) => handleCriteriaChange(pIdx, tIdx, cIdx, 'maxScore', e.target.value)}
                              className="w-14 rounded-lg bg-bgSoft px-2 py-1.5 text-xs font-black text-textPrimary border border-borderLight text-center"
                            />
                          </div>
                          {task.rubric.criteria.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCriteria(pIdx, tIdx, cIdx)}
                              className="text-danger hover:text-dangerDark cursor-pointer p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
