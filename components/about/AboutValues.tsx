"use client";

import React from "react";
import { Zap, Globe, ShieldCheck, Heart } from "lucide-react";

export const AboutValues: React.FC = () => {
  const values = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Execution Over Theory",
      desc: "We believe that building something is worth more than reading about it. Every module ends with real output.",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Accessibility First",
      desc: "Tier-1 or tier-3, metro or rural — every student deserves access to career-grade training without barriers.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Transparency & Trust",
      desc: "Clear pricing, honest outcomes, real student testimonials. We never over-promise — we let results speak.",
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: "Learner-Centric Design",
      desc: "From dashboard UX to curriculum pacing, every detail is designed with the student's experience at the center.",
    },
  ];

  return (
    <section className="bg-bgSoft py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
            Our Values
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">
            The principles that shape every program we build.
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((item, idx) => (
            <article key={idx} className="rounded-2xl border border-borderLight bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                {item.icon}
              </div>
              <h3 className="text-lg font-extrabold text-textPrimary">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-textGray">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
