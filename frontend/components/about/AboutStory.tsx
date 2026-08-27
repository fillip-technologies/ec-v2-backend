"use client";

import React from "react";
import { Target, Compass } from "lucide-react";

export const AboutStory: React.FC = () => {
  return (
    <section className="relative bg-white py-14 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(245,240,255,0.60),rgba(255,255,255,0.92)_50%,rgba(238,245,255,0.55))]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
            Our Story
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">
            From a simple idea to a growing movement.
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Main Story Paragraphs */}
          <div className="rounded-2xl border border-borderLight bg-white p-8 shadow-sm">
            <p className="text-base leading-8 text-textGray">
              Engineers Clinic started with a frustration every engineering student knows — the gap between what textbooks teach and what employers demand. Founded in 2023, we set out to build a learning platform that doesn&apos;t just teach, but trains. Our programs are modelled on real workplace workflows, giving learners a rehearsal ground before they step into their first role.
            </p>
            <p className="mt-5 text-base leading-8 text-textGray">
              What began as a small internship initiative has grown into a structured ecosystem of skill tracks, college partnerships, and industry-shaped programs. Today, Engineers Clinic bridges academia and industry for students across the country — one project at a time.
            </p>
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-borderLight bg-gradient-to-br from-brand/8 to-transparent p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-extrabold text-textPrimary">Our Mission</h3>
              <p className="mt-3 text-sm leading-7 text-textGray">
                To make career-ready learning accessible to every engineering student — regardless of college tier, location, or background — through structured internships and project-led programs.
              </p>
            </div>

            <div className="rounded-2xl border border-borderLight bg-gradient-to-br from-secondary/15 to-transparent p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/25 text-textPrimary">
                <Compass className="h-5 w-5 text-textPrimary" />
              </div>
              <h3 className="text-lg font-extrabold text-textPrimary">Our Vision</h3>
              <p className="mt-3 text-sm leading-7 text-textGray">
                To become India&apos;s most trusted bridge between academic learning and professional readiness — building a generation of engineers who are skilled, confident, and employable from day one.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
