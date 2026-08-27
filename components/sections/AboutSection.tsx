"use client";

import React from "react";
import Image from "next/image";
import { Container } from "../ui/Container";
import { Badge } from "../ui/Badge";
import { CheckCircle2, Cpu, GraduationCap, Briefcase, Sparkles } from "lucide-react";

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative isolate overflow-hidden bg-bgBody py-16 sm:py-20 lg:py-24">
      <Container size="wide">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Visual Showcase */}
          <div className="relative">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-brand/15 to-success/15 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-borderSoft bg-white p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-borderSoft pb-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-bgSoft text-brand">
                    <GraduationCap className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-textPrimary">
                    Engineers Clinic Operating Model
                  </span>
                </div>
                <Badge variant="emerald" showDot>
                  Industry Aligned
                </Badge>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title: "1. Select Internship Program",
                    desc: "Choose from 120-hour streams across Engineering, Business, Law, or Media.",
                    icon: <Briefcase className="h-4 w-4 text-brand" />,
                  },
                  {
                    title: "2. Personal Workspace Snapshot",
                    desc: "Your workspace is frozen at enrolment—admin updates never disrupt active work.",
                    icon: <Cpu className="h-4 w-4 text-info" />,
                  },
                  {
                    title: "3. AI Evaluation Subsystem",
                    desc: "BullMQ async workers run rubric evaluation against OpenAI structured outputs.",
                    icon: <Sparkles className="h-4 w-4 text-warningMuted" />,
                  },
                  {
                    title: "4. Verifiable QR Certificate",
                    desc: "Earn a tamper-proof credential with public verification route and LinkedIn sharing.",
                    icon: <CheckCircle2 className="h-4 w-4 text-success" />,
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-2xl border border-borderSoft bg-bgBody p-4 transition hover:border-brand hover:bg-white"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-textPrimary">{step.title}</h4>
                      <p className="mt-1 text-xs text-textGray">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div>
            <Badge variant="brand">About Engineers Clinic</Badge>
            <h2 className="mt-5 text-3xl font-black leading-tight text-textPrimary sm:text-4xl lg:text-5xl">
              An AI-evaluated, outcome-driven internship platform.
            </h2>
            <p className="mt-5 text-base leading-8 text-textGray">
              Engineers Clinic replaces generic video tutorials with real, practical project execution. Students pick a discipline, work through guided milestones, submit code and documentation to GitHub, and receive instant rubric feedback from our AI evaluation engine.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Direct B2C student enrollment & B2B institutional college tie-up distribution.",
                "Strict submission state machine with retries, caps, and manual fallback.",
                "Public verifiable certificate page ensuring authentic credential validation.",
              ].map((point, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-successLight text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-bold text-textPrimary">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
