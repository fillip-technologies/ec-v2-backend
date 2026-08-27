'use client';

import React from 'react';
import { HelpCircle, Plus, Trash2 } from 'lucide-react';
import { ProgramFaqForm } from '@/types/catalog';

interface ProgramFaqsTabProps {
  faqs: ProgramFaqForm[];
  setFaqs: React.Dispatch<React.SetStateAction<ProgramFaqForm[]>>;
}

export const ProgramFaqsTab: React.FC<ProgramFaqsTabProps> = ({ faqs, setFaqs }) => {
  const handleAddFaq = () => {
    setFaqs([
      ...faqs,
      {
        question: '',
        answer: '',
      },
    ]);
  };

  const handleRemoveFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const handleFaqChange = (idx: number, field: keyof ProgramFaqForm, value: string) => {
    const updated = [...faqs];
    updated[idx] = { ...updated[idx], [field]: value };
    setFaqs(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-borderLight shadow-xs">
        <div>
          <h2 className="text-base font-black text-textPrimary flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-warning" />
            Frequently Asked Questions (FAQs)
          </h2>
          <p className="text-xs text-textMuted mt-1">
            Common questions regarding curriculum, prerequisites, BullMQ AI evaluations, and certifications.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddFaq}
          className="px-4 py-2.5 rounded-xl bg-warning text-white text-xs font-black hover:bg-warningDark transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add FAQ
        </button>
      </div>

      <div className="space-y-4">
        {faqs.map((f, idx) => (
          <div
            key={idx}
            className="bg-white rounded-[24px] p-6 border border-borderLight shadow-xs space-y-4"
          >
            <div className="flex justify-between items-center border-b border-borderLight pb-3">
              <span className="text-xs font-black text-textPrimary">FAQ Item #{idx + 1}</span>
              <button
                type="button"
                onClick={() => handleRemoveFaq(idx)}
                className="text-xs font-bold text-danger hover:text-dangerDark flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>

            <div>
              <label className="text-xs font-extrabold text-textPrimary">Question *</label>
              <input
                type="text"
                required
                placeholder="e.g. How is this internship program certified?"
                value={f.question}
                onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                className="mt-1.5 w-full rounded-xl bg-bgSoft px-3.5 py-2 text-xs font-bold text-textPrimary border border-borderLight"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-textPrimary">Detailed Answer *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Upon finishing all capstone projects and passing AI rubric checks, you receive a QR-verifiable certificate recognized across engineering partners."
                value={f.answer}
                onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                className="mt-1.5 w-full rounded-xl bg-bgSoft p-3 text-xs font-bold text-textPrimary border border-borderLight"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
