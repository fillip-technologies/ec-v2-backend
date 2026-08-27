'use client';

import React from 'react';
import { BookOpen, FolderKanban, MessageSquareQuote, HelpCircle } from 'lucide-react';

interface ProgramNavTabsProps {
  activeTab: 'basic' | 'projects' | 'testimonials' | 'faqs';
  setActiveTab: (tab: 'basic' | 'projects' | 'testimonials' | 'faqs') => void;
  projectsCount: number;
  testimonialsCount: number;
  faqsCount: number;
}

export const ProgramNavTabs: React.FC<ProgramNavTabsProps> = ({
  activeTab,
  setActiveTab,
  projectsCount,
  testimonialsCount,
  faqsCount,
}) => {
  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-borderLight shadow-xs overflow-x-auto">
      <button
        type="button"
        onClick={() => setActiveTab('basic')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
          activeTab === 'basic'
            ? 'bg-brand text-white shadow-xs'
            : 'text-textPrimary hover:bg-bgSoft'
        }`}
      >
        <BookOpen className="h-4 w-4" />
        <span>1. Basic Info & Pricing</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('projects')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
          activeTab === 'projects'
            ? 'bg-brand text-white shadow-xs'
            : 'text-textPrimary hover:bg-bgSoft'
        }`}
      >
        <FolderKanban className="h-4 w-4" />
        <span>2. Projects, Tasks & Rubrics ({projectsCount})</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('testimonials')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
          activeTab === 'testimonials'
            ? 'bg-success text-white shadow-xs'
            : 'text-textPrimary hover:bg-bgSoft'
        }`}
      >
        <MessageSquareQuote className="h-4 w-4" />
        <span>3. Testimonials ({testimonialsCount})</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('faqs')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
          activeTab === 'faqs'
            ? 'bg-warning text-white shadow-xs'
            : 'text-textPrimary hover:bg-bgSoft'
        }`}
      >
        <HelpCircle className="h-4 w-4" />
        <span>4. FAQs ({faqsCount})</span>
      </button>
    </div>
  );
};
