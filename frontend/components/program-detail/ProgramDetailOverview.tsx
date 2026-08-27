"use client";

import React from "react";
import { CheckCircle2, Target, BookOpen, GraduationCap, Users } from "lucide-react";
import { Program } from "@/types/catalog";

interface ProgramDetailOverviewProps {
  program: Program;
}

export const ProgramDetailOverview: React.FC<ProgramDetailOverviewProps> = ({ program }) => {
  const outcomesList = program.outcomes
    ? program.outcomes.split("\n").filter((line) => line.trim() !== "")
    : [
        "Master production software architecture and system design best practices.",
        "Build, test, and deploy real client brief microservices inside guided workspaces.",
        "Pass AI rubric evaluations with clean code, unit test coverage, and documentation.",
        "Earn a verified internship completion certificate.",
      ];

  return (
    <div className="space-y-8">
      {/* Program Description / Overview */}
      <section className="rounded-3xl border border-glassBorder bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-brand">
          <BookOpen className="h-4 w-4" />
          <span>Program Overview</span>
        </div>
        <p className="mt-4 text-sm font-medium leading-relaxed text-textSecondary md:text-base">
          {program.description ||
            "This program provides a complete hands-on remote engineering internship environment. You will execute real client briefs, write production code in an integrated workspace, and receive instant feedback from our automated AI grading rubric engine."}
        </p>
      </section>

      {/* Learning Outcomes */}
      <section className="rounded-3xl border border-glassBorder bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-brand">
          <Target className="h-4 w-4" />
          <span>Learning Outcomes</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {outcomesList.map((outcome, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-2xl border border-borderLight/70 bg-bgBody p-4 shadow-2xs"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <span className="text-xs font-bold leading-relaxed text-textPrimary md:text-sm">
                {outcome.replace(/^[-*•]\s*/, "")}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Who is this for */}
      <section className="rounded-3xl border border-glassBorder bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-brand">
          <Users className="h-4 w-4" />
          <span>Target Audience</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-borderLight/70 bg-bgSoft/60 p-4 text-center">
            <GraduationCap className="mx-auto h-7 w-7 text-brand" />
            <h3 className="mt-3 text-xs font-black text-textPrimary">Engineering Students</h3>
            <p className="mt-1 text-[11px] font-semibold text-textMuted">
              Diploma, B.Tech, B.E., BCA, MCA, or M.Tech students seeking practical experience.
            </p>
          </div>

          <div className="rounded-2xl border border-borderLight/70 bg-bgSoft/60 p-4 text-center">
            <BookOpen className="mx-auto h-7 w-7 text-brand" />
            <h3 className="mt-3 text-xs font-black text-textPrimary">Aspiring Developers</h3>
            <p className="mt-1 text-[11px] font-semibold text-textMuted">
              Developers who want to build proof-of-work capstone projects for tech resumes.
            </p>
          </div>

          <div className="rounded-2xl border border-borderLight/70 bg-bgSoft/60 p-4 text-center">
            <Target className="mx-auto h-7 w-7 text-brand" />
            <h3 className="mt-3 text-xs font-black text-textPrimary">Job Seekers</h3>
            <p className="mt-1 text-[11px] font-semibold text-textMuted">
              Graduates looking for AI-evaluated code review & verified industry credentials.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
