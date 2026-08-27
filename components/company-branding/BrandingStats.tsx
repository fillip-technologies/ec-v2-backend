"use client";

import React from "react";

export const BrandingStats: React.FC = () => {
  const stats = [
    { value: "10k+", label: "reachable student and early-career profiles" },
    { value: "12+", label: "domain-based audience communities" },
    { value: "30+", label: "campaign-ready learning and career tracks" },
    { value: "4-layer", label: "LMS, webinar, community, and campus distribution" },
  ];

  return (
    <section className="border-y border-borderLight bg-white py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-borderLight bg-borderLight shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="group bg-white p-6 transition duration-300 hover:bg-bgSoft">
              <span className="mb-5 block h-1 w-10 rounded-full bg-brand/70 transition duration-300 group-hover:w-16" />
              <p className="text-3xl font-black tracking-tight text-textPrimary">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-textGray">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
