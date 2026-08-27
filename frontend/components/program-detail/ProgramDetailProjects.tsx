"use client";

import React, { useState } from "react";
import { FolderGit2, ChevronDown, CheckCircle2, FileText, ExternalLink, Code2, Cpu } from "lucide-react";
import { Project, TemplateStep, TemplateTask, Resource } from "@/types/catalog";

interface ProgramDetailProjectsProps {
  projects?: Project[];
}

export const ProgramDetailProjects: React.FC<ProgramDetailProjectsProps> = ({
  projects = [],
}) => {
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-glassBorder bg-white p-8 text-center shadow-sm">
        <FolderGit2 className="mx-auto h-10 w-10 text-brand" />
        <h3 className="mt-3 text-lg font-extrabold text-textPrimary">Capstones Loading</h3>
        <p className="mt-1 text-xs text-textMuted">Capstone projects for this program are being loaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {projects.map((project, projIdx) => {
        const template = project.workspaceTemplate;
        const tasks = template?.tasks || [];

        return (
          <section
            key={project.id}
            className="rounded-3xl border border-glassBorder bg-white p-6 md:p-8 shadow-sm"
          >
            {/* Project Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-borderLight/70 pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand">
                  <FolderGit2 className="h-4 w-4" />
                  <span>Capstone Project #{projIdx + 1}</span>
                </div>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-textPrimary">
                  {project.title}
                </h2>
                <p className="mt-1 text-xs font-medium text-textMuted max-w-2xl">
                  {project.description || "Industry client brief capstone built inside guided workspace."}
                </p>
              </div>

              <span className="rounded-full bg-brandSoft px-3 py-1 text-xs font-extrabold text-brand">
                {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"} Blueprint
              </span>
            </div>

            {/* Template Tasks List Accordion */}
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-extrabold text-textPrimary flex items-center gap-2">
                <Code2 className="h-4 w-4 text-brand" /> Guided Workspace Curriculum & Tasks
              </h3>

              {tasks.map((task: any, taskIdx: number) => {
                const isOpen = activeTaskId === task.id || (activeTaskId === null && taskIdx === 0);
                const rubric = task.rubric;

                return (
                  <div
                    key={task.id}
                    className="overflow-hidden rounded-2xl border border-borderLight bg-bgBody/70 transition-all"
                  >
                    {/* Task Header Toggle */}
                    <button
                      type="button"
                      onClick={() => setActiveTaskId(isOpen ? -1 : task.id)}
                      className="flex w-full items-center justify-between p-4 text-left font-bold transition hover:bg-white cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-brand text-xs font-black text-white">
                          {task.orderIndex || taskIdx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-extrabold text-textPrimary">{task.title}</h4>
                          <p className="text-[11px] font-medium text-textMuted line-clamp-1">
                            {task.description || "System blueprint task"}
                          </p>
                        </div>
                      </div>

                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-textMuted transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-brand" : ""
                        }`}
                      />
                    </button>

                    {/* Task Content: Description, resources & rubric */}
                    {isOpen && (
                      <div className="border-t border-borderLight/60 bg-white p-5 space-y-4">
                        <div>
                          <h5 className="text-xs font-extrabold uppercase tracking-wider text-textMuted flex items-center gap-1.5 mb-2">
                             Task Description:
                          </h5>
                          <p className="text-xs text-textSecondary">{task.description}</p>
                        </div>

                        {/* Task-Level Resources */}
                        {task.resources && task.resources.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-borderLight/50 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted flex items-center gap-1">
                              <FileText className="h-3 w-3 text-brand" /> Task Resources:
                            </span>
                            {task.resources.map((res: any) => (
                              <a
                                key={res.id}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-md border border-brand/20 bg-brandSoft px-2 py-0.5 text-[10px] font-extrabold text-brand hover:underline cursor-pointer"
                              >
                                <span>{res.title}</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Rubric Evaluation Metrics */}
                        {rubric && (
                          <div className="mt-3 rounded-xl bg-bgBody p-3 border border-borderLight/60">
                            <div className="flex items-center justify-between text-xs font-bold text-textPrimary">
                              <span>AI Rubric Pass Threshold:</span>
                              <span className="text-brand font-black">{rubric.passThreshold} / {rubric.maxScore} Score</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
