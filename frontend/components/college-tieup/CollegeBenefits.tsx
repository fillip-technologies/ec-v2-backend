"use client";

import React from "react";

export const CollegeBenefits: React.FC = () => {
  const benefits = [
    {
      title: "Structured internship delivery",
      body: "Run cohort-based practical learning with fixed milestones, domain tracks, and completion visibility for each department.",
    },
    {
      title: "Lower coordination load",
      body: "Our team supports onboarding, student communication, mentor mapping, and routine academic updates.",
    },
    {
      title: "Evidence for reviews",
      body: "Colleges receive progress signals, project outputs, attendance views, and completion-ready reports.",
    },
    {
      title: "Placement cell alignment",
      body: "Learning paths are mapped to portfolios, interview discussion points, and applied project confidence.",
    },
  ];

  return (
    <section id="college-benefits" className="bg-bgSoft py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[0.74fr_1fr] lg:items-start">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
              Why partner with us
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">
              Built for college operations, not just student sign-ups.
            </h2>
            <p className="mt-5 text-base leading-8 text-textGray">
              The partnership model focuses on governance, measurable progress, and repeatable delivery so administrators can scale practical learning without adding operational noise.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((b, idx) => (
              <article key={idx} className="rounded-2xl border border-borderLight bg-white p-6 shadow-sm">
                <div className="mb-5 h-1 w-10 rounded-full bg-gradient-to-r from-brand to-secondary" />
                <h3 className="text-lg font-extrabold text-textPrimary">{b.title}</h3>
                <p className="mt-3 text-sm leading-7 text-textGray">{b.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
