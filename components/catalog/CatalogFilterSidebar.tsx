"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, RotateCcw, Layers, Code, Clock, ShieldCheck, X } from "lucide-react";
import { Cluster, Technology, Topic } from "@/types/catalog";
import { CustomDropdown } from "@/components/shared/CustomDropdown";

interface CatalogFilterSidebarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  clusters: Cluster[];
  selectedClusterId: number | null;
  onClusterSelect: (id: number | null) => void;
  topics: Topic[];
  selectedTopicId: number | null;
  onTopicSelect: (id: number | null) => void;
  technologies: Technology[];
  selectedTechId: number | null;
  onTechSelect: (id: number | null) => void;
  selectedDuration: number | null;
  onDurationSelect: (dur: number | null) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const CatalogFilterSidebar: React.FC<CatalogFilterSidebarProps> = ({
  searchQuery,
  onSearchChange,
  clusters,
  selectedClusterId,
  onClusterSelect,
  topics,
  selectedTopicId,
  onTopicSelect,
  technologies,
  selectedTechId,
  onTechSelect,
  selectedDuration,
  onDurationSelect,
  onClearFilters,
  hasActiveFilters,
}) => {
  const [techSearchQuery, setTechSearchQuery] = useState("");

  const filteredTechnologies = useMemo(() => {
    if (!techSearchQuery.trim()) return technologies;
    const q = techSearchQuery.toLowerCase();
    return technologies.filter(
      (t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
    );
  }, [technologies, techSearchQuery]);

  return (
    <aside className="lg:sticky lg:top-24 static rounded-2xl border border-glassBorder bg-white/95 p-5 shadow-lg backdrop-blur-xl lg:z-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-borderLight/60 pb-3.5">
        <div className="flex items-center gap-2 font-bold text-textPrimary">
          <Filter className="h-4 w-4 text-brand" />
          <span>Filter Catalogue</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => {
              setTechSearchQuery("");
              onClearFilters();
            }}
            className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      {/* Filters Content Area */}
      <div className="mt-4 space-y-5">
        {/* Search Filter Input */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-textMuted">
            Search Programs
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, topic..."
              className="w-full rounded-xl border border-borderLight bg-bgBody pl-9 pr-3.5 py-2 text-xs font-semibold text-textPrimary placeholder-textMuted shadow-xs transition-all focus:border-brand focus:outline-hidden focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>

        {/* Cluster Filter (Scrollable container for multiple clusters) */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-textMuted">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-brand" /> Clusters
            </span>
          </div>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1 [scrollbar-width:thin] scrollbar-thin scrollbar-thumb-borderLight">
            <button
              onClick={() => onClusterSelect(null)}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                selectedClusterId === null
                  ? "bg-brand text-white shadow-sm"
                  : "bg-bgBody text-textSecondary hover:bg-brandSoft hover:text-brand"
              }`}
            >
              <span>All Clusters</span>
            </button>
            {clusters.map((cluster) => (
              <button
                key={cluster.id}
                onClick={() => onClusterSelect(cluster.id)}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-left transition-all cursor-pointer ${
                  selectedClusterId === cluster.id
                    ? "bg-brand text-white shadow-sm"
                    : "bg-bgBody text-textSecondary hover:bg-brandSoft hover:text-brand"
                }`}
              >
                <span className="truncate">{cluster.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Topic Dropdown Filter (Shows up to 15-16 items with calculated scroll) */}
        <div>
          <CustomDropdown
            label="Topic Focus"
            placeholder="All Topics"
            popoverMaxHeight="max-h-[420px]"
            options={[
              { value: "", label: "All Topics" },
              ...topics.map((t) => ({ value: t.id, label: t.name })),
            ]}
            value={selectedTopicId || ""}
            onChange={(val) => onTopicSelect(val ? Number(val) : null)}
          />
        </div>

        {/* Technology Filter Chips with In-Header Search */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-textMuted">
            <span className="flex items-center gap-1.5 shrink-0">
              <Code className="h-3.5 w-3.5 text-brand" /> Technologies
            </span>
            {/* Search field in the rest of the space left */}
            <div className="relative flex-1 max-w-[130px]">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-textMuted pointer-events-none" />
              <input
                type="text"
                value={techSearchQuery}
                onChange={(e) => setTechSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-borderLight bg-bgBody pl-6 pr-5 py-1 text-[11px] font-semibold text-textPrimary placeholder:text-textMuted/70 normal-case shadow-2xs transition-all focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand/20"
              />
              {techSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTechSearchQuery("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary cursor-pointer"
                  aria-label="Clear tech search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 [scrollbar-width:thin] scrollbar-thin scrollbar-thumb-borderLight">
            <button
              onClick={() => onTechSelect(null)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                selectedTechId === null
                  ? "bg-brand text-white shadow-xs"
                  : "bg-bgBody text-textSecondary hover:bg-brandSoft hover:text-brand"
              }`}
            >
              All Tech
            </button>
            {filteredTechnologies.length === 0 ? (
              <span className="text-[11px] font-medium text-textMuted py-1 px-1">
                No matching tech
              </span>
            ) : (
              filteredTechnologies.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => onTechSelect(tech.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    selectedTechId === tech.id
                      ? "bg-brand text-white shadow-xs"
                      : "bg-bgBody text-textSecondary hover:bg-brandSoft hover:text-brand"
                  }`}
                >
                  {tech.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Duration Hours Filter */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-textMuted">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-brand" /> Duration
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[null, 60, 120, 180].map((dur) => (
              <button
                key={dur === null ? "all" : dur}
                onClick={() => onDurationSelect(dur)}
                className={`rounded-lg py-1.5 text-center text-xs font-bold transition-all cursor-pointer ${
                  selectedDuration === dur
                    ? "bg-brand text-white shadow-xs"
                    : "bg-bgBody text-textSecondary hover:bg-brandSoft hover:text-brand"
                }`}
              >
                {dur === null ? "All" : `${dur}+h`}
              </button>
            ))}
          </div>
        </div>

        {/* Reset All Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="w-full rounded-xl border border-borderLight bg-bgBody py-2 text-xs font-bold text-textMuted hover:border-brand hover:text-brand transition-all cursor-pointer"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </aside>
  );
};
