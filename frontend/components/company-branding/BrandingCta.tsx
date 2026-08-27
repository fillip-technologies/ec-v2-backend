"use client";

import React from "react";

export const BrandingCta: React.FC = () => {
  const tags = ["Media kit", "Audience plan", "Campaign calendar", "Reporting scope"];

  return (
    <section id="branding-enquiry" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl border border-borderLight bg-brandDark shadow-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.16),transparent_30%),linear-gradient(120deg,rgba(37,99,235,0.28),transparent_48%)]" />
          <div className="relative grid gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-secondary">
                Campaign onboarding
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Launch a measurable audience reach campaign with Engineers Clinic.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/75">
                Share your campaign objective. We will help define audience fit, channel mix, activation flow, reporting structure, and next best campaign motion.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-white/75">
                {tags.map((item, idx) => (
                  <span
                    key={idx}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href="mailto:info@engineersclinic.com?subject=Company%20Branding%20Campaign%20Enquiry"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-secondary px-7 py-3.5 text-sm font-extrabold text-textPrimary shadow-lg shadow-secondary/20 transition hover:-translate-y-0.5 hover:bg-white"
              >
                Schedule Branding Call
              </a>
              <a
                href="tel:+917545999990"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 px-7 py-3.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Request Media Kit
              </a>
              <a
                href="tel:+917979030298"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 px-7 py-3.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Call +91-79790-30298
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
