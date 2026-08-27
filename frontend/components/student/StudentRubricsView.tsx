'use client';

import React, { useState } from 'react';
import { ShieldCheck, Award, FileText, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface StudentRubricsViewProps {
  rubrics: any[];
}

export const StudentRubricsView: React.FC<StudentRubricsViewProps> = ({ rubrics }) => {
  const [expandedRubricIds, setExpandedRubricIds] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedRubricIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!rubrics || rubrics.length === 0) {
    return (
      <div className="rounded-[28px] border border-borderLight bg-white p-8 text-center space-y-3 shadow-xs">
        <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h3 className="text-base font-black text-textPrimary">AI Evaluation Rubrics</h3>
        <p className="text-xs text-textMuted max-w-md mx-auto">
          All workspace task deliverables are evaluated against strict objective rubrics. Rubric criteria will populate when your enrolled capstone projects load.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-brand uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4" />
          <span>Objective Grading Standards</span>
        </div>
        <h2 className="text-2xl font-black text-textPrimary">AI Rubrics & Scoring Criteria</h2>
        <p className="text-xs text-textMuted max-w-3xl leading-relaxed">
          Each task submission is graded through an automated pipeline against predefined criteria weights and minimum pass thresholds.
        </p>
      </div>

      <div className="grid gap-4">
        {rubrics.map((r, idx) => {
          const rubricId = r.id || idx;
          const isExpanded = expandedRubricIds[rubricId] ?? true;
          const criteriaList = Array.isArray(r.criteria) ? r.criteria : [];

          return (
            <div
              key={rubricId}
              className="rounded-[24px] border border-borderLight bg-white p-6 shadow-xs space-y-4"
            >
              <div
                onClick={() => toggleExpand(rubricId)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-extrabold text-brand uppercase">
                      Rubric #{r.id || idx + 1}
                    </span>
                    <span className="text-xs font-bold text-textPrimary">{r.taskTitle || `Task Rubric`}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-black text-textPrimary">
                      Pass Threshold: ≥{r.passThreshold || 60} / {r.maxScore || 100}
                    </div>
                    <div className="text-[10px] font-semibold text-textMuted">
                      {criteriaList.length} Criteria
                    </div>
                  </div>
                  <button className="p-1 rounded-full text-textMuted hover:bg-bgSoft">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isExpanded && criteriaList.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-borderLight/60">
                  {criteriaList.map((crit: any, cIdx: number) => (
                    <div
                      key={cIdx}
                      className="rounded-2xl border border-borderLight/60 bg-bgSoft/60 p-3 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-textPrimary">
                        <span className="truncate mr-2">{crit.name || crit.criterion || `Criterion ${cIdx + 1}`}</span>
                        <span className="text-brand shrink-0 font-extrabold">{crit.maxScore || crit.weight || 25} pts</span>
                      </div>
                      {crit.description && (
                        <p className="text-[11px] text-textMuted leading-snug">{crit.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
