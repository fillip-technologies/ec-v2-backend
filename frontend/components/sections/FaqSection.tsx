"use client";

import React, { useState } from "react";
import { Container } from "../ui/Container";
import { Badge } from "../ui/Badge";
import { Plus, Minus } from "lucide-react";

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is Engineers Clinic a video tutorial website?",
      a: "No. Engineers Clinic is an experiential internship operating system. Students enroll in industry career tracks across 5 academic clusters, complete 3 sequential production capstones in a personal cloud workspace, submit code via GitHub, and receive automated BullMQ AI rubric evaluations.",
    },
    {
      q: "What is included in an Academic Career Track?",
      a: "Each track contains 3 structured capstone projects divided into step-by-step milestone tasks, comprehensive technical documentation, test suites, architecture diagrams, and submission gateways.",
    },
    {
      q: "How does the AI Rubric Evaluation work?",
      a: "When you push your code commits and submit a milestone deliverable, our BullMQ background worker evaluates your repository against a 100-point rubric assessing architecture (30 pts), functionality (30 pts), code cleanliness (20 pts), and security/performance (20 pts).",
    },
    {
      q: "Is this compliant with university academic internship requirements?",
      a: "Yes. Our practical curriculum and structured evaluation logs meet mandatory academic internship credit criteria for engineering colleges and accredited universities.",
    },
    {
      q: "How do recruiters verify my certificate?",
      a: "Every certificate features a tamper-proof QR code that resolves to a public verification URL on engineersclinic.com, displaying the student's name, enrolled program, completion timestamp, and AI evaluation rubrics.",
    },
    {
      q: "Can colleges partner with Engineers Clinic for bulk student cohorts?",
      a: "Yes. Our B2B Institutional Portal allows partner colleges to purchase seat coupon batches, track student completion rates in real-time, and download cohort performance audits.",
    },
  ];

  return (
    <section id="faq" className="relative isolate overflow-hidden bg-bgBody py-16 sm:py-20 lg:py-24">
      <Container size="narrow">
        <div className="mb-10 text-center">
          <Badge variant="brand">Frequently Asked Questions</Badge>
          <h2 className="mt-5 text-3xl font-black leading-tight text-textPrimary sm:text-4xl lg:text-5xl">
            Questions students and educators ask.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="overflow-hidden rounded-3xl border border-borderSoft bg-white shadow-sm transition duration-300 hover:border-brand"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6 cursor-pointer"
                >
                  <span className="text-base font-black text-textPrimary sm:text-lg">{faq.q}</span>
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition duration-300 ${
                      isOpen ? "bg-brand text-white rotate-180" : "bg-bgSoft text-brand"
                    }`}
                  >
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-borderSoft px-5 pb-6 pt-4 text-sm leading-7 text-textGray sm:px-6">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
