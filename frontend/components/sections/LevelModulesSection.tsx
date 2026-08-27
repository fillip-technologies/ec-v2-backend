"use client";

import React, { useState } from "react";
import { Container } from "../ui/Container";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { INTERNSHIP_DATA } from "@/config/internshipTopics";
import { Clock, FolderCheck, Sparkles, ArrowUpRight, Search } from "lucide-react";

interface LevelModulesSectionProps {
  onOpenEnquiry: (category?: string) => void;
}

export const LevelModulesSection: React.FC<LevelModulesSectionProps> = ({ onOpenEnquiry }) => {
  const [activeLevel, setActiveLevel] = useState<string>("Beginner");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const currentLevelData = INTERNSHIP_DATA[activeLevel];
  const categories = currentLevelData.categories;

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      topics: cat.topics.filter((topic) =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) =>
      (selectedCategory === "All" || cat.name === selectedCategory) && cat.topics.length > 0
    );

  const levelConfigs: Record<string, { badge: string; color: string }> = {
    Beginner: { badge: "45 Days • 3 Projects", color: "from-brand to-brandLight" },
    Intermediate: { badge: "75 Days • 6 Projects", color: "from-info to-brand" },
    Advanced: { badge: "90 Days • 9 Projects", color: "from-success to-info" },
  };

  return (
    <section id="courses" className="relative isolate overflow-hidden bg-bgBody py-16 sm:py-20 lg:py-24">
      {/* Background Lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[32rem] w-[32rem] rounded-full bg-brand/8 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-[28rem] w-[28rem] rounded-full bg-success/8 blur-3xl" />
      </div>

      <Container size="wide">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <Badge variant="brand">Level-Based Project Tracks</Badge>
          <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-textPrimary sm:text-4xl lg:text-5xl">
            Pick a project track that matches your level.
          </h2>
          <p className="mt-4 text-base leading-8 text-textGray">
            Every track is designed as a practical build: guided milestones, GitHub submission, AI evaluation, and a verified certificate.
          </p>
        </div>

        {/* Level Tabs Switcher */}
        <div className="mx-auto mb-8 flex max-w-2xl items-center justify-center rounded-3xl border border-borderSoft bg-white p-2 shadow-lg">
          {Object.keys(INTERNSHIP_DATA).map((level) => (
            <button
              key={level}
              onClick={() => {
                setActiveLevel(level);
                setSelectedCategory("All");
              }}
              className={`flex-1 rounded-2xl py-3 text-sm font-black transition duration-300 ${
                activeLevel === level
                  ? "bg-brand text-white shadow-md"
                  : "text-textGray hover:text-brand"
              }`}
            >
              {level} Level
            </button>
          ))}
        </div>

        {/* Level Info Banner */}
        <div className="mb-8 rounded-3xl border border-borderSoft bg-white p-6 shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-brand">
                {activeLevel} Level Internship Policy
              </span>
              <h3 className="mt-1 text-xl font-black text-textPrimary">
                {currentLevelData.projects} ({currentLevelData.duration})
              </h3>
              <p className="mt-1 text-xs text-textGray">{currentLevelData.focus}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-bgSoft px-4 py-2 text-xs font-bold text-brand">
                <Clock className="h-3.5 w-3.5" /> {currentLevelData.duration}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-successLight px-4 py-2 text-xs font-bold text-success">
                <FolderCheck className="h-3.5 w-3.5" /> {currentLevelData.projects}
              </span>
            </div>
          </div>
        </div>

        {/* Category Filters & Search */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                selectedCategory === "All"
                  ? "bg-surfaceDark text-white"
                  : "bg-white border border-borderSoft text-textGray hover:border-brand"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat.name
                    ? "bg-brand text-white"
                    : "bg-white border border-borderSoft text-textGray hover:border-brand"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textGray" />
            <input
              type="text"
              placeholder="Search topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-borderSoft bg-white py-2 pl-10 pr-4 text-xs font-medium text-textPrimary outline-none transition focus:border-brand"
            />
          </div>
        </div>

        {/* Topic Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.flatMap((cat) =>
            cat.topics.map((topic, idx) => (
              <div
                key={`${cat.name}-${topic.slug}`}
                className="group relative flex flex-col justify-between rounded-3xl border border-borderSoft bg-white p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-bgSoft px-3 py-1 text-[11px] font-black text-brand">
                      {cat.name}
                    </span>
                    <span className="text-[11px] font-bold text-textGray">
                      {activeLevel} Track
                    </span>
                  </div>

                  <h4 className="mt-4 text-base font-black leading-snug text-textPrimary group-hover:text-brand">
                    {topic.title}
                  </h4>

                  <div className="mt-4 space-y-2 border-t border-borderSoft pt-3 text-xs text-textGray">
                    <div className="flex items-center justify-between">
                      <span>Requirement:</span>
                      <span className="font-bold text-textPrimary">{currentLevelData.projects}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Evaluation:</span>
                      <span className="font-bold text-success">AI Rubric Scoring</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  icon={<ArrowUpRight className="h-4 w-4" />}
                  onClick={() => onOpenEnquiry(cat.name)}
                  className="mt-6 w-full group-hover:bg-brand group-hover:text-white group-hover:border-brand"
                >
                  Select & Start Project
                </Button>
              </div>
            ))
          )}
        </div>
      </Container>
    </section>
  );
};
