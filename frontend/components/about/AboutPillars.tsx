"use client";

import React from "react";
import { ABOUT_DATA } from "@/config/aboutData";

export const AboutPillars: React.FC = () => {
  return (
    <section className="bg-bgSoft py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {ABOUT_DATA.pillars.map((pillar, idx) => (
            <article key={idx} className="rounded-2xl border border-borderLight bg-white p-6 shadow-sm">
              <div className="mb-5 h-1.5 w-14 rounded-full bg-gradient-to-r from-brand to-secondary" />
              <h3 className="text-xl font-extrabold text-textPrimary">{pillar.title}</h3>
              <p className="mt-3 leading-7 text-textGray">{pillar.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
