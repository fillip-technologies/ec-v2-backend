"use client";

import React from "react";

export const BrandingCaseStudies: React.FC = () => {
  const cases = [
    {
      title: "SaaS product awareness campaign",
      metric: "3.8k",
      label: "student interactions",
      body: "A software tools brand introduced its platform through LMS placements, webinar registration, and project-context messaging.",
      tag: "Product marketing",
    },
    {
      title: "Graduate hiring visibility drive",
      metric: "720",
      label: "qualified interests",
      body: "A hiring team ran employer brand content and role-awareness communication across engineering communities.",
      tag: "Talent acquisition",
    },
    {
      title: "Certification launch with colleges",
      metric: "28",
      label: "distribution touchpoints",
      body: "A certification provider built awareness through college-aligned sessions and targeted student communications.",
      tag: "Growth campaign",
    },
  ];

  return (
    <section className="bg-bgSoft py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
              Campaign use cases
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">
              Formats that translate reach into measurable business signals.
            </h2>
          </div>
          <p className="text-base leading-8 text-textGray">
            Each format combines audience context, distribution channels, conversion moments, and reporting, so teams can understand what moved and why.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {cases.map((cs, idx) => (
            <article
              key={idx}
              className="group rounded-2xl border border-borderLight bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_18px_44px_rgba(22,8,64,0.10)]"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-extrabold text-brand">{cs.title}</p>
                <span className="rounded-full border border-borderLight bg-bgSoft px-3 py-1 text-xs font-bold text-textGray">
                  {cs.tag}
                </span>
              </div>
              <div className="mt-6 rounded-xl border border-borderLight bg-bgSoft p-4 transition duration-300 group-hover:bg-white">
                <p className="text-3xl font-black text-textPrimary">{cs.metric}</p>
                <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.14em] text-textMuted">
                  {cs.label}
                </p>
              </div>
              <p className="mt-5 text-sm leading-7 text-textGray">{cs.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
