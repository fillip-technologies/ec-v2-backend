'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Country, Technology, Topic, Cluster, ProgramTestimonialForm, ProgramFaqForm } from '@/types/catalog';
import {
  getCountries,
  getTopics,
  getTechnologies,
  getClusters,
  getProgramByIdOrSlug,
  createProgram,
  updateProgram,
} from '@/lib/api/catalog';
import { ProgramHeader } from './program/ProgramHeader';
import { ProgramNavTabs } from './program/ProgramNavTabs';
import { ProgramBasicInfoTab } from './program/ProgramBasicInfoTab';
import { ProgramProjectsTab, ProgramProject } from './program/ProgramProjectsTab';
import { ProgramTestimonialsTab } from './program/ProgramTestimonialsTab';
import { ProgramFaqsTab } from './program/ProgramFaqsTab';

interface AdminCreateProgramViewProps {
  programId?: number;
  onBack: () => void;
  onSuccess: () => void;
}

export const AdminCreateProgramView: React.FC<AdminCreateProgramViewProps> = ({
  programId,
  onBack,
  onSuccess,
}) => {
  const isEditMode = !!programId;
  const [activeTab, setActiveTab] = useState<'basic' | 'projects' | 'testimonials' | 'faqs'>('basic');
  const [countries, setCountries] = useState<Country[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProgram, setFetchingProgram] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields - Basic Metadata
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

  // Projects, Workspace Templates, Tasks, Rubrics & Resources
  const [projects, setProjects] = useState<ProgramProject[]>([
    {
      title: '',
      description: '',
      orderIndex: 0,
      resources: [],
      workspaceTemplate: {
        version: 1,
        isActive: true,
        tasks: [
          {
            title: '',
            description: '',
            orderIndex: 0,
            resources: [],
            rubric: {
              maxScore: 100,
              passThreshold: 60,
              criteria: [
                { criterion: '', maxScore: 50 },
                { criterion: '', maxScore: 50 },
              ],
            },
          },
        ],
      },
    },
  ]);

  // Testimonials
  const [testimonials, setTestimonials] = useState<ProgramTestimonialForm[]>([
    {
      authorName: '',
      authorRole: '',
      quote: '',
      rating: 5,
      avatarUrl: '',
      orderIndex: 0,
    },
  ]);

  // FAQs
  const [faqs, setFaqs] = useState<ProgramFaqForm[]>([
    {
      question: '',
      answer: '',
      orderIndex: 0,
    },
  ]);

  // Derived active clusters based on selected topics
  const activeClusterIds = useMemo(() => {
    const set = new Set<number>();
    topics.forEach((t) => {
      if (selectedTopicIds.includes(t.id) && t.clusterId) {
        set.add(t.clusterId);
      }
    });
    return set;
  }, [topics, selectedTopicIds]);

  // Load taxonomies, clusters, and countries
  useEffect(() => {
    getCountries().then((c) => {
      if (Array.isArray(c) && c.length > 0) {
        setCountries(c);
        if (!isEditMode) setCountryId(c[0].id);
      }
    });

    getClusters().then((cl) => {
      if (Array.isArray(cl) && cl.length > 0) {
        setClusters(cl);
      }
    });

    getTopics().then((t) => {
      if (Array.isArray(t)) setTopics(t);
    });

    getTechnologies().then((tech) => {
      if (Array.isArray(tech)) setTechnologies(tech);
    });
  }, [isEditMode]);

  // Fetch and pre-fill program details in Edit Mode
  useEffect(() => {
    if (!programId) return;

    setFetchingProgram(true);
    getProgramByIdOrSlug(String(programId))
      .then((p) => {
        if (!p) return;

        setTitle(p.title || '');
        setSlug(p.slug || '');
        setDescription(p.description || '');
        setOutcomes(p.outcomes || '');
        setDurationHours(p.durationHours || 120);
        setCountryId(p.countryId || 1);
        setStatus(p.status || 'published');

        if (p.topics && Array.isArray(p.topics)) {
          const tIds = p.topics.map((t: any) => (t.topic?.id || t.topicId)).filter(Boolean);
          setSelectedTopicIds(tIds);
        }

        if (p.technologies && Array.isArray(p.technologies)) {
          const techIds = p.technologies.map((t: any) => (t.technology?.id || t.technologyId)).filter(Boolean);
          setSelectedTechnologyIds(techIds);
        }

        if (p.pricings && Array.isArray(p.pricings) && p.pricings.length > 0) {
          setPricings(
            p.pricings.map((pr: any) => ({
              countryId: pr.countryId || 1,
              currency: pr.currency || 'INR',
              amount: Number(pr.amount) || 0,
            }))
          );
        }

        if (p.testimonials && Array.isArray(p.testimonials) && p.testimonials.length > 0) {
          setTestimonials(
            p.testimonials.map((t: any, idx: number) => ({
              authorName: t.authorName || '',
              authorRole: t.authorRole || '',
              quote: t.quote || '',
              rating: t.rating || 5,
              avatarUrl: t.avatarUrl || '',
              orderIndex: t.orderIndex !== undefined ? t.orderIndex : idx,
            }))
          );
        }

        if (p.faqs && Array.isArray(p.faqs) && p.faqs.length > 0) {
          setFaqs(
            p.faqs.map((f: any, idx: number) => ({
              question: f.question || '',
              answer: f.answer || '',
              orderIndex: f.orderIndex !== undefined ? f.orderIndex : idx,
            }))
          );
        }

        if (p.projects && Array.isArray(p.projects) && p.projects.length > 0) {
          setProjects(
            p.projects.map((proj: any, pIdx: number) => ({
              title: proj.title || '',
              description: proj.description || '',
              orderIndex: proj.orderIndex !== undefined ? proj.orderIndex : pIdx,
              resources: Array.isArray(proj.resources)
                ? proj.resources.map((r: any) => ({
                    type: r.type || 'DOCUMENTATION',
                    title: r.title || '',
                    url: r.url || '',
                  }))
                : [],
              workspaceTemplate: {
                version: proj.workspaceTemplate?.version || 1,
                isActive: proj.workspaceTemplate?.isActive !== undefined ? proj.workspaceTemplate.isActive : true,
                tasks: Array.isArray(proj.workspaceTemplate?.tasks)
                  ? proj.workspaceTemplate.tasks.map((task: any, tIdx: number) => ({
                      title: task.title || '',
                      description: task.description || '',
                      orderIndex: task.orderIndex !== undefined ? task.orderIndex : tIdx,
                      resources: Array.isArray(task.resources)
                        ? task.resources.map((tr: any) => ({
                            type: tr.type || 'LINK',
                            title: tr.title || '',
                            url: tr.url || '',
                          }))
                        : [],
                      rubric: {
                        maxScore: task.rubric?.maxScore || 100,
                        passThreshold: task.rubric?.passThreshold || 60,
                        criteria: Array.isArray(task.rubric?.criteria)
                          ? task.rubric.criteria
                          : typeof task.rubric?.criteria === 'object' && task.rubric?.criteria !== null
                          ? Object.values(task.rubric.criteria)
                          : [
                              { criterion: 'Implementation & Requirements', maxScore: 50 },
                              { criterion: 'Code Quality & Best Practices', maxScore: 50 },
                            ],
                      },
                    }))
                  : [
                      {
                        title: '',
                        description: '',
                        orderIndex: 0,
                        resources: [],
                        rubric: {
                          maxScore: 100,
                          passThreshold: 60,
                          criteria: [{ criterion: '', maxScore: 100 }],
                        },
                      },
                    ],
              },
            }))
          );
        }
      })
      .catch((err) => {
        console.error('Failed to fetch program for editing:', err);
        setErrorMessage('Failed to load program details for editing.');
      })
      .finally(() => {
        setFetchingProgram(false);
      });
  }, [programId]);

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

  // Submit Handler (Supports both Create and Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !slug.trim()) {
      setErrorMessage('Program Title and Slug are required.');
      setActiveTab('basic');
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
        testimonials: testimonials
          .filter((t) => t.authorName && t.authorName.trim() && t.quote && t.quote.trim())
          .map((t, idx) => ({
            authorName: t.authorName.trim(),
            authorRole: (t.authorRole || '').trim() || undefined,
            quote: t.quote.trim(),
            rating: Number(t.rating) || 5,
            avatarUrl: (t.avatarUrl || '').trim() || undefined,
            orderIndex: idx,
            isActive: true,
          })),
        faqs: faqs
          .filter((f) => f.question.trim() && f.answer.trim())
          .map((f, idx) => ({
            question: f.question.trim(),
            answer: f.answer.trim(),
            orderIndex: idx,
            isActive: true,
          })),
        projects: projects
          .filter((proj) => proj.title.trim())
          .map((proj, pIdx) => ({
            title: proj.title.trim(),
            description: proj.description.trim() || undefined,
            orderIndex: pIdx,
            resources: proj.resources
              .filter((r) => r.title.trim() && r.url.trim())
              .map((r) => ({
                type: r.type || 'DOCUMENTATION',
                title: r.title.trim(),
                url: r.url.trim(),
              })),
            workspaceTemplate: {
              version: proj.workspaceTemplate.version || 1,
              isActive: true,
              tasks: proj.workspaceTemplate.tasks
                .filter((task) => task.title.trim())
                .map((task, tIdx) => ({
                  title: task.title.trim(),
                  description: task.description.trim() || undefined,
                  orderIndex: tIdx,
                  rubric: {
                    maxScore: Number(task.rubric.maxScore) || 100,
                    passThreshold: Number(task.rubric.passThreshold) || 60,
                    criteria: task.rubric.criteria.filter((c) => c.criterion.trim()),
                  },
                  resources: task.resources
                    .filter((r) => r.title.trim() && r.url.trim())
                    .map((r) => ({
                      type: r.type || 'LINK',
                      title: r.title.trim(),
                      url: r.url.trim(),
                    })),
                })),
            },
          })),
      };

      if (isEditMode) {
        await updateProgram(programId, payload);
      } else {
        await createProgram(payload);
      }

      setLoading(false);
      onSuccess();
      onBack();
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || (isEditMode ? 'Failed to update program' : 'Failed to create program'));
    }
  };

  if (fetchingProgram) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-[24px] border border-borderLight shadow-xs space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <div className="text-sm font-black text-textPrimary">Loading Program Details for Editing...</div>
        <p className="text-xs text-textMuted">Fetching projects, task workspace templates, rubrics, and testimonials.</p>
      </div>
    );
  }

  const projectsCount = projects.filter((p) => p.title.trim()).length || projects.length;
  const testimonialsCount = testimonials.filter((t) => t.authorName.trim()).length || testimonials.length;
  const faqsCount = faqs.filter((f) => f.question.trim()).length || faqs.length;

  return (
    <div className="space-y-6">
      {/* Pinned Header with Actions */}
      <ProgramHeader
        isEditMode={isEditMode}
        programId={programId}
        title={title}
        slug={slug}
        loading={loading}
        onBack={onBack}
        onSubmit={handleSubmit}
      />

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Navigation Tabs */}
      <ProgramNavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectsCount={projectsCount}
        testimonialsCount={testimonialsCount}
        faqsCount={faqsCount}
      />

      {/* Tab Panels */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'basic' && (
          <ProgramBasicInfoTab
            title={title}
            setTitle={setTitle}
            slug={slug}
            setSlug={setSlug}
            description={description}
            setDescription={setDescription}
            outcomes={outcomes}
            setOutcomes={setOutcomes}
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            countryId={countryId}
            setCountryId={setCountryId}
            status={status}
            setStatus={setStatus}
            countries={countries}
            clusters={clusters}
            setClusters={setClusters}
            topics={topics}
            setTopics={setTopics}
            technologies={technologies}
            setTechnologies={setTechnologies}
            selectedTopicIds={selectedTopicIds}
            onToggleTopic={handleToggleTopic}
            selectedTechnologyIds={selectedTechnologyIds}
            onToggleTech={handleToggleTech}
            activeClusterIds={activeClusterIds}
            pricings={pricings}
            setPricings={setPricings}
            isEditMode={isEditMode}
          />
        )}

        {activeTab === 'projects' && (
          <ProgramProjectsTab
            projects={projects}
            setProjects={setProjects}
          />
        )}

        {activeTab === 'testimonials' && (
          <ProgramTestimonialsTab
            testimonials={testimonials}
            setTestimonials={setTestimonials}
          />
        )}

        {activeTab === 'faqs' && (
          <ProgramFaqsTab
            faqs={faqs}
            setFaqs={setFaqs}
          />
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 bg-white p-6 rounded-[24px] border border-borderLight shadow-xs">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-2xl bg-bgSoft text-textPrimary font-extrabold text-xs hover:bg-borderLight transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-textPrimary via-gray-900 to-brand text-white font-black text-xs shadow-md transition hover:scale-[1.01] cursor-pointer disabled:opacity-70 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{loading ? 'Saving Changes...' : isEditMode ? 'Save & Update Program' : 'Publish Full Program to Catalog'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
