"use client";

import React from "react";

export const DashboardPreviewSection: React.FC = () => {
  return (
    <section className="relative isolate overflow-hidden bg-bgBody py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-brandLight/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(124,92,252,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(124,92,252,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <div className="container-main">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-borderSoft bg-bgSoft px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand">
            Student Workspace
          </span>
          <h2 className="mt-5 text-3xl font-black leading-tight text-textPrimary sm:text-4xl lg:text-5xl">
            A personal dashboard for every project.
          </h2>
          <p className="mt-5 text-base leading-8 text-textGray">
            Notion clarity, Jira structure, Linear polish: tasks, milestones, GitHub, reviews, and certificate status in one place.
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-6xl ec-float">
          <div className="absolute inset-x-10 bottom-0 top-10 rounded-[2rem] bg-brand/12 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-borderSoft bg-white/80 p-3 shadow-2xl backdrop-blur-2xl">
            <div className="overflow-hidden rounded-[1.5rem] border border-borderSoft bg-bgBody">
              <img
                src="/images/add-dashboard.png"
                alt="A personal dashboard for every project"
                className="w-full h-auto object-contain object-top transition duration-500 hover:scale-[1.01]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
