"use client";

import React from "react";
import Link from "next/link";

interface AboutCtaProps {
  onOpenEnquiry?: () => void;
}

export const AboutCta: React.FC<AboutCtaProps> = ({ onOpenEnquiry }) => {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl border border-borderLight bg-gradient-to-r from-brand/8 via-white to-secondary/8 px-8 py-12 text-center shadow-sm sm:px-14 sm:py-16">
          <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
              Ready to start?
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">
              Your career-ready journey begins here.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-textGray">
              Whether you&apos;re a student exploring internships or a college looking to partner — Engineers Clinic has a path for you.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/#courses"
                className="inline-flex items-center justify-center rounded-2xl bg-brand px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/20 transition hover:bg-brandHover cursor-pointer"
              >
                Browse Internships
              </Link>
              <Link
                href="/#college-tieup"
                className="inline-flex items-center justify-center rounded-2xl border border-borderLight bg-white px-7 py-3.5 text-sm font-extrabold text-textPrimary transition hover:border-brand hover:text-brand cursor-pointer"
              >
                College Partnership
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
