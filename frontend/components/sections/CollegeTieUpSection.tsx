"use client";

import React from "react";
import Link from "next/link";

interface CollegeTieUpSectionProps {
  onOpenEnquiry?: () => void;
}

export const CollegeTieUpSection: React.FC<CollegeTieUpSectionProps> = ({ onOpenEnquiry }) => {
  const colleges = [
    "IIT Partner Cell",
    "NIT Innovation Hub",
    "Tech University",
    "Global Institute",
    "Engineering College",
    "Design School",
    "Management Campus",
    "Law Academy",
  ];

  return (
    <section id="college-tieup" className="relative overflow-hidden bg-white py-14 sm:py-16">
      <div className="container-main">
        <div className="grid items-center gap-8 rounded-[2rem] border border-borderSoft bg-bgBody p-6 shadow-md lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
          <div>
            <span className="inline-flex rounded-full bg-brand/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand">
              College Tie-up Program
            </span>
            <h2 className="mt-5 text-3xl font-black leading-tight text-textPrimary sm:text-4xl">
              Bring project-based learning to your campus.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-textGray">
              We partner with institutions to run structured project workspaces, GitHub submissions, mentor reviews, certificates, and placement-ready progress reports.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup?role=college"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-black text-white shadow-lg shadow-brand/25 transition hover:-translate-y-1 hover:bg-brandHover cursor-pointer"
              >
                Request College Tie-up
              </Link>
              <Link
                href="/college-tieup"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-borderSoft bg-white px-5 py-3 text-sm font-black text-textPrimary transition hover:-translate-y-1 hover:bg-bgSoft hover:text-textPrimary cursor-pointer"
              >
                View Benefits
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-borderSoft bg-white py-6 shadow-sm">
            <div className="flex w-max gap-4 ec-marquee">
              {[...colleges, ...colleges].map((college, idx) => (
                <div
                  key={idx}
                  className="flex h-20 w-52 shrink-0 items-center justify-center rounded-2xl border border-borderSoft bg-gradient-to-br from-white to-bgBody px-5 text-center text-sm font-black text-textPrimary shadow-sm"
                >
                  {college}
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 px-6 sm:grid-cols-3">
              {["Campus onboarding", "MoU ready", "Coordinator support"].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-brand/10 px-4 py-3 text-center text-sm font-black text-brand"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
