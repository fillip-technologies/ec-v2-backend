"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

interface HeroSectionProps {
  onOpenEnquiry?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenEnquiry }) => {
  return (
    <section id="heroSection" className="relative isolate overflow-hidden bg-bgBody py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-8 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-brand/8 blur-3xl" />
      </div>

      <div className="container-main">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="ec-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-borderSoft bg-bgSoft px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-brand shadow-xs">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Industry-Standard Internship Operating System
            </span>

            <h1 className="mt-8 max-w-3xl text-4xl font-black leading-[1.02] tracking-tight text-textPrimary sm:text-5xl lg:text-[3.8rem]">
              Build real production capstones. Prove you are job-ready.
            </h1>

            <p className="mt-6 max-w-[35rem] text-lg font-medium leading-8 text-textGray">
              Choose from 5 engineering clusters, complete 3 sequential milestone projects, publish verified code to GitHub, and earn AI-evaluated credentials backed by reviewed proof of work.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalog"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand px-7 py-3 text-sm font-black text-white shadow-lg shadow-brand/25 transition duration-300 hover:-translate-y-1 hover:bg-brandHover cursor-pointer"
              >
                <span>Explore Academic Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-borderSoft bg-white px-7 py-3 text-sm font-black text-textPrimary transition duration-300 hover:-translate-y-1 hover:bg-bgSoft hover:text-textPrimary"
              >
                See How It Works
              </a>
            </div>
          </div>

          <div className="relative flex min-h-[410px] items-start justify-center pt-2 ec-fade-up sm:min-h-[470px] lg:min-h-[520px] lg:pt-6">
            <div className="pointer-events-none absolute left-1/2 top-[42%] h-[25rem] w-[25rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl sm:h-[31rem] sm:w-[31rem]" />
            <div className="pointer-events-none absolute bottom-16 left-1/2 h-16 w-[68%] -translate-x-1/2 rounded-full bg-brandPastel/45 blur-2xl" />

            <Image
              src="/images/hero-new-girl.png"
              alt="Student building a project in a guided workspace"
              width={600}
              height={600}
              priority
              className="relative z-10 h-auto max-h-[410px] w-full max-w-[31rem] object-contain object-center sm:max-h-[500px] sm:max-w-[35rem] lg:max-h-[575px] lg:max-w-[38rem]"
            />

            <div className="absolute left-4 top-14 hidden rounded-2xl border border-borderSoft bg-white/90 px-4 py-3 shadow-md backdrop-blur-xl sm:block">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-textSubtle">GitHub Integration</p>
              <p className="mt-0.5 text-xs font-black text-textPrimary">Verified Commits</p>
            </div>

            <div className="absolute right-4 top-[38%] hidden rounded-2xl border border-borderSoft bg-white/90 px-4 py-3 shadow-md backdrop-blur-xl md:block">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-brand">AI Rubrics</p>
              <p className="mt-0.5 text-xs font-black text-emerald-700">100-Pt Grading</p>
            </div>

            <div className="absolute bottom-16 left-8 hidden rounded-2xl border border-borderSoft bg-white/90 px-4 py-3 shadow-md backdrop-blur-xl lg:block">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-textSubtle">Credential</p>
              <p className="mt-0.5 text-xs font-black text-textPrimary">ISO QR-Verified</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
