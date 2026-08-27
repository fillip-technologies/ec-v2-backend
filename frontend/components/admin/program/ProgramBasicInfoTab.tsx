'use client';

import React, { useState } from 'react';
import { BookOpen, Layers, Globe, Plus, Trash2 } from 'lucide-react';
import { Country, Cluster, Topic, Technology } from '@/types/catalog';
import { ClusterManager } from './taxonomy/ClusterManager';
import { TopicSelector } from './taxonomy/TopicSelector';
import { TechnologySelector } from './taxonomy/TechnologySelector';
import { CustomDropdown } from '@/components/shared/CustomDropdown';

interface ProgramBasicInfoTabProps {
  title: string;
  setTitle: (title: string) => void;
  slug: string;
  setSlug: (slug: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  outcomes: string;
  setOutcomes: (outcomes: string) => void;
  durationHours: number;
  setDurationHours: (hours: number) => void;
  countryId: number;
  setCountryId: (cId: number) => void;
  status: string;
  setStatus: (status: string) => void;
  countries: Country[];
  clusters: Cluster[];
  setClusters: React.Dispatch<React.SetStateAction<Cluster[]>>;
  topics: Topic[];
  setTopics: React.Dispatch<React.SetStateAction<Topic[]>>;
  technologies: Technology[];
  setTechnologies: React.Dispatch<React.SetStateAction<Technology[]>>;
  selectedTopicIds: number[];
  onToggleTopic: (topicId: number) => void;
  selectedTechnologyIds: number[];
  onToggleTech: (techId: number) => void;
  activeClusterIds: Set<number>;
  pricings: Array<{ countryId: number; currency: string; amount: number }>;
  setPricings: React.Dispatch<React.SetStateAction<Array<{ countryId: number; currency: string; amount: number }>>>;
  isEditMode: boolean;
}

export const ProgramBasicInfoTab: React.FC<ProgramBasicInfoTabProps> = ({
  title,
  setTitle,
  slug,
  setSlug,
  description,
  setDescription,
  outcomes,
  setOutcomes,
  durationHours,
  setDurationHours,
  countryId,
  setCountryId,
  status,
  setStatus,
  countries,
  clusters,
  setClusters,
  topics,
  setTopics,
  technologies,
  setTechnologies,
  selectedTopicIds,
  onToggleTopic,
  selectedTechnologyIds,
  onToggleTech,
  activeClusterIds,
  pricings,
  setPricings,
  isEditMode,
}) => {
  const [showAddClusterModal, setShowAddClusterModal] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditMode) {
      const autoSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setSlug(autoSlug);
    }
  };

  const handleAddPricingRow = () => {
    setPricings((prev) => [...prev, { countryId: 1, currency: 'INR', amount: 4999 }]);
  };

  const handleRemovePricingRow = (index: number) => {
    setPricings((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePricingChange = (index: number, field: string, value: any) => {
    setPricings((prev) => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: value };
      if (field === 'countryId') {
        const found = countries.find((c) => c.id === Number(value));
        if (found) row.currency = found.currencyCode || 'INR';
      }
      updated[index] = row;
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Card 1: Identity */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-borderLight shadow-xs space-y-5">
        <h2 className="text-sm font-black uppercase tracking-wider text-textPrimary flex items-center gap-2 border-b border-borderLight pb-3">
          <BookOpen className="h-4 w-4 text-brand" />
          Program Identity & Metadata
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-extrabold text-textPrimary">Program Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Full Stack Web Engineering (MERN & Next.js)"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-borderLight/80 bg-bgSoft px-4 py-3 text-xs font-bold text-textPrimary outline-none focus:border-brand focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-textPrimary">Program Slug *</label>
            <input
              type="text"
              required
              placeholder="e.g. fullstack-web-engineering-mern-nextjs"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-borderLight/80 bg-bgSoft px-4 py-3 text-xs font-bold text-textPrimary outline-none focus:border-brand focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <CustomDropdown
              label="Target Country"
              value={countryId}
              onChange={(val) => setCountryId(Number(val))}
              options={countries.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.isoCode})`,
              }))}
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-textPrimary">Duration (Hours) *</label>
            <input
              type="number"
              min={1}
              required
              placeholder="e.g. 120"
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="mt-1.5 w-full rounded-2xl border border-borderLight/80 bg-bgSoft px-4 py-3 text-xs font-bold text-textPrimary outline-none focus:border-brand focus:bg-white"
            />
          </div>

          <div>
            <CustomDropdown
              label="Status"
              value={status}
              onChange={(val) => setStatus(val)}
              options={[
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-extrabold text-textPrimary">Program Overview / Description</label>
          <textarea
            rows={4}
            placeholder="Detailed overview of the program, curriculum scope, guided milestone structure, and capstone track objectives..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-borderLight/80 bg-bgSoft p-4 text-xs font-bold text-textPrimary outline-none focus:border-brand focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-extrabold text-textPrimary">Learning Outcomes & Career Deliverables</label>
          <textarea
            rows={3}
            placeholder="Key skills acquired, industry readiness deliverables, portfolio artifacts, and certificate validation credits..."
            value={outcomes}
            onChange={(e) => setOutcomes(e.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-borderLight/80 bg-bgSoft p-4 text-xs font-bold text-textPrimary outline-none focus:border-brand focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Card 2: Taxonomy & Technology Stack */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-borderLight shadow-xs space-y-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-textPrimary flex items-center gap-2 border-b border-borderLight pb-3">
          <Layers className="h-4 w-4 text-brand" />
          Curriculum Taxonomy & Technology Stack
        </h2>

        {/* Clusters Manager */}
        <ClusterManager
          clusters={clusters}
          topics={topics}
          selectedTopicIds={selectedTopicIds}
          onClustersUpdated={setClusters}
        />

        {/* Topics Selector */}
        <TopicSelector
          topics={topics}
          setTopics={setTopics}
          clusters={clusters}
          selectedTopicIds={selectedTopicIds}
          onToggleTopic={onToggleTopic}
          onOpenAddClusterModal={() => setShowAddClusterModal(true)}
        />

        {/* Technologies Selector */}
        <TechnologySelector
          technologies={technologies}
          selectedTechnologyIds={selectedTechnologyIds}
          onToggleTech={onToggleTech}
          onTechnologiesUpdated={setTechnologies}
        />
      </div>

      {/* Card 3: Pricing */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-borderLight shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-borderLight pb-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-textPrimary flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand" />
            Multi-Country Pricing Tier Configuration
          </h2>
          <button
            type="button"
            onClick={handleAddPricingRow}
            className="text-xs font-extrabold text-brand hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Price Option
          </button>
        </div>

        <div className="space-y-3">
          {pricings.map((p, pIdx) => (
            <div
              key={pIdx}
              className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-bgSoft border border-borderLight/60"
            >
              <div className="flex-1 min-w-[200px]">
                <CustomDropdown
                  label="Country"
                  value={p.countryId}
                  onChange={(val) => handlePricingChange(pIdx, 'countryId', Number(val))}
                  options={countries.map((c) => ({
                    value: c.id,
                    label: `${c.name} (${c.currencyCode})`,
                  }))}
                />
              </div>

              <div className="w-28">
                <label className="text-[10px] font-black uppercase tracking-wider text-textMuted block mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  placeholder="e.g. INR"
                  value={p.currency}
                  onChange={(e) => handlePricingChange(pIdx, 'currency', e.target.value)}
                  className="w-full rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-textPrimary border border-borderLight"
                />
              </div>

              <div className="w-36">
                <label className="text-[10px] font-black uppercase tracking-wider text-textMuted block mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 4999"
                  value={p.amount}
                  onChange={(e) => handlePricingChange(pIdx, 'amount', Number(e.target.value))}
                  className="w-full rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-textPrimary border border-borderLight"
                />
              </div>

              {pricings.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemovePricingRow(pIdx)}
                  className="p-2 text-danger hover:text-dangerDark transition-all cursor-pointer self-end mb-1"
                  title="Remove Pricing Row"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
