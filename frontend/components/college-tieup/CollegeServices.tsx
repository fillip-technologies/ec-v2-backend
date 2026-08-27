"use client";

import React from "react";

export const CollegeServices: React.FC = () => {
  const services = [
    {
      title: "AI-Powered Services",
      copy: "Practical AI capabilities designed to support smarter digital experiences.",
    },
    {
      title: "Automation",
      copy: "Modern workflows that help simplify repetitive processes and operations.",
    },
    {
      title: "Digital Solutions",
      copy: "Future-ready systems that extend the Engineers Clinic ecosystem.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-brandDark py-16 text-white sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(124,92,252,0.14),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(245,200,66,0.08),transparent_26%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="max-w-md">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brandLight">
              Beyond Learning
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Modern services and solutions.
            </h2>

            <p className="mt-4 text-base leading-8 text-bgSoft">
              Alongside internships and practical learning, Engineers Clinic is expanding into AI-powered services, automation, and modern digital solutions.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {services.map((service, idx) => (
              <article
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-brandLight/35 hover:bg-white/[0.1]"
              >
                <div className="mb-5 h-px w-10 bg-gradient-to-r from-secondary to-transparent" />
                <h3 className="text-lg font-extrabold text-white">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-bgSoft">{service.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
