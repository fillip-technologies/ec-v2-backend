"use client";

import React from "react";
import { MessageSquare, Star, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  authorName: string;
  authorRole?: string;
  quote: string;
  rating?: number;
}

interface ProgramDetailTestimonialsProps {
  testimonials?: Testimonial[];
}

export const ProgramDetailTestimonials: React.FC<ProgramDetailTestimonialsProps> = ({
  testimonials = [],
}) => {
  const defaultTestimonials: Testimonial[] = [
    {
      id: 1,
      authorName: "Aarav Mehta",
      authorRole: "Software Engineer at TCS",
      quote:
        "Extremely practical program! Helped me build production microservices with AI evaluated rubrics and cleared my university internship credits.",
      rating: 5,
    },
    {
      id: 2,
      authorName: "Priya Sharma",
      authorRole: "Full Stack Intern at Infosys",
      quote:
        "The guided IDE workspace and task-level blueprint guides made learning complex backend system design straightforward.",
      rating: 5,
    },
  ];

  const list = testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <section className="rounded-3xl border border-glassBorder bg-white p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-brand">
        <MessageSquare className="h-4 w-4" />
        <span>Student Reviews</span>
      </div>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-textPrimary">
        What engineers say about this program
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {list.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-borderLight/70 bg-bgBody p-5 shadow-2xs"
          >
            <div>
              <Quote className="h-6 w-6 text-brand/30 mb-2" />
              <p className="text-xs font-medium leading-relaxed text-textSecondary italic">
                "{item.quote}"
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-borderLight/60 pt-3">
              <div>
                <h4 className="text-xs font-black text-textPrimary">{item.authorName}</h4>
                {item.authorRole && (
                  <p className="text-[10px] font-semibold text-textMuted">{item.authorRole}</p>
                )}
              </div>

              <div className="flex items-center gap-0.5 text-secondary">
                {Array.from({ length: item.rating || 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
