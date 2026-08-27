"use client";

import React, { useState, useEffect } from "react";
import { Country, Program } from "@/types/catalog";
import { ProgramDetailHero } from "./ProgramDetailHero";
import { ProgramDetailOverview } from "./ProgramDetailOverview";
import { ProgramDetailProjects } from "./ProgramDetailProjects";
import { ProgramDetailTestimonials } from "./ProgramDetailTestimonials";
import { ProgramDetailFaq } from "./ProgramDetailFaq";
import { ProgramDetailSidebar } from "./ProgramDetailSidebar";
import { detectUserCurrency } from "@/lib/utils/currency";
import { BookOpen, FolderGit2, MessageSquare, HelpCircle } from "lucide-react";

interface ProgramDetailClientProps {
  program: Program;
  countries: Country[];
}

export const ProgramDetailClient: React.FC<ProgramDetailClientProps> = ({
  program,
  countries,
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("IN");
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "testimonials" | "faq">(
    "overview"
  );

  // Auto-detect visitor location on page load via Geolocation IP API (filtered to priced countries)
  useEffect(() => {
    const pricedCountries = countries.filter((country) =>
      program.pricings?.some(
        (p) =>
          p.countryId === country.id ||
          p.currency?.toUpperCase() === country.currencyCode?.toUpperCase(),
      ),
    );

    detectUserCurrency().then((info) => {
      if (info.countryCode) {
        const matched = pricedCountries.find(
          (c) => c.isoCode.toUpperCase() === info.countryCode.toUpperCase(),
        );
        if (matched) {
          setSelectedCountryCode(matched.isoCode);
          return;
        }
      }

      // Default to first priced country (e.g. IN or first configured pricing)
      if (pricedCountries.length > 0 && !pricedCountries.some((c) => c.isoCode.toUpperCase() === 'IN')) {
        setSelectedCountryCode(pricedCountries[0].isoCode);
      }
    });
  }, [countries, program.pricings]);

  return (
    <main className="min-h-screen bg-bgBody text-textPrimary">
      {/* Program Detail Hero Banner */}
      <ProgramDetailHero program={program} />

      {/* Main Content Layout with Sticky Sub-Nav & Sidebar */}
      <div className="container-main py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px] items-start">
          {/* Main Left Content Area */}
          <div className="space-y-6">
            {/* Sticky Navigation Sub-Header Tabs */}
            <div className="sticky top-20 z-30 flex items-center gap-2 overflow-x-auto rounded-2xl border border-glassBorder bg-white/90 p-2 shadow-sm backdrop-blur-xl">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-brand text-white shadow-xs"
                    : "text-textSecondary hover:bg-brandSoft hover:text-brand"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab("projects")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  activeTab === "projects"
                    ? "bg-brand text-white shadow-xs"
                    : "text-textSecondary hover:bg-brandSoft hover:text-brand"
                }`}
              >
                <FolderGit2 className="h-3.5 w-3.5" />
                <span>Projects ({program.projects?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab("testimonials")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  activeTab === "testimonials"
                    ? "bg-brand text-white shadow-xs"
                    : "text-textSecondary hover:bg-brandSoft hover:text-brand"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Reviews</span>
              </button>

              <button
                onClick={() => setActiveTab("faq")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  activeTab === "faq"
                    ? "bg-brand text-white shadow-xs"
                    : "text-textSecondary hover:bg-brandSoft hover:text-brand"
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>FAQs</span>
              </button>
            </div>

            {/* Tab Sections */}
            {activeTab === "overview" && <ProgramDetailOverview program={program} />}
            {activeTab === "projects" && <ProgramDetailProjects projects={program.projects} />}
            {activeTab === "testimonials" && (
              <ProgramDetailTestimonials testimonials={(program as any).testimonials} />
            )}
            {activeTab === "faq" && <ProgramDetailFaq faqs={(program as any).faqs} />}
          </div>

          {/* Right Sticky Enrollment Sidebar */}
          <ProgramDetailSidebar
            program={program}
            countries={countries}
            selectedCountryCode={selectedCountryCode}
            onCountryChange={setSelectedCountryCode}
          />
        </div>
      </div>
    </main>
  );
};
