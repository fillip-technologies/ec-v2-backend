"use client";

import React from "react";

export const AboutImpactStats: React.FC = () => {
  const impactStats = [
    {
      value: "1,200+",
      label: "Students Trained",
      desc: "Across multiple engineering disciplines and career tracks",
    },
    {
      value: "50+",
      label: "College Partners",
      desc: "Universities and institutions trust our training model",
    },
    {
      value: "95%",
      label: "Completion Rate",
      desc: "Of enrolled students complete their chosen program track",
    },
    {
      value: "10+",
      label: "Skill Domains",
      desc: "From Web Dev to AI/ML, Cybersecurity, Cloud, and beyond",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-surfaceDark py-14 sm:py-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,92,252,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,200,66,0.10),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brandLight">
            Impact & Reach
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Numbers that reflect our commitment.
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {impactStats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <p className="text-3xl font-black text-white">{stat.value}</p>
              <p className="mt-2 text-sm font-extrabold text-brandLight">{stat.label}</p>
              <p className="mt-2 text-xs leading-5 text-white/60">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
