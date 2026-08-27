"use client";

import React from "react";

export const BrandingTestimonials: React.FC = () => {
  const testimonials = [
    {
      quote:
        "The campaign felt far more structured than a typical student promotion. We had clear audience mapping, webinar participation data, and next-step recommendations.",
      name: "Employer Branding Lead",
      meta: "Technology Services Company",
    },
    {
      quote:
        "Engineers Clinic helped us reach students in the right learning context instead of running a broad, noisy campaign.",
      name: "Product Marketing Manager",
      meta: "Developer Tools Brand",
    },
  ];

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
              Partner signals
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">
              Built for teams that need reach with operational clarity.
            </h2>
          </div>
          <div className="rounded-2xl border border-borderLight bg-bgSoft p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Signal", "Audience fit"],
                ["Motion", "Campaign-led"],
                ["Output", "Actionable report"],
              ].map((item, idx) => (
                <div key={idx}>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-textMuted">
                    {item[0]}
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-textPrimary">{item[1]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {testimonials.map((t, idx) => (
            <figure
              key={idx}
              className="relative rounded-2xl border border-borderLight bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_18px_44px_rgba(22,8,64,0.08)]"
            >
              <div className="absolute right-7 top-6 text-5xl font-black leading-none text-brand/15">
                &ldquo;
              </div>
              <blockquote className="relative text-base leading-8 text-textGray">
                &quot;{t.quote}&quot;
              </blockquote>
              <figcaption className="mt-6 border-t border-borderLight pt-5">
                <p className="font-extrabold text-textPrimary">{t.name}</p>
                <p className="mt-1 text-sm font-medium text-textMuted">{t.meta}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
