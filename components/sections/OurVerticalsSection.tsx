"use client";

import React from "react";

export const OurVerticalsSection: React.FC = () => {
  const verticals = [
    "Technosys Management",
    "Fillip Technologies",
    "Redn Technologies",
    "propelxp.com",
  ];

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="container-main">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-brand">
            Our Verticals
          </span>
          <h2 className="mt-3 text-2xl font-black leading-tight text-textPrimary sm:text-3xl">
            Built across focused technology and growth brands.
          </h2>
          <p className="mt-4 text-base leading-7 text-textGray">
            Our ecosystem brings together training, technology, consulting, and product-led learning initiatives.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {verticals.map((vertical, idx) => (
            <div
              key={idx}
              className="flex min-h-28 items-center justify-center rounded-2xl border border-borderSoft bg-bgBody px-5 text-center shadow-[0_12px_32px_rgba(15,10,42,0.05)] transition hover:border-brand"
            >
              <h3 className="text-base font-black leading-6 text-textPrimary">{vertical}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
