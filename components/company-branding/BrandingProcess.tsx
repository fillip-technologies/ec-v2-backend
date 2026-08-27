"use client";

import React from "react";
import { Target, Users, Megaphone, BarChart3 } from "lucide-react";

export const BrandingProcess: React.FC = () => {
  const steps = [
    {
      label: "01",
      icon: <Target className="h-5 w-5" />,
      title: "Campaign brief",
      body: "Define the business goal: hiring demand, brand recall, product adoption, event registrations, or certification uptake.",
    },
    {
      label: "02",
      icon: <Users className="h-5 w-5" />,
      title: "Audience build",
      body: "Map segments by domain, learning track, seniority, college context, and expected action.",
    },
    {
      label: "03",
      icon: <Megaphone className="h-5 w-5" />,
      title: "Distribution launch",
      body: "Activate selected placements with messaging, registration flows, reminder systems, and campaign coordination.",
    },
    {
      label: "04",
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Performance readout",
      body: "Review reach, engagement, conversion quality, channel lift, and next-step recommendations.",
    },
  ];

  return (
    <section className="bg-bgSoft py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
              Operating workflow
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">
              A campaign system from brief to performance review.
            </h2>
          </div>
          <div className="rounded-2xl border border-borderLight bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2 text-xs font-bold text-textGray">
              {["Brief", "Segment", "Launch", "Track", "Report"].map((stage, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-borderLight bg-bgSoft px-3 py-1.5"
                >
                  {stage}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-12 grid gap-5 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-[2.65rem] hidden h-px bg-gradient-to-r from-transparent via-brand/25 to-transparent lg:block" />
          {steps.map((step, idx) => (
            <article
              key={idx}
              className="group relative rounded-2xl border border-borderLight bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-borderLight bg-white text-brand shadow-sm transition duration-300 group-hover:border-brand/30 group-hover:bg-brand group-hover:text-white">
                  {step.icon}
                </span>
                <span className="rounded-full border border-borderLight bg-bgMain px-3 py-1 text-xs font-black text-brand">
                  {step.label}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-extrabold text-textPrimary">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-textGray">{step.body}</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-textMuted">
                <span className="h-px flex-1 bg-borderLight" />
                <span>Ops step</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
