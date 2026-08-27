"use client";

import React, { useEffect, useRef, useState } from "react";
import { Users, Layers, BadgeCheck, FolderGit2 } from "lucide-react";

export const HeroStatsCounterSection: React.FC = () => {
  const stats = [
    {
      icon: <Users className="h-5 w-5" />,
      value: 6000,
      suffix: "+",
      label: "Learners Enrolled",
      note: "Building verifiable capstones",
    },
    {
      icon: <Layers className="h-5 w-5" />,
      value: 5,
      suffix: " Clusters",
      label: "Engineering Domains",
      note: "Software, AI, Cloud, Cyber, IoT",
    },
    {
      icon: <FolderGit2 className="h-5 w-5" />,
      value: 30,
      suffix: "+",
      label: "Production Projects",
      note: "Step-by-step milestone specs",
    },
    {
      icon: <BadgeCheck className="h-5 w-5" />,
      value: 100,
      suffix: "%",
      label: "AI & QR-Verified",
      note: "Automated BullMQ Rubrics",
    },
  ];

  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef<boolean>(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true;
            const duration = 1200;
            const startTime = performance.now();

            const tick = (now: number) => {
              const progress = Math.min((now - startTime) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setCounts(stats.map((s) => Math.floor(s.value * eased)));

              if (progress < 1) {
                requestAnimationFrame(tick);
              }
            };

            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-bgBody pb-8 pt-0">
      <div className="container-main">
        <div className="grid gap-4 rounded-[2rem] border border-borderSoft bg-white/80 p-4 shadow-lg backdrop-blur-2xl sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="group rounded-[1.5rem] border border-borderSoft bg-gradient-to-br from-white to-bgBody p-5 transition duration-300 hover:scale-[1.02] hover:border-brand hover:bg-surface hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-bgSoft text-xl text-brand transition duration-300 group-hover:scale-105 group-hover:bg-bgSoft group-hover:text-brandHover">
                  {stat.icon}
                </span>
                <span className="rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-black text-success border border-success/20">
                  Verified
                </span>
              </div>
              <p className="mt-5 text-3xl font-black leading-none text-textPrimary">
                <span className="hero-counter">{counts[idx].toLocaleString()}</span>
                {stat.suffix}
              </p>
              <p className="mt-2 text-sm font-black text-textPrimary">{stat.label}</p>
              <p className="mt-1 text-xs leading-5 text-textGray">{stat.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
