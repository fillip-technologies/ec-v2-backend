"use client";

import React from "react";

export const AboutLeadership: React.FC = () => {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
            Leadership
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">
            The people behind Engineers Clinic.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Founder */}
          <article className="overflow-hidden rounded-2xl border border-borderLight bg-white shadow-sm transition hover:shadow-md">
            <img
              src="/images/founder-portrait.webp"
              alt="Founder of Engineers Clinic"
              className="aspect-[4/5] w-full object-cover object-top"
            />
            <div className="p-5">
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-brand">
                Founder
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-textPrimary">
                Shreekant Pratap Singh
              </h3>
              <p className="mt-2 text-sm leading-6 text-textGray">
                Guiding the vision, learning model, and long-term growth of Engineers Clinic.
              </p>
            </div>
          </article>

          {/* Co-Founder */}
          <article className="overflow-hidden rounded-2xl border border-borderLight bg-white shadow-sm transition hover:shadow-md">
            <img
              src="/images/cofounder-portrait.jpeg"
              alt="Co-Founder of Engineers Clinic"
              className="aspect-[4/5] w-full object-cover object-top"
            />
            <div className="p-5">
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-brand">
                Co-Founder
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-textPrimary">
                Vikash Kumar
              </h3>
              <p className="mt-2 text-sm leading-6 text-textGray">
                Shaping execution, partnerships, and the learner experience across programs.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
