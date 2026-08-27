"use client";

import React from "react";

export const BrandingAnalytics: React.FC = () => {
  const metrics = ["Audience reach", "Engagement quality", "Channel lift", "Qualified actions"];

  const channelPerf = [
    { label: "LMS placements", percent: 76 },
    { label: "Webinar reminders", percent: 69 },
    { label: "College outreach", percent: 58 },
    { label: "Community media", percent: 44 },
  ];

  const bars = [42, 68, 54, 78, 64, 86, 72];

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.74fr_1fr] lg:items-center">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
            Reporting layer
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">
            Performance visibility for marketing, talent, and leadership teams.
          </h2>
          <p className="mt-5 text-base leading-8 text-textGray">
            Every activation can be reviewed through a practical reporting layer covering audience reach, registrations, engagement quality, channel performance, and recommended follow-ups.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-borderLight bg-bgSoft px-4 py-3 text-sm font-bold text-textPrimary"
              >
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Card */}
        <div className="overflow-hidden rounded-2xl border border-borderLight bg-white shadow-[0_24px_70px_rgba(22,8,64,0.10)]">
          <div className="flex items-center justify-between border-b border-borderLight px-5 py-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-textMuted">
                Campaign report
              </p>
              <p className="mt-1 font-extrabold text-textPrimary">
                Employer branding webinar series
              </p>
            </div>
            <span className="rounded-full bg-bgSoft px-3 py-1 text-xs font-bold text-brand">
              Export ready
            </span>
          </div>

          <div className="bg-bgSoft p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-borderLight bg-white p-4 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-textMuted">
                  Registrations
                </p>
                <p className="mt-2 text-2xl font-black text-textPrimary">2,430</p>
              </div>
              <div className="rounded-2xl border border-borderLight bg-white p-4 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-textMuted">
                  Engagement
                </p>
                <p className="mt-2 text-2xl font-black text-textPrimary">61%</p>
              </div>
              <div className="rounded-2xl border border-borderLight bg-white p-4 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-textMuted">
                  Qualified actions
                </p>
                <p className="mt-2 text-2xl font-black text-textPrimary">380</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-borderLight bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <p className="font-extrabold text-textPrimary">Channel performance</p>
                <span className="rounded-full bg-bgSoft px-3 py-1 text-xs font-bold text-brand">
                  Attribution view
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {channelPerf.map((row, idx) => (
                  <div key={idx}>
                    <div className="mb-2 flex justify-between text-xs font-bold text-textGray">
                      <span>{row.label}</span>
                      <span>{row.percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-bgSoft">
                      <div
                        className="h-2 rounded-full bg-brand"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-borderLight bg-white p-5 shadow-sm">
                <p className="text-sm font-extrabold text-textPrimary">Audience quality signals</p>
                <div className="mt-4 flex items-end gap-2">
                  {bars.map((h, idx) => (
                    <span
                      key={idx}
                      className="flex-1 rounded-t-md bg-brand/80 transition duration-300 hover:bg-brand"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-borderLight bg-brandDark p-5 text-white shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/60">
                  Recommendation
                </p>
                <p className="mt-3 text-sm leading-7 text-white/80">
                  Retarget webinar registrants with role-specific content and a follow-up hiring campaign.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
