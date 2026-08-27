"use client";

import React from "react";
import { Zap, FolderOpen, LayoutGrid, ListCheck, GitBranch, Sparkles, BadgeCheck } from "lucide-react";

export const HowWorkSection: React.FC = () => {
  const steps = [
    { step: "01", icon: <FolderOpen className="h-6 w-6" />, title: "Choose Track", desc: "Select 120-Hr Track" },
    { step: "02", icon: <LayoutGrid className="h-6 w-6" />, title: "Workspace", desc: "Activate Board" },
    { step: "03", icon: <ListCheck className="h-6 w-6" />, title: "Milestones", desc: "Build Deliverables" },
    { step: "04", icon: <GitBranch className="h-6 w-6" />, title: "GitHub Sync", desc: "Submit Commits", active: true },
    { step: "05", icon: <Sparkles className="h-6 w-6" />, title: "AI Rubric", desc: "Instant Evaluation" },
    { step: "06", icon: <BadgeCheck className="h-6 w-6" />, title: "Certificate", desc: "ISO QR Proof" },
  ];

  return (
    <section id="how-it-works" className="ec-how-section ec-pipeline-section relative isolate overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Background Lighting & Grid Canvas */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="ec-pipeline-grid absolute inset-0 opacity-70" />
        <div className="ec-pipeline-ambient-orange absolute -left-24 top-0 h-80 w-80 rounded-full blur-[110px]" />
        <div className="ec-pipeline-ambient-green absolute right-1/4 top-24 h-80 w-80 rounded-full blur-[120px]" />
      </div>

      <div className="container-main">
        {/* Header Block */}
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="max-w-4xl">
            <div className="ec-pipeline-heading-card inline-flex flex-col items-center gap-2 rounded-2xl px-6 py-4 shadow-sm">
              <p className="ec-pipeline-label text-xs font-black uppercase tracking-[0.18em]">
                Automated Pipeline
              </p>
              <div className="flex items-center justify-center gap-3.5">
                <span className="ec-pipeline-heading-icon grid h-10 w-10 place-items-center rounded-xl text-lg shrink-0">
                  <Zap className="h-5 w-5" />
                </span>
                <h2 className="text-2xl font-black leading-tight text-textPrimary sm:text-3xl lg:text-4xl whitespace-nowrap">
                  Project completion & evaluation lifecycle
                </h2>
              </div>
            </div>
            <p className="ec-pipeline-copy mt-5 max-w-2xl mx-auto text-base leading-8 text-textGray">
              Move step-by-step from program selection to personal workspace snapshot, GitHub commit verification, BullMQ AI grading, and ISO-verified certificate issuance.
            </p>
          </div>

          <span className="ec-pipeline-status mt-5 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-black">
            <span className="ec-pipeline-status-dot h-2 w-2 rounded-full animate-pulse" />
            AI Evaluation Queue Live
          </span>
        </div>

        {/* 6 Pipeline Cards Grid */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {steps.map((item, index) => {
            const active = !!item.active;
            const isLast = index === steps.length - 1;

            return (
              <article
                key={index}
                className={`ec-pipeline-card ${active ? "ec-pipeline-card-active scale-105 ring-2 ring-brand/30" : ""
                  } group relative z-10 rounded-2xl border p-5 text-center transition duration-300 hover:-translate-y-1 bg-white/90 shadow-sm`}
              >
                <p
                  className={`text-xs font-black tracking-[0.14em] ${active ? "text-brand" : "text-pipelineGreen"
                    }`}
                >
                  {item.step}
                </p>

                <span
                  className={`ec-pipeline-icon mx-auto mt-4 grid h-14 w-14 place-items-center rounded-full text-2xl ${active
                    ? "bg-brand/15 text-brand shadow-brand/35"
                    : "bg-pipelineGreen/15 text-pipelineGreen shadow-pipelineGreen/35"
                    }`}
                >
                  {item.icon}
                </span>

                <h3 className="mt-4 text-sm font-black text-textPrimary">{item.title}</h3>
                <p className="mt-1.5 text-xs font-medium text-textGray">{item.desc}</p>

                {!isLast && (
                  <>
                    <span className="ec-pipeline-connector hidden lg:block" aria-hidden="true">
                      <span className="ec-pipeline-flow" />
                      <span className="ec-pipeline-arrow" />
                    </span>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
