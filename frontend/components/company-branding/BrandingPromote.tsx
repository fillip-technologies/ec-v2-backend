"use client";

import React from "react";
import { Briefcase, LayoutGrid, Award, Trophy, Users, Megaphone } from "lucide-react";

export const BrandingPromote: React.FC = () => {
  const items = [
    {
      icon: <Briefcase className="h-5 w-5" />,
      title: "Hiring demand generation",
      body: "Build role awareness, internship pipelines, graduate hiring funnels, and company culture recall.",
    },
    {
      icon: <LayoutGrid className="h-5 w-5" />,
      title: "Product adoption campaigns",
      body: "Introduce SaaS tools, developer platforms, and student-facing products inside relevant learning contexts.",
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: "Certification launches",
      body: "Promote certification offers, scholarships, skill challenges, and cohort enrollment journeys.",
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      title: "Events and challenges",
      body: "Run hackathons, webinars, workshops, and registration-led activations with follow-up reporting.",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Employer brand visibility",
      body: "Position your company as a serious career destination for technical, business, and creative talent.",
    },
    {
      icon: <Megaphone className="h-5 w-5" />,
      title: "Always-on awareness",
      body: "Create repeated visibility across student cohorts, community updates, and institutional touchpoints.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-bgSoft py-16 sm:py-20">
      <div className="pointer-events-none absolute left-0 top-12 h-56 w-56 rounded-full bg-brand/15 blur-3xl" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
              Campaign inventory
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">
              Built for brand, talent, and product teams with clear activation goals.
            </h2>
          </div>
          <div className="rounded-2xl border border-borderLight bg-white p-5 shadow-sm">
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-textMuted">
                  Planning unit
                </p>
                <p className="mt-1 font-bold text-textPrimary">Campaign brief</p>
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-textMuted">
                  Output
                </p>
                <p className="mt-1 font-bold text-textPrimary">Reach + intent</p>
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-textMuted">
                  Review
                </p>
                <p className="mt-1 font-bold text-textPrimary">Performance report</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <article
              key={idx}
              className="group rounded-2xl border border-borderLight bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-borderLight bg-bgMain text-brand transition duration-300 group-hover:border-brand/30 group-hover:bg-brand group-hover:text-white">
                  {item.icon}
                </span>
                <span className="h-2 w-2 rounded-full bg-secondary" />
              </div>
              <h3 className="mt-6 text-lg font-extrabold text-textPrimary">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-textGray">{item.body}</p>
              <div className="mt-5 h-px bg-gradient-to-r from-brand/30 via-borderLight to-transparent" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
