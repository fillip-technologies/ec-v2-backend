'use client';

import React from 'react';
import { ClipboardList } from 'lucide-react';

export const AdminRubricsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[24px] border border-borderLight shadow-xs">
        <h1 className="text-xl font-black text-textPrimary flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-success" />
          AI Rubrics & Grading Pass Thresholds
        </h1>
        <p className="text-xs text-textMuted mt-1">
          Configure JSON criteria breakdowns, max scores, and passing thresholds (default: 60/100) for automated AI evaluation.
        </p>
      </div>

      <div className="bg-white rounded-[24px] p-6 border border-borderLight shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-borderLight pb-4">
          <div className="text-xs font-black text-textPrimary">Default Rubric Configuration</div>
          <span className="px-3 py-1 rounded-full bg-statusPassedBg text-statusPassedText font-extrabold text-[10px]">
            Pass Threshold: 60/100
          </span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-bgSoft flex justify-between font-extrabold">
            <span>Architecture & Code Quality</span>
            <span>Max Score: 50</span>
          </div>
          <div className="p-3 rounded-xl bg-bgSoft flex justify-between font-extrabold">
            <span>API Specification & Unit Tests</span>
            <span>Max Score: 50</span>
          </div>
        </div>
      </div>
    </div>
  );
};
