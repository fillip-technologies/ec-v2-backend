"use client";

import React from "react";
import { Container } from "../ui/Container";
import { Badge } from "../ui/Badge";
import { Layers, FolderPlus, GitCommit, Sparkles, Award, ArrowRight } from "lucide-react";

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Pick Stream & 3 Projects",
      desc: "Browse streams across Tech, Management, Engineering, Law, or Media, and select exactly 3 projects.",
      icon: <FolderPlus className="h-6 w-6 text-brand" />,
      badge: "Step 1",
    },
    {
      num: "02",
      title: "Guided Step Progression",
      desc: "Work through sequential step milestones in your personal workspace snapshot.",
      icon: <Layers className="h-6 w-6 text-info" />,
      badge: "Step 2",
    },
    {
      num: "03",
      title: "GitHub Submission",
      desc: "Push code, commits, and project documentation to GitHub for transparent verification.",
      icon: <GitCommit className="h-6 w-6 text-success" />,
      badge: "Step 3",
    },
    {
      num: "04",
      title: "AI Rubric Review",
      desc: "BullMQ queue worker calls OpenAI structured grading to evaluate score, feedback, and pass threshold.",
      icon: <Sparkles className="h-6 w-6 text-warningMuted" />,
      badge: "Step 4",
    },
    {
      num: "05",
      title: "Verifiable Certificate",
      desc: "Earn a QR-verified certificate with public verification URL and LinkedIn achievement badge.",
      icon: <Award className="h-6 w-6 text-brandLight" />,
      badge: "Step 5",
    },
  ];

  return (
    <section id="how-it-works" className="relative isolate overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <Container size="wide">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <Badge variant="brand">Execution Pipeline</Badge>
          <h2 className="mt-5 text-3xl font-black leading-tight text-textPrimary sm:text-4xl lg:text-5xl">
            How the project internship works.
          </h2>
          <p className="mt-4 text-base leading-8 text-textGray">
            From enrollment to certificate issuance: a structured, transparent state machine.
          </p>
        </div>

        {/* Step Cards Row */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col justify-between rounded-3xl border border-borderSoft bg-bgBody p-6 shadow-sm transition duration-300 hover:scale-[1.03] hover:border-brand hover:bg-white hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-brand/40 group-hover:text-brand">
                    {item.num}
                  </span>
                  <span className="rounded-full bg-bgSoft px-2.5 py-1 text-[11px] font-black text-brand">
                    {item.badge}
                  </span>
                </div>

                <div className="mt-6 grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm transition group-hover:scale-110">
                  {item.icon}
                </div>

                <h3 className="mt-4 text-base font-black text-textPrimary">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-textGray">{item.desc}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="h-5 w-5 text-brand/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
