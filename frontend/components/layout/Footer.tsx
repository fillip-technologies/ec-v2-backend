"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getClusters } from "@/lib/api/catalog";
import { FALLBACK_CLUSTERS } from "@/config/catalogFallback";

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "mt-16" }) => {
  const [clusters, setClusters] = useState<any[]>(FALLBACK_CLUSTERS);

  useEffect(() => {
    getClusters()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setClusters(data);
        }
      })
      .catch((err) => console.warn("Using fallback clusters in footer:", err));
  }, []);

  const mainLinks = [
    { label: "Home", href: "/" },
    { label: "Academic Catalog", href: "/catalog" },
    { label: "College Tie-ups", href: "/college-tieup" },
    { label: "Company Branding", href: "/company-branding" },
    { label: "About Us", href: "/about" },
    { label: "Portal Login", href: "/login" },
  ];

  return (
    <footer className={`bg-surfaceDark text-white ${className}`}>
      <div className="container-main py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr_0.9fr]">
          {/* Column 1: Brand & Contact Info */}
          <div>
            <Image
              src="/images/Engineers-clinics.png"
              alt="Engineers Clinic"
              width={200}
              height={48}
              className="h-12 w-auto object-contain"
            />

            <p className="mt-5 max-w-sm text-sm leading-7 text-bgSoft/80">
              The project-based internship operating system for engineering learners, accredited universities, and recruiter verification.
            </p>

            <div className="mt-6 space-y-3 text-sm text-bgSoft/75">
              <a
                href="mailto:info@engineersclinic.com"
                className="flex items-start gap-3 transition hover:text-secondary"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                <span className="break-all">info@engineersclinic.com</span>
              </a>
              <a
                href="tel:+917545999990"
                className="flex items-start gap-3 transition hover:text-secondary"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                <span>+91-75459-99990</span>
              </a>
              <a
                href="tel:+917979030298"
                className="flex items-start gap-3 transition hover:text-secondary"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                <span>+91-79790-30298</span>
              </a>
            </div>

            <div className="mt-8">
              <h3 className="text-xs font-black uppercase tracking-[0.16em] text-brandLight">
                Our Verticals
              </h3>
              <div className="mt-4 space-y-2 text-sm text-bgSoft/75">
                <a
                  href="https://fillipskillacademy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 transition hover:text-secondary"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                  <span>Fillip Skill Academy</span>
                </a>
                <a
                  href="https://filliptechnologies.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 transition hover:text-secondary"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                  <span>Fillip Technologies</span>
                </a>
                <a
                  href="https://technosysmanagement.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 transition hover:text-secondary"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                  <span>Technosys Management</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Dynamic Academic Clusters & Topics Grid */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-brandLight">
              Academic Clusters & Tracks
            </h3>

            <div className="mt-5 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {clusters.slice(0, 3).map((cluster) => {
                const topicList = cluster.topics || [];

                return (
                  <div key={cluster.id || cluster.slug}>
                    <p className="text-sm font-bold text-white line-clamp-1">{cluster.name}</p>
                    <div className="mt-3 space-y-2">
                      {topicList.slice(0, 5).map((topic: any) => (
                        <Link
                          key={topic.id || topic.slug}
                          href={`/catalog`}
                          className="block text-xs leading-5 text-bgSoft/75 transition hover:text-secondary"
                        >
                          {topic.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-bgSoft/70">
              <span>Industry-Standard Practical Curriculums</span>
              <Link href="/catalog" className="text-brandLight hover:underline font-bold">
                View All Clusters →
              </Link>
            </div>
          </div>

          {/* Column 3: Quick Links & Legal */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-brandLight">
              Platform Navigation
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-bgSoft/75">
              {mainLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-secondary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-bgSoft/70 space-y-1.5">
              <div className="font-bold text-white">Institutional B2B Inquiries</div>
              <p className="text-[11px] leading-relaxed">
                Empower your campus cohort with bulk seat coupon allocations and real-time completion telemetry.
              </p>
              <Link href="/college-tieup" className="inline-block pt-1 text-brandLight font-extrabold hover:underline">
                Partner with Us →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-bgSoft/60">
          <p>© {new Date().getFullYear()} Engineers Clinic. All rights reserved.</p>
          <p>ISO-9001:2015 Certified Practical Internship Engine</p>
        </div>
      </div>
    </footer>
  );
};
