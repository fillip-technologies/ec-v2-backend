"use client";

import React from "react";
import Image from "next/image";

export const ChooseSection: React.FC = () => {
  const testimonials = [
    {
      quote: "The workspace made the project feel clear. I knew exactly what to build, when to submit, and how to improve my GitHub.",
      name: "Shreya",
      role: "Frontend Student",
      avatar: "/images/students/image-8.jpg",
    },
    {
      quote: "Before this, my GitHub was empty. Now I have a reviewed project and a certificate I can confidently add to my resume.",
      name: "Aman Kumar",
      role: "Full Stack Student",
      avatar: "/images/students/image-2.jpg",
    },
    {
      quote: "The milestone tasks helped me stop watching random videos and actually finish a complete project.",
      name: "Sneha Patel",
      role: "UI/UX Student",
      avatar: "/images/students/image-3.jpg",
    },
    {
      quote: "Review feedback was the most useful part. It helped me understand what industry-quality project submission means.",
      name: "Rohit Verma",
      role: "Python Student",
      avatar: "/images/students/image-4.jpg",
    },
    {
      quote: "I used the certificate and GitHub repo in my interview. It gave me something concrete to talk about.",
      name: "Priya Singh",
      role: "Marketing Student",
      avatar: "/images/students/image-5.jpg",
    },
    {
      quote: "The flow is simple: choose, build, push, review, certify. That structure kept me consistent.",
      name: "Arjun Mehta",
      role: "React Student",
      avatar: "/images/students/image-6.jpg",
    },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(124,92,252,0.10),transparent_28%),radial-gradient(circle_at_88%_22%,rgba(167,139,250,0.10),transparent_26%)]" />

      <div className="container-main">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-borderSoft bg-bgBody px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand">
            Testimonials
          </span>
          <h2 className="mt-5 text-3xl font-black leading-tight text-textPrimary sm:text-4xl lg:text-5xl">
            Students feel the difference when learning becomes buildable.
          </h2>
          <p className="mt-5 text-base leading-8 text-textGray">
            Real feedback from students using projects, GitHub submissions, and review-based certification to prove practical skills.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, idx) => (
            <article
              key={idx}
              className="group rounded-[2rem] border border-borderSoft bg-white p-6 shadow-md transition duration-300 hover:scale-[1.02] hover:border-brand hover:bg-surface hover:shadow-xl"
            >
              <div className="flex items-center gap-1 text-secondary">
                {[...Array(5)].map((_, sIdx) => (
                  <span key={sIdx} className="text-sm">★</span>
                ))}
              </div>
              <p className="mt-5 text-base font-medium leading-8 text-textPrimary">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-borderSoft pt-5">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover object-top ring-4 ring-borderSoft"
                />
                <div>
                  <p className="font-black text-textPrimary">{testimonial.name}</p>
                  <p className="text-sm font-bold text-textGray">{testimonial.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
