'use client';

import React from 'react';
import { Layers, FolderKanban, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

export const AdminProjectsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[24px] border border-borderLight shadow-xs">
        <h1 className="text-xl font-black text-textPrimary flex items-center gap-2">
          <FolderKanban className="h-6 w-6 text-brand" />
          Capstone Projects & Workspace Templates
        </h1>
        <p className="text-xs text-textMuted mt-1">
          Define workspace steps, deliverable tasks, and reference resources for catalog project pools.
        </p>
      </div>

      <div className="bg-white rounded-[24px] p-8 border border-borderLight text-center space-y-4 shadow-xs">
        <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
          <Layers className="h-6 w-6" />
        </div>
        <h3 className="text-base font-black text-textPrimary">Project Workspace Template Engine</h3>
        <p className="text-xs text-textMuted max-w-md mx-auto">
          All workspace step progression data (Step status, resubmission counts, tasks, and rubrics) is persisted directly in the MySQL database.
        </p>
      </div>
    </div>
  );
};
