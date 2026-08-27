"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, ShieldCheck, Award } from "lucide-react";
import { getPrograms } from "@/lib/api/catalog";
import { FALLBACK_PROGRAMS } from "@/config/catalogFallback";

interface MasterInternshipSectionProps {
  onOpenEnquiry?: () => void;
}

export const MasterInternshipSection: React.FC<MasterInternshipSectionProps> = ({ onOpenEnquiry }) => {
  const [featuredPrograms, setFeaturedPrograms] = useState<any[]>(FALLBACK_PROGRAMS.slice(0, 3));

  useEffect(() => {
    getPrograms({ status: "published" })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFeaturedPrograms(data.slice(0, 3));
        }
      })
      .catch((err) => console.warn("Using fallback featured programs:", err));
  }, []);

  const badgeLabels = ["Starter Flagship", "Most Popular", "High Demand"];

  return (
    <section className="relative isolate overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      {/* Background ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-20 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-brandLight/10 blur-3xl" />
      </div>

      <div className="container-main">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-borderSoft bg-bgBody px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Featured Career Tracks</span>
          </span>
          <h2 className="mt-5 text-3xl font-black leading-tight text-textPrimary sm:text-4xl lg:text-5xl">
            Start with an Industry Capstone Career Track.
          </h2>
          <p className="mt-4 text-base leading-8 text-textGray">
            Hands-on curriculum engineered for industry competence and practical portfolio proof. Complete guided production tasks, receive instant AI rubric grading, and build verified proof of work.
          </p>
        </div>

        {/* 3 Featured Program Cards Grid */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {featuredPrograms.map((program, idx) => {
            const isPopular = idx === 1;
            const badge = badgeLabels[idx] || "Career Track";
            const pricing = program.pricings?.[0] || { currency: "INR", amount: 4999 };
            const techList = program.technologies || [];

            return (
              <article
                key={program.id || program.slug}
                className={`group relative flex min-h-full flex-col justify-between overflow-hidden rounded-[2.5rem] border ${isPopular
                    ? "border-brand bg-surface text-textPrimary shadow-2xl scale-[1.02] ring-2 ring-brand/20"
                    : "border-borderSoft bg-white text-textPrimary shadow-md"
                  } p-6 sm:p-8 transition duration-300 hover:scale-[1.03] hover:border-brand hover:shadow-2xl`}
              >
                <div>
                  {/* Top Badge & Duration */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-3.5 py-1 text-xs font-black ${isPopular
                          ? "bg-brand text-white shadow-xs"
                          : "bg-bgSoft text-brand border border-borderLight"
                        }`}
                    >
                      {badge}
                    </span>

                    <span className="text-[11px] font-extrabold text-textMuted uppercase tracking-wider">
                      {program.durationHours || 120} Hours
                    </span>
                  </div>

                  {/* Title & Outcomes */}
                  <div className="mt-6">
                    <h3 className="text-xl font-black text-textPrimary leading-snug group-hover:text-brand transition-colors line-clamp-2">
                      {program.title}
                    </h3>
                    <p className="mt-3 text-xs text-textGray leading-relaxed line-clamp-3">
                      {program.description || program.outcomes}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="mt-6 flex items-baseline gap-2 border-b border-borderSoft pb-6">
                    <span className="text-4xl font-black text-textPrimary">
                      ₹{pricing.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-bold text-textMuted">one-time enrollment</span>
                  </div>

                  {/* Feature Deliverables Checklist */}
                  <div className="mt-6 space-y-3">
                    {[
                      "Personal Cloud Workspace & Milestone Board",
                      "3 Production-Ready Sequential Capstones",
                      "Automated BullMQ AI Code Rubric Grading",
                      "GitHub Commit & PR Verification History",
                      "ISO-Standard QR-Verified Certificate",
                    ].map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-3">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-xs font-bold text-textGray">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tech stack chips */}
                  {techList.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-1.5 pt-2">
                      {techList.slice(0, 4).map((tech: any, tIdx: number) => (
                        <span
                          key={tIdx}
                          className="rounded-md border border-borderLight bg-bgSoft/80 px-2 py-0.5 text-[10px] font-bold text-textSecondary"
                        >
                          {typeof tech === "string" ? tech : tech.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct CTA Link to Program Curriculum Checkout */}
                <div className="mt-8 pt-4">
                  <Link
                    href={`/catalog/${program.slug}`}
                    className={`inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition duration-300 shadow-md ${isPopular
                        ? "bg-brand text-white hover:bg-brandHover hover:shadow-brand/30"
                        : "bg-textPrimary text-white hover:bg-black"
                      } cursor-pointer group-hover:translate-y-[-2px]`}
                  >
                    <span>View Syllabus & Enroll</span>
                    <ArrowRight className="h-3.5 w-3.5 text-white/90" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
