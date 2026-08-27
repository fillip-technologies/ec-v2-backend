'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, Globe, Cpu, Layers, DollarSign, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Country, Technology, Topic } from '@/types/catalog';
import { getCountries, getTopics, getTechnologies, createProgram } from '@/lib/api/catalog';
import { CustomDropdown } from '@/components/shared/CustomDropdown';

interface CreateProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProgramModal: React.FC<CreateProgramModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [durationHours, setDurationHours] = useState<number>(120);
  const [countryId, setCountryId] = useState<number>(1);
  const [status, setStatus] = useState<string>('published');

  // Selected Associations
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [selectedTechnologyIds, setSelectedTechnologyIds] = useState<number[]>([]);

  // Pricing Options
  const [pricings, setPricings] = useState<Array<{ countryId: number; currency: string; amount: number }>>([
    { countryId: 1, currency: 'INR', amount: 4999 },
  ]);

  useEffect(() => {
    if (isOpen) {
      getCountries().then((c) => {
        if (Array.isArray(c) && c.length > 0) {
          setCountries(c);
          setCountryId(c[0].id);
        }
      });

      getTopics().then((t) => {
        if (Array.isArray(t)) setTopics(t);
      });

      getTechnologies().then((tech) => {
        if (Array.isArray(tech)) setTechnologies(tech);
      });
    }
  }, [isOpen]);

  // Auto generate slug from title if user hasn't manually customized it
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(autoSlug);
  };

  const handleToggleTopic = (tId: number) => {
    setSelectedTopicIds((prev) =>
      prev.includes(tId) ? prev.filter((id) => id !== tId) : [...prev, tId]
    );
  };

  const handleToggleTech = (techId: number) => {
    setSelectedTechnologyIds((prev) =>
      prev.includes(techId) ? prev.filter((id) => id !== techId) : [...prev, techId]
    );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !slug.trim()) {
      setErrorMessage('Program Title and Slug are required.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        countryId: Number(countryId),
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        outcomes: outcomes.trim() || undefined,
        durationHours: Number(durationHours),
        status,
        topicIds: selectedTopicIds,
        technologyIds: selectedTechnologyIds,
        pricings: pricings.map((p) => ({
          countryId: Number(p.countryId),
          currency: p.currency,
          amount: Number(p.amount),
          isActive: true,
        })),
      };

      await createProgram(payload);
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Failed to create program');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 selection:bg-brand selection:text-white overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-[2.5rem] bg-white border border-borderLight p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-borderLight pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-black uppercase tracking-wider mb-1">
              Catalogue Authoring
            </div>
            <h2 className="text-xl font-black text-textPrimary flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-brand" />
              Create New Internship Program
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-textMuted hover:bg-bgSoft hover:text-textPrimary transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Metadata */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-textMuted flex items-center gap-1.5">
              1. Basic Metadata & Duration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-textPrimary">Program Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Web Engineering"
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
                  placeholder="fullstack-web-engineering"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-borderLight/80 bg-bgSoft px-4 py-3 text-xs font-bold text-textPrimary outline-none focus:border-brand focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <CustomDropdown
                  label="Target Country"
                  options={countries.map((c) => ({
                    value: c.id,
                    label: `${c.name} (${c.isoCode})`,
                  }))}
                  value={countryId}
                  onChange={(val) => setCountryId(Number(val))}
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-textPrimary">Duration (Hours) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-2xl border border-borderLight/80 bg-bgSoft px-4 py-3 text-xs font-bold text-textPrimary outline-none focus:border-brand focus:bg-white"
                />
              </div>

              <div>
                <CustomDropdown
                  label="Status"
                  options={[
                    { value: "published", label: "Published" },
                    { value: "draft", label: "Draft" },
                    { value: "archived", label: "Archived" },
                  ]}
                  value={status}
                  onChange={(val) => setStatus(val)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-textPrimary">Description</label>
              <textarea
                rows={3}
                placeholder="Overview of the program, curriculum scope, and capstone track objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-borderLight/80 bg-bgSoft p-4 text-xs font-bold text-textPrimary outline-none focus:border-brand focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-textPrimary">Learning Outcomes</label>
              <textarea
                rows={2}
                placeholder="Key skills acquired, industry readiness deliverables, portfolio artifacts..."
                value={outcomes}
                onChange={(e) => setOutcomes(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-borderLight/80 bg-bgSoft p-4 text-xs font-bold text-textPrimary outline-none focus:border-brand focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Section 2: Taxonomy Associations (Topics & Technologies) */}
          <div className="space-y-4 pt-4 border-t border-borderLight">
            <h3 className="text-xs font-black uppercase tracking-wider text-textMuted flex items-center gap-1.5">
              2. Taxonomy & Tech Stack
            </h3>

            <div>
              <label className="text-xs font-extrabold text-textPrimary block mb-2">Select Topics</label>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-3 rounded-2xl bg-bgSoft border border-borderLight/60">
                {topics.map((t) => {
                  const isSelected = selectedTopicIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleToggleTopic(t.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand text-white shadow-xs'
                          : 'bg-white text-textPrimary hover:bg-borderLight'
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-textPrimary block mb-2">Select Technologies</label>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-3 rounded-2xl bg-bgSoft border border-borderLight/60">
                {technologies.map((tech) => {
                  const isSelected = selectedTechnologyIds.includes(tech.id);
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => handleToggleTech(tech.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand text-white shadow-xs'
                          : 'bg-white text-textPrimary hover:bg-borderLight'
                      }`}
                    >
                      {tech.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Pricing Tier Configurator */}
          <div className="space-y-4 pt-4 border-t border-borderLight">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-textMuted flex items-center gap-1.5">
                3. Multi-Country Pricing Tiers
              </h3>
              <button
                type="button"
                onClick={handleAddPricingRow}
                className="text-xs font-extrabold text-brand hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Price Option
              </button>
            </div>

            <div className="space-y-3">
              {pricings.map((p, pIdx) => (
                <div
                  key={pIdx}
                  className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-bgSoft border border-borderLight/60"
                >
                  <div className="flex-1 min-w-[160px]">
                    <CustomDropdown
                      value={p.countryId}
                      onChange={(val) => handlePricingChange(pIdx, 'countryId', Number(val))}
                      options={countries.map((c) => ({
                        value: c.id,
                        label: `${c.name} (${c.currencyCode})`,
                      }))}
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="text"
                      placeholder="Currency"
                      value={p.currency}
                      onChange={(e) => handlePricingChange(pIdx, 'currency', e.target.value)}
                      className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-textPrimary border border-borderLight"
                    />
                  </div>

                  <div className="w-32">
                    <input
                      type="number"
                      min={0}
                      placeholder="Amount"
                      value={p.amount}
                      onChange={(e) => handlePricingChange(pIdx, 'amount', Number(e.target.value))}
                      className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-textPrimary border border-borderLight"
                    />
                  </div>

                  {pricings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePricingRow(pIdx)}
                      className="p-2 text-red-500 hover:text-red-700 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-borderLight flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-bgSoft text-textPrimary font-extrabold text-xs hover:bg-borderLight transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-textPrimary via-gray-900 to-brand text-white font-black text-xs shadow-md transition hover:scale-[1.01] cursor-pointer disabled:opacity-70 flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{loading ? 'Creating Program...' : 'Publish Program to Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
