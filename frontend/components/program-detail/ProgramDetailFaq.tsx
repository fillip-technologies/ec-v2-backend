"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

interface Faq {
  id: number;
  question: string;
  answer: string;
}

interface ProgramDetailFaqProps {
  faqs?: Faq[];
}

export const ProgramDetailFaq: React.FC<ProgramDetailFaqProps> = ({ faqs = [] }) => {
  const [openFaqId, setOpenFaqId] = useState<number | null>(1);

  const defaultFaqs: Faq[] = [
    {
      id: 1,
      question: "Who is eligible for this internship program?",
      answer:
        "Any engineering, computer science, diploma, or technology student enrolled in a recognized university or college is eligible to enroll.",
    },
    {
      id: 2,
      question: "Is this internship certificate verified?",
      answer:
        "Yes, all Engineers Clinic 60h, 120h, and 180h remote internships come with a QR-verifiable certificate of completion.",
    },
    {
      id: 3,
      question: "How does the AI Rubric Evaluation engine work?",
      answer:
        "When you submit tasks inside your workspace, our automated evaluation engine executes static code analysis, unit test suites, and schema validation to give instantaneous feedback.",
    },
  ];

  const list = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <section className="rounded-3xl border border-glassBorder bg-white p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-brand">
        <HelpCircle className="h-4 w-4" />
        <span>Frequently Asked Questions</span>
      </div>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-textPrimary">
        Everything you need to know
      </h2>

      <div className="mt-6 space-y-3">
        {list.map((faq) => {
          const isOpen = openFaqId === faq.id;

          return (
            <div
              key={faq.id}
              className="rounded-2xl border border-borderLight/70 bg-bgBody overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                className="flex w-full items-center justify-between p-4 text-left font-bold text-textPrimary hover:bg-white transition cursor-pointer"
              >
                <span className="text-xs font-black md:text-sm">{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 text-brand shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-borderLight/60 bg-white p-4 text-xs font-medium leading-relaxed text-textMuted md:text-sm">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
