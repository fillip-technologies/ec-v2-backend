"use client";

import React from "react";
import { Container } from "../ui/Container";
import { Badge } from "../ui/Badge";
import { Layers, Layout, GitBranch, Sparkles, Award, ShieldCheck } from "lucide-react";

export const WhyChooseUsSection: React.FC = () => {
  const features = [
    {
      icon: <Layers className="h-6 w-6 text-brand" />,
      title: "5 Academic Clusters",
      desc: "Comprehensive practical curriculums spanning Full Stack, AI & Data, Cloud DevOps, Cybersecurity, and Embedded IoT.",
      glow: "rgba(124, 92, 252, 0.18)",
      bg: "from-surface to-white",
    },
    {
      icon: <Layout className="h-6 w-6 text-info" />,
      title: "Personal Workspace",
      desc: "Kanban milestone board, clear step-by-step deliverable requirements, and real-time progress telemetry in a dedicated workspace.",
      glow: "rgba(14, 165, 233, 0.18)",
      bg: "from-infoLight to-white",
    },
    {
      icon: <GitBranch className="h-6 w-6 text-success" />,
      title: "GitHub Workflow Verification",
      desc: "Build professional software habits with real git commits, public pull requests, and recruiter-inspectable repository proof.",
      glow: "rgba(34, 197, 94, 0.18)",
      bg: "from-successLight to-white",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-warningMuted" />,
      title: "Automated BullMQ AI Rubrics",
      desc: "Submit deliverables for instant 100-point rubric evaluation assessing architecture, code quality, functionality, and security.",
      glow: "rgba(234, 179, 8, 0.18)",
      bg: "from-warningLight to-white",
    },
    {
      icon: <Award className="h-6 w-6 text-brandLight" />,
      title: "ISO QR-Verified Credential",
      desc: "Earn an industry credential featuring a tamper-proof QR code resolving to a public verification URL with 1-click LinkedIn sharing.",
      glow: "rgba(167, 139, 250, 0.18)",
      bg: "from-surface to-white",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-brand" />,
      title: "University & Recruiter Alignment",
      desc: "Meets university academic internship standards with structured grading logs universities and recruiters can trust.",
      glow: "rgba(124, 92, 252, 0.18)",
      bg: "from-surface to-white",
    },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <Container size="wide">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Badge variant="brand">Platform Architecture</Badge>
          <h2 className="mt-5 text-3xl font-black leading-tight text-textPrimary sm:text-4xl lg:text-5xl">
            Everything students need to turn learning into proof.
          </h2>
          <p className="mt-4 text-base leading-8 text-textGray">
            A premium project-based system designed around tangible outcomes recruiters and universities can inspect.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((item, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-3xl border border-borderSoft bg-gradient-to-br ${item.bg} p-6 shadow-md transition duration-300 hover:scale-[1.02] hover:border-brand hover:shadow-2xl`}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl transition duration-300 group-hover:scale-125"
                style={{ background: item.glow }}
              />

              <div className="relative">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm transition duration-300 group-hover:-translate-y-1">
                  {item.icon}
                </span>

                <h3 className="mt-5 text-lg font-black text-textPrimary">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-textGray">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
