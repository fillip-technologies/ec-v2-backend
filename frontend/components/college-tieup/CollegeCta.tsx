"use client";

import React from "react";
import Link from "next/link";

interface CollegeCtaProps {
  onOpenEnquiry?: () => void;
}

export const CollegeCta: React.FC<CollegeCtaProps> = ({ onOpenEnquiry }) => {
  return (
    <section id="partnership-enquiry" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="overflow-hidden rounded-2xl border border-borderLight bg-brandDark shadow-xl">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-secondary">
                Partnership enquiry
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Start a structured college tie-up discussion.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
                Share your institution goals with our partnership team. We will help map tracks, student volume, reporting needs, and the right operating model.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/signup?role=college"
                className="inline-flex items-center justify-center rounded-2xl bg-secondary px-6 py-3.5 text-sm font-extrabold text-textPrimary transition hover:bg-white cursor-pointer shadow-md"
              >
                Register College Account
              </Link>
              <a
                href="tel:+917545999990"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-white/10"
              >
                Call +91-75459-99990
              </a>
              <a
                href="tel:+917979030298"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-white/10"
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
