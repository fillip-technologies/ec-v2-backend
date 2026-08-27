"use client";

import React from "react";

export const BrandingChannels: React.FC = () => {
  const channels = [
    {
      title: "LMS placements",
      body: "Contextual visibility inside learning journeys, project modules, skill communities, and career-track touchpoints.",
      signal: "High intent",
    },
    {
      title: "Webinar funnels",
      body: "Hosted sessions for product education, employer stories, certification explainers, and hiring awareness.",
      signal: "Registrations",
    },
    {
      title: "Campus outreach",
      body: "Coordinator-led distribution across relevant departments, student groups, and college-facing updates.",
      signal: "Local reach",
    },
    {
      title: "Community media",
      body: "Campaign narratives across newsletters, social posts, student updates, reminders, and event communication.",
      signal: "Repeat recall",
    },
  ];

  return (
    <section id="branding-channels" className="bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.72fr_1fr] lg:items-start">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
            Distribution network
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">
            Reach audiences through owned, contextual, and measurable channels.
          </h2>
          <p className="mt-5 text-base leading-8 text-textGray">
            Campaigns are mapped by objective, audience segment, content format, and expected action so every placement has a clear job to do.
          </p>
          <div className="mt-7 rounded-2xl border border-borderLight bg-bgSoft p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-textMuted">
              Placement strategy
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {["Awareness", "Registration", "Consideration", "Qualified interest"].map(
                (goal, idx) => (
                  <span
                    key={idx}
                    className="rounded-xl border border-borderLight bg-white px-3 py-2 text-center font-bold text-textPrimary"
                  >
                    {goal}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-borderLight bg-white shadow-[0_22px_62px_rgba(22,8,64,0.08)]">
          <div className="grid border-b border-borderLight bg-bgSoft px-5 py-4 text-xs font-extrabold uppercase tracking-[0.14em] text-textMuted sm:grid-cols-[210px_1fr_120px]">
            <span>Channel</span>
            <span>Campaign role</span>
            <span className="hidden sm:block text-right">Signal</span>
          </div>
          {channels.map((ch, idx) => (
            <article
              key={idx}
              className="group grid gap-3 border-b border-borderLight p-5 transition duration-300 last:border-b-0 hover:bg-bgSoft sm:grid-cols-[210px_1fr_120px] sm:gap-8"
            >
              <h3 className="font-extrabold text-textPrimary">{ch.title}</h3>
              <p className="text-sm leading-7 text-textGray">{ch.body}</p>
              <span className="h-fit w-fit rounded-full border border-brand/20 bg-brand/15 px-3 py-1 text-xs font-black text-brand sm:justify-self-end">
                {ch.signal}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
