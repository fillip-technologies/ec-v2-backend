"use client";

import React from "react";
import { X, Check } from "lucide-react";

export const AboutNewSection: React.FC = () => {
  const problems = [
    { title: "Watching tutorials only", desc: "Passive video watching feels productive but leaves zero recruiter-verifiable proof." },
    { title: "No finished capstones", desc: "Incomplete tutorial clones fail to demonstrate full-lifecycle engineering ownership." },
    { title: "Empty GitHub repositories", desc: "Recruiters cannot verify your real commit habits, clean architecture, or debugging flow." },
    { title: "No practical experience", desc: "Interview answers remain theoretical without production deployment evidence." },
  ];

  const solutions = [
    { step: "01", title: "Hands-On Academic Curriculum", desc: "Sequential production capstones aligned with university internship standards and industry requirements." },
    { step: "02", title: "Personal Milestone Workspace", desc: "Every student gets a structured Kanban board with clear task specs and GitHub syncing." },
    { step: "03", title: "Automated BullMQ AI Review", desc: "Submit code to receive instant, objective 100-point rubric evaluations and constructive feedback." },
    { step: "04", title: "ISO QR-Verified Credential", desc: "Unlock industry certificates featuring unique verification IDs and LinkedIn 1-click sharing." },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute -left-24 top-12 -z-10 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-12 -z-10 h-80 w-80 rounded-full bg-brandLight/10 blur-3xl" />

      <div className="container-main">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-borderSoft bg-bgBody px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand shadow-xs">
              Why Students Struggle
            </span>
            <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight tracking-tight text-textPrimary sm:text-4xl lg:text-5xl">
              Tutorials do not get you hired.{" "}
              <span className="block bg-gradient-to-r from-brand to-brandLight bg-clip-text text-transparent">
                Proof of work does.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-textGray">
              Hiring managers don't evaluate how many videos you watched. They evaluate what you built, how you structured your backend, and whether your GitHub demonstrates real engineering competence.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {problems.map((problem, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-borderSoft bg-bgBody p-5 transition duration-300 hover:scale-[1.02] hover:border-brand hover:bg-surface hover:shadow-lg"
                >
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-dangerLight text-danger">
                    <X className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-black text-textPrimary">{problem.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-textGray">{problem.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-borderSoft bg-white p-4 shadow-xl">
              <div className="rounded-[1.5rem] border border-borderSoft bg-gradient-to-br from-white via-surface to-bgMain p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-brand">
                      Engineers Clinic Method
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-textPrimary">From passive learning to verified proof</h3>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-bgSoft text-brand backdrop-blur">
                    <Check className="h-6 w-6" />
                  </span>
                </div>

                <div className="mt-8 space-y-4">
                  {solutions.map((solution, idx) => (
                    <div
                      key={idx}
                      className="group flex gap-4 rounded-3xl border border-borderSoft bg-white p-4 backdrop-blur-xl transition duration-300 hover:scale-[1.02] hover:border-brand hover:bg-surface hover:shadow-lg"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-bgSoft text-sm font-black text-brand">
                        {solution.step}
                      </span>
                      <div>
                        <h4 className="font-black text-textPrimary">{solution.title}</h4>
                        <p className="mt-1 text-xs leading-6 text-textGray">{solution.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
