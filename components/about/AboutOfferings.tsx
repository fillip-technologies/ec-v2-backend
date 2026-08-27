"use client";

import React from "react";
import { Briefcase, Laptop, BookOpen, Building2, Award, Users } from "lucide-react";

export const AboutOfferings: React.FC = () => {
  const offerings = [
    {
      icon: <Briefcase className="h-5 w-5" />,
      title: "Industry Internships",
      desc: "Structured internship programs across Web Development, Data Science, AI/ML, Cybersecurity, and more — designed to simulate real workplace demands.",
    },
    {
      icon: <Laptop className="h-5 w-5" />,
      title: "Live Project Training",
      desc: "Every track features guided, hands-on projects that mirror real deliverables — not toy exercises. Build portfolios that actually demonstrate skill.",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "Skill-Based Courses",
      desc: "Curated learning tracks in Full-Stack, DevOps, Cloud Computing, Data Analytics, Mobile Development, and emerging tech domains.",
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      title: "College Tie-Ups",
      desc: "We partner with universities and colleges to bring industry-aligned training directly to campus — boosting placement outcomes and student readiness.",
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: "Certifications",
      desc: "Earn verifiable completion certificates upon finishing each track — recognized by our college and industry partners to strengthen your résumé.",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Mentorship & Guidance",
      desc: "Every learner gets access to experienced mentors who provide code reviews, career advice, and real-time feedback throughout their learning journey.",
    },
  ];

  return (
    <section className="bg-bgSoft py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
            What We Offer
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">
            Everything a learner needs to go from classroom to career.
          </h2>
          <p className="mt-4 text-base leading-8 text-textGray">
            We&apos;ve designed each offering around a single goal — turning potential into performance through real execution.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offerings.map((item, idx) => (
            <article
              key={idx}
              className="group rounded-2xl border border-borderLight bg-white p-6 shadow-sm transition hover:border-brand/40 hover:shadow-md"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-white">
                {item.icon}
              </div>
              <h3 className="text-xl font-extrabold text-textPrimary">{item.title}</h3>
              <p className="mt-3 leading-7 text-textGray">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
