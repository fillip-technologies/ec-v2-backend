'use client';

import React, { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { Technology } from '@/types/catalog';
import { createTechnology } from '@/lib/api/catalog';

interface TechnologySelectorProps {
  technologies: Technology[];
  selectedTechnologyIds: number[];
  onToggleTech: (id: number) => void;
  onTechnologiesUpdated: (technologies: Technology[]) => void;
}

export const TechnologySelector: React.FC<TechnologySelectorProps> = ({
  technologies,
  selectedTechnologyIds,
  onToggleTech,
  onTechnologiesUpdated,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTechName, setNewTechName] = useState('');
  const [newTechSlug, setNewTechSlug] = useState('');
  const [creatingTech, setCreatingTech] = useState(false);
  const [techSearch, setTechSearch] = useState('');

  const handleCreateTech = async () => {
    if (!newTechName.trim()) return;
    try {
      setCreatingTech(true);
      const res = await createTechnology({
        name: newTechName.trim(),
        slug:
          newTechSlug.trim() ||
          newTechName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-'),
      });

      const updated = [...technologies, res];
      onTechnologiesUpdated(updated);
      onToggleTech(res.id);
      setNewTechName('');
      setNewTechSlug('');
      setShowAddModal(false);
      setCreatingTech(false);
    } catch (err: any) {
      setCreatingTech(false);
      alert(err.message || 'Failed to create technology');
    }
  };

  const filteredTechnologies = technologies.filter((t) =>
    t.name.toLowerCase().includes(techSearch.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-extrabold text-textPrimary">
            Select Technologies & Frameworks
          </label>
          <span className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-black">
            {selectedTechnologyIds.length} selected
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(!showAddModal)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Technology</span>
        </button>
      </div>

      {/* Technology Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textMuted" />
        <input
          type="text"
          placeholder="Search technologies & frameworks (e.g. Next.js, Docker, Python)..."
          value={techSearch}
          onChange={(e) => setTechSearch(e.target.value)}
          className="w-full rounded-xl bg-bgSoft/70 pl-9 pr-8 py-2 text-xs font-bold text-textPrimary border border-borderLight outline-none focus:border-brand focus:bg-white transition-all"
        />
        {techSearch && (
          <button
            type="button"
            onClick={() => setTechSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary p-0.5 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Inline Add Technology Form */}
      {showAddModal && (
        <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-brand">Create & Link New Technology</span>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-textMuted hover:text-textPrimary cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-textMuted block mb-1">Technology Name *</label>
              <input
                type="text"
                placeholder="e.g. FastAPI / Kubernetes / Next.js 15"
                value={newTechName}
                onChange={(e) => {
                  setNewTechName(e.target.value);
                  setNewTechSlug(
                    e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9\s-]/g, '')
                      .replace(/\s+/g, '-')
                  );
                }}
                className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-textPrimary border border-borderLight"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-textMuted block mb-1">Technology Slug *</label>
              <input
                type="text"
                placeholder="fastapi / kubernetes / nextjs-15"
                value={newTechSlug}
                onChange={(e) => setNewTechSlug(e.target.value)}
                className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-textPrimary border border-borderLight"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 rounded-lg bg-white text-textPrimary text-xs font-bold border border-borderLight cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateTech}
              disabled={creatingTech || !newTechName.trim()}
              className="px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-black hover:bg-brandHover disabled:opacity-50 cursor-pointer"
            >
              {creatingTech ? 'Creating...' : 'Save & Select Technology'}
            </button>
          </div>
        </div>
      )}

      {/* Technology Buttons */}
      <div className="flex flex-wrap gap-2.5 max-h-48 overflow-y-auto p-4 rounded-2xl bg-bgSoft border border-borderLight/60">
        {filteredTechnologies.length === 0 ? (
          <div className="w-full text-center py-4 text-xs font-bold text-textMuted">
            No technologies matching &ldquo;{techSearch}&rdquo;.{' '}
            <button
              type="button"
              onClick={() => {
                setNewTechName(techSearch);
                setNewTechSlug(
                  techSearch
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                );
                setShowAddModal(true);
              }}
              className="text-brand hover:underline font-black ml-1 cursor-pointer"
            >
              + Create &ldquo;{techSearch}&rdquo; now
            </button>
          </div>
        ) : (
          filteredTechnologies.map((tech) => {
            const isSelected = selectedTechnologyIds.includes(tech.id);
            return (
              <button
                key={tech.id}
                type="button"
                onClick={() => onToggleTech(tech.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-white text-textPrimary hover:bg-borderLight border border-borderLight/60'
                }`}
              >
                {tech.name}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
