"use client";

import React from "react";
import { Clock, Sparkles, Award, Layers, Code, ShieldCheck, BookOpen } from "lucide-react";
import { Program } from "@/types/catalog";

interface ProgramDetailHeroProps {
  program: Program;
}

export const ProgramDetailHero: React.FC<ProgramDetailHeroProps> = ({ program }) => {
  const techList = program.technologies?.map((t) => t.technology.name) || [];
  const projectCount = program.projects?.length || 0;

  // Extract all linked topics and unique clusters
  const allTopics = program.topics?.map((pt) => pt.topic) || [];
  const allClusters = Array.from(
    new Map(
      allTopics
        .map((t) => t.cluster)
        .filter(Boolean)
        .map((c) => [c!.id, c!])
    ).values()
  );

  return (
    <section className="relative overflow-hidden border-b border-borderLight/60 bg-gradient-to-b from-bgMain via-surface to-bgBody py-10 md:py-14">
      {/* Background Decorative Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />

      <div className="container-main">
        <div className="max-w-4xl space-y-4">
          {/* Program Title */}
          <h1 className="text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl md:text-5xl">
            {program.title}
          </h1>

          {/* Subtitle / Description */}
          <p className="text-base text-textMuted md:text-lg max-w-3xl leading-relaxed">
            {program.description ||
              "Industry-graded remote internship. Build real client briefs in a guided workspace evaluated by our AI rubric engine."}
          </p>

          {/* All Clusters & Topics Badges Below Description */}
          {(allClusters.length > 0 || allTopics.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {allClusters.map((cluster) => (
                <span
                  key={cluster.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brandSoft px-3 py-1 text-xs font-extrabold text-brand"
                >
                  <Layers className="h-3.5 w-3.5" />
                  {cluster.name}
                </span>
              ))}

              {allTopics.map((topic) => (
                <span
                  key={topic.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-borderLight bg-white px-3 py-1 text-xs font-bold text-textSecondary shadow-xs"
                >
                  <BookOpen className="h-3.5 w-3.5 text-brand" />
                  {topic.name}
                </span>
              ))}
            </div>
          )}

          {/* Key Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold text-textSecondary">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-borderLight bg-white px-3.5 py-2 shadow-xs">
              <Clock className="h-4 w-4 text-brand" />
              {program.durationHours} Hours Duration
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-borderLight bg-white px-3.5 py-2 shadow-xs">
              <Sparkles className="h-4 w-4 text-brand" />
              {projectCount} Real Capstone {projectCount === 1 ? "Project" : "Projects"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-borderLight bg-white px-3.5 py-2 shadow-xs">
              <Award className="h-4 w-4 text-brand" />
              Verified Certificate
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-borderLight bg-white px-3.5 py-2 shadow-xs">
              <ShieldCheck className="h-4 w-4 text-brand" />
              AI Rubric Graded
            </span>
          </div>

          {/* Technology Badges */}
          {techList.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-textMuted flex items-center gap-1">
                <Code className="h-3.5 w-3.5 text-brand" /> Core Tech Stack:
              </span>
              {techList.map((tech, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-borderLight bg-white px-2.5 py-1 text-xs font-bold text-textPrimary shadow-2xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
