'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, Code, Sparkles, CheckCircle2 } from 'lucide-react';
import { Program } from '@/types/catalog';
import { formatPrice } from '@/lib/utils/currency';

interface ProgramCardProps {
  program: Program;
  countryId?: number;
  currencyCode?: string;
  isEnrolled?: boolean;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  countryId,
  currencyCode = 'INR',
  isEnrolled = false,
}) => {
  const techList = program.technologies?.map((t) => t.technology.name) || [];
  const projectCount = program.projects?.length || 0;

  // Find pricing entry for the active country or currency
  const pricing =
    program.pricings?.find(
      (p) =>
        (countryId ? p.countryId === countryId : false) ||
        p.currency?.toUpperCase() === currencyCode.toUpperCase(),
    ) ||
    program.pricings?.find(
      (p) => p.currency?.toUpperCase() === currencyCode.toUpperCase(),
    ) ||
    program.pricings?.[0];

  const activeCurrency = pricing?.currency || currencyCode;
  const activeAmount = pricing?.amount;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isEnrolled
          ? 'border-emerald-300 hover:border-emerald-500'
          : 'border-glassBorder hover:border-brand/40'
      }`}
    >
      <div>
        {/* Top Header Badge */}
        {isEnrolled && (
          <div className="mb-2.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Enrolled
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-extrabold tracking-tight text-textPrimary group-hover:text-brand transition-colors line-clamp-2">
          {program.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs font-medium text-textMuted line-clamp-2">
          {program.description ||
            'Industry-graded internship program with AI rubric evaluation.'}
        </p>

        {/* Metadata Badges (Duration & Projects) */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-y border-borderLight/60 py-2.5 text-xs font-bold text-textSecondary">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-brand" />
            {program.durationHours} Hours
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            {projectCount} {projectCount === 1 ? 'Project' : 'Projects'}
          </span>
        </div>

        {/* Technologies Used */}
        {techList.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted flex items-center gap-1">
              <Code className="h-3 w-3 text-brand" /> Tech:
            </span>
            {techList.slice(0, 4).map((tech, idx) => (
              <span
                key={idx}
                className="rounded-md bg-bgBody px-2 py-0.5 text-[10px] font-bold text-textSecondary border border-borderLight/60"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Dynamic Price Formatting & Action Button */}
      <div className="mt-5 flex items-center justify-between border-t border-borderLight/60 pt-3.5">
        <div>
          <div className="text-base font-extrabold text-brand">
            {formatPrice(activeAmount, activeCurrency)}
          </div>
          <div className="text-[10px] font-medium text-textMuted">
            {isEnrolled ? 'Enrolled Track' : 'Inclusive of AI Evaluation'}
          </div>
        </div>

        <Link
          href={`/catalog/${program.slug}`}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
            isEnrolled
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-brand hover:bg-brandHover'
          }`}
        >
          <span>{isEnrolled ? 'View Track' : 'Explore'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};
