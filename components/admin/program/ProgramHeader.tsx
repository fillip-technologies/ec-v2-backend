'use client';

import React from 'react';
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';

interface ProgramHeaderProps {
  isEditMode: boolean;
  programId?: number;
  title: string;
  slug: string;
  loading: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProgramHeader: React.FC<ProgramHeaderProps> = ({
  isEditMode,
  programId,
  title,
  slug,
  loading,
  onBack,
  onSubmit,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-borderLight shadow-xs">
      <div>
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand hover:underline mb-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Programs Management
        </button>
        <h1 className="text-xl font-black text-textPrimary flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-brand" />
          {isEditMode ? 'Edit Internship Program & Curricula' : 'Author Full Internship Program & Curricula'}
        </h1>
        <p className="text-xs text-textMuted mt-1">
          {isEditMode
            ? `Updating program #${programId} (${title || slug || 'Draft'}) details, pricing, projects, tasks, rubrics, and social proof.`
            : 'Configure metadata, pricing tiers, capstone projects, workspace task templates, evaluation rubrics, testimonials, and FAQs.'}
        </p>
      </div>
    </div>
  );
};
