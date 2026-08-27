"use client";

import React from "react";

export const StatSection: React.FC = () => {
  const stats = [
    { display: "6K+", label: "Students enrolled", note: "Building real project portfolios" },
    { display: "320+", label: "Project options", note: "Across multiple domains and levels" },
    { display: "4.1K+", label: "Certificates issued", note: "Unlocked after submission review" },
    { display: "98%", label: "Completion rate", note: "Guided by milestone workflows" },
  ];

  return (
    <section className="bg-bgBody py-14 sm:py-16 lg:py-20">
      <div className="container-main">
        <div className="overflow-hidden rounded-[2rem] border border-borderSoft bg-white shadow-lg">
          <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative isolate bg-gradient-to-br from-white to-surface p-6 sm:p-8 lg:p-10">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_22%,rgba(124,92,252,0.12),transparent_32%),radial-gradient(circle_at_85%_78%,rgba(167,139,250,0.10),transparent_30%)]" />
              <span className="inline-flex rounded-full bg-bgSoft px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand">
                Success Numbers
              </span>
              <h2 className="mt-5 text-3xl font-black leading-tight text-textPrimary sm:text-4xl">
                Proof that structure creates outcomes.
              </h2>
              <p className="mt-4 text-base leading-8 text-textGray">
                Students move from project selection to GitHub proof and verified certificates with a clear completion system.
              </p>
            </div>

            <div className="grid sm:grid-cols-2">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`group border-borderSoft p-6 transition duration-300 hover:bg-bgBody sm:p-8 ${
                    idx > 0 ? "border-t" : ""
                  } ${idx === 1 ? "sm:border-l sm:border-t-0" : ""} ${idx === 3 ? "sm:border-l" : ""}`}
                >
                  <p className="text-4xl font-black leading-none text-textPrimary transition group-hover:scale-[1.03] sm:text-5xl">
                    {stat.display}
                  </p>
                  <p className="mt-4 text-base font-black text-textPrimary">{stat.label}</p>
                  <p className="mt-2 text-sm leading-6 text-textGray">{stat.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
