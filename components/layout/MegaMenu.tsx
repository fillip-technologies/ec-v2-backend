"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Layers, BookOpen, Globe, Clock, ArrowRight } from "lucide-react";
import { getFlagEmoji, getCurrencySymbol } from "@/lib/utils/currency";
import { getClusters, getTopics, getCountries } from "@/lib/api/catalog";
import { Cluster, Country, Topic } from "@/types/catalog";
import navConfig from "@/config/navigationData.json";

interface MegaMenuProps {
  mobile?: boolean;
  onSelect?: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ mobile = false, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  // Fetch live clusters, topics, and countries from backend API on mount
  useEffect(() => {
    Promise.all([getClusters(), getTopics(), getCountries()]).then(
      ([clustersData, topicsData, countriesData]) => {
        setClusters(clustersData.length > 0 ? clustersData : (navConfig.fallbackClusters as any));
        setTopics(topicsData.length > 0 ? topicsData : (navConfig.fallbackTopics as any));
        setCountries(countriesData.length > 0 ? countriesData : (navConfig.fallbackCountries as any));
      }
    );
  }, []);

  const durations = navConfig.durations;

  if (mobile) {
    return (
      <div className="space-y-6 p-2">
        {/* By Cluster */}
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-brand mb-2 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> By Cluster
          </p>
          <div className="space-y-1 pl-2 border-l-2 border-brand/20">
            {clusters.slice(0, 6).map((cl) => (
              <Link
                key={cl.id}
                href={`/catalog?clusterId=${cl.id}`}
                onClick={onSelect}
                className="block py-1 text-xs font-semibold text-textSecondary hover:text-brand"
              >
                • {cl.name}
              </Link>
            ))}
          </div>
        </div>

        {/* By Topic */}
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-brand mb-2 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> By Topic
          </p>
          <div className="space-y-1 pl-2 border-l-2 border-brand/20">
            {topics.slice(0, 6).map((t) => (
              <Link
                key={t.id}
                href={`/catalog?topicId=${t.id}`}
                onClick={onSelect}
                className="block py-1 text-xs font-semibold text-textSecondary hover:text-brand"
              >
                • {t.name}
              </Link>
            ))}
            {topics.length > 6 && (
              <Link href="/catalog" onClick={onSelect} className="block pt-1 text-xs font-bold text-brand underline">
                All Topics →
              </Link>
            )}
          </div>
        </div>

        {/* By Country */}
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-brand mb-2 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" /> By Country
          </p>
          <div className="space-y-1 pl-2 border-l-2 border-brand/20">
            {countries.slice(0, 6).map((c) => (
              <Link
                key={c.isoCode}
                href={`/catalog?countryCode=${c.isoCode}`}
                onClick={onSelect}
                className="block py-1 text-xs font-semibold text-textSecondary hover:text-brand"
              >
                {getFlagEmoji(c.isoCode)} {c.name} ({c.currencyCode})
              </Link>
            ))}
          </div>
        </div>

        {/* By Duration */}
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-brand mb-2 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> By Duration
          </p>
          <div className="space-y-1 pl-2 border-l-2 border-brand/20">
            {durations.map((d) => (
              <Link
                key={d.hours}
                href={`/catalog?durationHours=${d.hours}`}
                onClick={onSelect}
                className="block py-1 text-xs font-semibold text-textSecondary hover:text-brand"
              >
                ⏱️ {d.hours}+ Hours
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`nav-link flex items-center gap-1 cursor-pointer ${open ? "nav-link-active" : ""}`}
      >
        <span>Internships</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            open ? "rotate-180 text-white" : "text-current"
          }`}
        />
      </button>

      {open && (
        <>
          {/* Backdrop to close menu on outside click */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Desktop MegaMenu Panel (100% Solid Opacity) */}
          <div className="fixed left-1/2 top-20 z-50 w-[min(1140px,calc(100vw-2rem))] -translate-x-1/2 rounded-[28px] border border-borderLight bg-white p-6 shadow-[0_24px_70px_rgba(22,8,64,0.14)]">
            <div className="grid grid-cols-4 gap-5">
              {/* Column 1: By Cluster */}
              <div className="rounded-[20px] border border-borderLight/60 bg-bgSoft p-4">
                <div className="flex items-center gap-1.5 border-b border-borderLight/70 pb-2 text-xs font-black uppercase tracking-[0.14em] text-brand">
                  <Layers className="h-4 w-4" />
                  <span>By Cluster</span>
                </div>
                <div className="mt-3 space-y-1">
                  {clusters.slice(0, 6).map((cl) => (
                    <Link
                      key={cl.id}
                      href={`/catalog?clusterId=${cl.id}`}
                      onClick={() => setOpen(false)}
                      className="group flex items-center rounded-[14px] px-3 py-2 text-xs font-bold text-textPrimary hover:bg-white hover:text-brand hover:shadow-xs transition-all"
                    >
                      <span className="line-clamp-1">{cl.name}</span>
                    </Link>
                  ))}
                  {clusters.length > 6 && (
                    <Link
                      href="/catalog"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-1 px-3 pt-2 text-xs font-black text-brand hover:underline"
                    >
                      <span>All Clusters</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Column 2: By Topic */}
              <div className="rounded-[20px] border border-borderLight/60 bg-bgSoft p-4">
                <div className="flex items-center gap-1.5 border-b border-borderLight/70 pb-2 text-xs font-black uppercase tracking-[0.14em] text-brand">
                  <BookOpen className="h-4 w-4" />
                  <span>By Topic</span>
                </div>
                <div className="mt-3 space-y-1">
                  {topics.slice(0, 6).map((t) => (
                    <Link
                      key={t.id}
                      href={`/catalog?topicId=${t.id}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-[14px] px-3 py-2 text-xs font-bold text-textPrimary hover:bg-white hover:text-brand hover:shadow-xs transition-all truncate"
                    >
                      • {t.name}
                    </Link>
                  ))}
                  {topics.length > 6 && (
                    <Link
                      href="/catalog"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-1 px-3 pt-2 text-xs font-black text-brand hover:underline"
                    >
                      <span>All Topics →</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Column 3: By Country */}
              <div className="rounded-[20px] border border-borderLight/60 bg-bgSoft p-4">
                <div className="flex items-center gap-1.5 border-b border-borderLight/70 pb-2 text-xs font-black uppercase tracking-[0.14em] text-brand">
                  <Globe className="h-4 w-4" />
                  <span>By Country</span>
                </div>
                <div className="mt-3 space-y-1">
                  {countries.slice(0, 6).map((c) => (
                    <Link
                      key={c.isoCode}
                      href={`/catalog?countryCode=${c.isoCode}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-[14px] px-3 py-2 text-xs font-bold text-textPrimary hover:bg-white hover:text-brand hover:shadow-xs transition-all"
                    >
                      <span className="text-base">{getFlagEmoji(c.isoCode)}</span>
                      <div className="flex-1 truncate">
                        <div className="truncate">{c.name}</div>
                        <div className="text-[10px] text-textMuted font-semibold">
                          {c.currencyCode} ({getCurrencySymbol(c.currencyCode)})
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Column 4: By Duration */}
              <div className="rounded-[20px] border border-borderLight/60 bg-bgSoft p-4">
                <div className="flex items-center gap-1.5 border-b border-borderLight/70 pb-2 text-xs font-black uppercase tracking-[0.14em] text-brand">
                  <Clock className="h-4 w-4" />
                  <span>By Duration</span>
                </div>
                <div className="mt-3 space-y-2">
                  {durations.map((d) => (
                    <Link
                      key={d.hours}
                      href={`/catalog?durationHours=${d.hours}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-[16px] border border-borderLight/80 bg-white p-3 text-xs font-bold text-textPrimary hover:border-brand hover:shadow-md transition-all"
                    >
                      <div className="text-sm font-black text-brand">{d.hours}+ Hours</div>
                      <div className="text-[10px] text-textMuted font-semibold mt-0.5">{d.label}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Footer CTA Bar */}
            <div className="mt-5 flex items-center justify-between border-t border-borderLight/70 pt-3.5 ">
              <Link
                href="/catalog"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-brandHover transition-all cursor-pointer"
              >
                <span>Explore All Internships</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
