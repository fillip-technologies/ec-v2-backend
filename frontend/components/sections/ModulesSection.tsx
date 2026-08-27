"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Code2,
  BrainCircuit,
  Cloud,
  ShieldCheck,
  Cpu,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { getClusters, getPrograms } from "@/lib/api/catalog";
import { FALLBACK_CLUSTERS, FALLBACK_PROGRAMS } from "@/config/catalogFallback";

interface ModulesSectionProps {
  onOpenEnquiry?: (category?: string) => void;
}

export const ModulesSection: React.FC<ModulesSectionProps> = ({ onOpenEnquiry }) => {
  const [clusters, setClusters] = useState<any[]>(FALLBACK_CLUSTERS);
  const [programs, setPrograms] = useState<any[]>(FALLBACK_PROGRAMS);
  const [activeClusterSlug, setActiveClusterSlug] = useState<string>("software-engineering");

  useEffect(() => {
    // Fetch live academic clusters and programs from backend API
    getClusters()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setClusters(data);
          if (!data.some((c) => c.slug === activeClusterSlug)) {
            setActiveClusterSlug(data[0].slug);
          }
        }
      })
      .catch((err) => console.warn("Using fallback clusters:", err));

    getPrograms({ status: "published" })
      .then((progs) => {
        if (Array.isArray(progs) && progs.length > 0) {
          setPrograms(progs);
        }
      })
      .catch((err) => console.warn("Using fallback programs:", err));
  }, []);

  const activeCluster = useMemo(() => {
    return clusters.find((c) => c.slug === activeClusterSlug) || clusters[0] || FALLBACK_CLUSTERS[0];
  }, [clusters, activeClusterSlug]);

  const clusterPrograms = useMemo(() => {
    const topicIds = new Set((activeCluster.topics || []).map((t: any) => t.id || t.slug));
    const apiMatches = programs.filter((p: any) => {
      if (p.clusterSlug === activeClusterSlug) return true;
      if (p.topicId && topicIds.has(p.topicId)) return true;
      if (p.topicSlug && topicIds.has(p.topicSlug)) return true;
      if (p.topic?.cluster?.slug === activeClusterSlug) return true;
      return false;
    });

    const fallbackMatches = FALLBACK_PROGRAMS.filter((p) => p.clusterSlug === activeClusterSlug);

    // Merge and deduplicate by slug so multiple programs always show up per cluster
    const seenSlugs = new Set();
    const combined = [];
    for (const item of [...apiMatches, ...fallbackMatches]) {
      if (!seenSlugs.has(item.slug)) {
        seenSlugs.add(item.slug);
        combined.push(item);
      }
    }
    return combined;
  }, [programs, activeCluster, activeClusterSlug]);

  const getClusterIcon = (slug: string) => {
    switch (slug) {
      case "software-engineering":
        return <Code2 className="h-4 w-4" />;
      case "ai-data-science":
        return <BrainCircuit className="h-4 w-4" />;
      case "cloud-devops":
        return <Cloud className="h-4 w-4" />;
      case "cybersecurity":
        return <ShieldCheck className="h-4 w-4" />;
      case "embedded-iot":
        return <Cpu className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  const handleScroll = (direction: "prev" | "next") => {
    const el = document.getElementById("cluster-program-slider");
    if (el) {
      const scrollAmount = direction === "next" ? 400 : -400;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id="courses" className="relative isolate overflow-hidden bg-bgBody py-16 sm:py-20 lg:py-24">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-brand/6 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-brandLight/8 blur-3xl" />
      </div>

      <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-borderSoft bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand shadow-xs">
            <Layers className="h-3.5 w-3.5" />
            <span>Academic Clusters & Career Tracks</span>
          </span>
          <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-textPrimary sm:text-4xl lg:text-5xl">
            Explore Industry Capstone Tracks by Domain.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-textGray">
            Every track delivers 3 sequential milestone capstones, GitHub repository verification, automated BullMQ AI rubric grading, and ISO-standard verifiable certificates.
          </p>
        </div>

        {/* Clean Wrapping Cluster Tabs Bar (No cutoffs, no scrollbar) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 w-full max-w-5xl mx-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {clusters.map((c: any) => {
            const isActive = c.slug === activeClusterSlug;
            const icon = getClusterIcon(c.slug);

            return (
              <button
                key={c.slug || c.id}
                type="button"
                onClick={() => setActiveClusterSlug(c.slug)}
                className={`group inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-brand text-white shadow-md shadow-brand/20 scale-[1.02]"
                    : "border border-borderLight bg-white text-textSecondary hover:border-brand/40 hover:text-textPrimary hover:bg-surface"
                }`}
              >
                <span className={isActive ? "text-white" : "text-brand"}>{icon}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Active Cluster Display Card */}
        <div className="mt-6 rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-xs">
          {/* Active Cluster Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderLight pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Selected Domain Cluster</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-textPrimary tracking-tight">
                {activeCluster.name}
              </h3>
              <p className="text-xs text-textGray max-w-2xl leading-relaxed">
                {activeCluster.description || "Comprehensive hands-on curriculum engineered for campus learners and working professionals."}
              </p>
            </div>

            {/* Slider Controls (Shown when carousel is scrollable on desktop/mobile) */}
            {clusterPrograms.length > (clusterPrograms.length <= 3 ? 1 : 3) && (
              <div className={`items-center gap-2 self-start sm:self-center shrink-0 ${clusterPrograms.length <= 3 ? 'flex lg:hidden' : 'flex'}`}>
                <button
                  type="button"
                  onClick={() => handleScroll("prev")}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-borderLight bg-bgSoft/60 text-textPrimary hover:bg-borderLight hover:text-brand transition cursor-pointer shadow-2xs"
                  aria-label="Previous Track"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll("next")}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-borderLight bg-bgSoft/60 text-textPrimary hover:bg-borderLight hover:text-brand transition cursor-pointer shadow-2xs"
                  aria-label="Next Track"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Program Cards Grid / Carousel (Zero scrollbar clutter & Zero horizontal bleed) */}
          {clusterPrograms.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-bgSoft text-textMuted flex items-center justify-center mx-auto">
                <Layers className="h-6 w-6" />
              </div>
              <h4 className="text-base font-black text-textPrimary">Tracks Coming Soon</h4>
              <p className="text-xs text-textMuted max-w-sm mx-auto">
                Curriculum tracks for this engineering cluster are currently in final development.
              </p>
            </div>
          ) : (
            <div
              id="cluster-program-slider"
              className={`mt-4 pt-3.5 pb-3.5 px-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                clusterPrograms.length <= 3
                  ? "flex lg:grid lg:grid-cols-3 gap-6 overflow-x-auto lg:overflow-visible"
                  : "flex gap-6 overflow-x-auto"
              }`}
            >
              {clusterPrograms.map((prog: any) => {
                const defaultPricing = prog.pricings?.[0] || { currency: "INR", amount: 4999 };
                const techList = prog.technologies || [];
                const hours = prog.durationHours || 120;

                return (
                  <article
                    key={prog.id || prog.slug}
                    className={`group relative flex snap-start flex-col justify-between overflow-hidden rounded-[24px] border border-borderLight bg-bgSoft/30 p-6 shadow-2xs transition-all duration-300 hover:border-brand hover:bg-white hover:shadow-md hover:-translate-y-1.5 ${
                      clusterPrograms.length <= 3
                        ? "w-[300px] sm:w-[340px] md:w-[360px] lg:w-full shrink-0 lg:shrink"
                        : "w-[300px] sm:w-[340px] md:w-[360px] lg:w-[calc((100%-3rem)/3)] shrink-0"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-[11px] font-black text-brand border border-brand/20">
                          <Clock className="h-3 w-3" />
                          <span>{hours} Hours Curriculum</span>
                        </span>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 border border-emerald-200">
                          3 Capstones
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-textPrimary leading-snug group-hover:text-brand transition-colors line-clamp-2">
                          {prog.title}
                        </h4>
                        <p className="mt-2 text-xs text-textGray leading-relaxed line-clamp-3">
                          {prog.description || prog.outcomes}
                        </p>
                      </div>

                      {/* Tech Chips */}
                      {techList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {techList.slice(0, 4).map((tech: any, tIdx: number) => (
                            <span
                              key={tIdx}
                              className="rounded-lg border border-borderLight bg-white px-2.5 py-1 text-[10px] font-bold text-textPrimary shadow-2xs"
                            >
                              {typeof tech === "string" ? tech : tech.name}
                            </span>
                          ))}
                          {techList.length > 4 && (
                            <span className="rounded-lg bg-borderLight/60 px-2 py-1 text-[10px] font-bold text-textMuted">
                              +{techList.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Platform Guarantee Checkpoints */}
                      <div className="space-y-2 border-t border-borderLight/80 pt-3 text-[11px] font-bold text-textMuted">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>Milestone Task Board & GitHub Tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>Automated BullMQ AI Code Grading</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Pricing & CTA */}
                    <div className="mt-6 flex items-center justify-between border-t border-borderLight pt-4">
                      <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-textMuted">
                          Enrollment Fee
                        </div>
                        <div className="text-xl font-black text-textPrimary">
                          ₹{defaultPricing.amount.toLocaleString("en-IN")}
                        </div>
                      </div>

                      <Link
                        href={`/catalog/${prog.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-black text-white shadow-xs transition duration-200 hover:bg-brandHover hover:translate-x-0.5 cursor-pointer"
                      >
                        <span>Explore Track</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
