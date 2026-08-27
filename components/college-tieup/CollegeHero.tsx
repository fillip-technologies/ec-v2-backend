"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface CollegeHeroProps {
  onOpenEnquiry?: () => void;
}

export const CollegeHero: React.FC<CollegeHeroProps> = ({ onOpenEnquiry }) => {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-borderLight to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(245,240,255,0.74),rgba(255,255,255,0.94)_42%,rgba(238,245,255,0.78))]" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:py-20 lg:grid-cols-[1.02fr_0.82fr] lg:items-center lg:py-24">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-borderLight bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            Institutional Partnership Program
          </div>

          <h1 className="mt-7 max-w-4xl text-4xl font-extrabold tracking-tight text-textPrimary sm:text-5xl lg:text-[4.4rem] lg:leading-[1.02]">
            Build a college-ready skill ecosystem with Engineers Clinic.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-textGray sm:text-lg">
            Partner with Engineers Clinic to deliver structured internships, department-wise project tracks, faculty coordination, student analytics, and placement-readiness support through one accountable operating model.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup?role=college"
              className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/20 transition hover:bg-brandHover cursor-pointer"
            >
              Register College Account
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-2xl border border-borderLight bg-white px-6 py-3.5 text-sm font-extrabold text-textPrimary transition hover:border-brand hover:text-brand"
            >
              See operating model
            </a>
          </div>

          <div className="mt-8 grid gap-3 border-t border-borderLight pt-6 text-sm text-textGray sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand" />
              <span className="font-semibold text-textPrimary">MoU-ready engagement structure</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand" />
              <span className="font-semibold text-textPrimary">Department-wise delivery planning</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand" />
              <span className="font-semibold text-textPrimary">Progress reports for coordinators</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-borderLight bg-white shadow-xl">
            <Image
              src="/images/buliding.jpg"
              alt="College campus partnership with Engineers Clinic"
              width={600}
              height={450}
              priority
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="border-t border-borderLight bg-white p-5">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-textMuted">
                    Partnership desk
                  </p>
                  <p className="mt-2 text-lg font-extrabold text-textPrimary">
                    Academic delivery + student outcomes
                  </p>
                </div>
                <div className="rounded-2xl border border-borderLight bg-bgSoft px-4 py-3 text-right">
                  <p className="text-2xl font-black text-textPrimary">30+</p>
                  <p className="text-xs font-bold text-textGray">tracks</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-borderLight bg-white p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-textMuted">
                For
              </p>
              <p className="mt-2 font-extrabold text-textPrimary">Principals & HODs</p>
            </div>
            <div className="rounded-2xl border border-borderLight bg-white p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-textMuted">
                Built for
              </p>
              <p className="mt-2 font-extrabold text-textPrimary">Placement cells</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
