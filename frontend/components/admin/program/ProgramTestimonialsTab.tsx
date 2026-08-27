'use client';

import React from 'react';
import { MessageSquareQuote, Plus, Trash2 } from 'lucide-react';
import { ProgramTestimonialForm } from '@/types/catalog';
import { CustomDropdown } from '@/components/shared/CustomDropdown';

interface ProgramTestimonialsTabProps {
  testimonials: ProgramTestimonialForm[];
  setTestimonials: React.Dispatch<React.SetStateAction<ProgramTestimonialForm[]>>;
}

export const ProgramTestimonialsTab: React.FC<ProgramTestimonialsTabProps> = ({
  testimonials,
  setTestimonials,
}) => {
  const handleAddTestimonial = () => {
    setTestimonials([
      ...testimonials,
      {
        authorName: '',
        authorRole: '',
        quote: '',
        rating: 5,
      },
    ]);
  };

  const handleRemoveTestimonial = (idx: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== idx));
  };

  const handleTestimonialChange = (
    idx: number,
    field: keyof ProgramTestimonialForm,
    value: any
  ) => {
    const updated = [...testimonials];
    updated[idx] = { ...updated[idx], [field]: value };
    setTestimonials(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-borderLight shadow-xs">
        <div>
          <h2 className="text-base font-black text-textPrimary flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5 text-success" />
            Program Alumni Testimonials & Social Proof
          </h2>
          <p className="text-xs text-textMuted mt-1">
            Alumni reviews, star ratings, and placement outcomes shown on the catalog landing page.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddTestimonial}
          className="px-4 py-2.5 rounded-xl bg-success text-white text-xs font-black hover:bg-successDark transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      <div className="space-y-4">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="bg-white rounded-[24px] p-6 border border-borderLight shadow-xs space-y-4"
          >
            <div className="flex justify-between items-center border-b border-borderLight pb-3">
              <span className="text-xs font-black text-textPrimary">Testimonial #{idx + 1}</span>
              <button
                type="button"
                onClick={() => handleRemoveTestimonial(idx)}
                className="text-xs font-bold text-danger hover:text-dangerDark flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-extrabold text-textPrimary">Author Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={t.authorName}
                  onChange={(e) => handleTestimonialChange(idx, 'authorName', e.target.value)}
                  className="mt-1.5 w-full rounded-xl bg-bgSoft px-3.5 py-2 text-xs font-bold text-textPrimary border border-borderLight"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-textPrimary">Author Role / Company</label>
                <input
                  type="text"
                  placeholder="e.g. SDE-1 @ Microsoft (Cohort 2025)"
                  value={t.authorRole}
                  onChange={(e) => handleTestimonialChange(idx, 'authorRole', e.target.value)}
                  className="mt-1.5 w-full rounded-xl bg-bgSoft px-3.5 py-2 text-xs font-bold text-textPrimary border border-borderLight"
                />
              </div>

              <div>
                <CustomDropdown
                  label="Star Rating (1 - 5)"
                  value={t.rating ?? 5}
                  onChange={(val) => handleTestimonialChange(idx, 'rating', Number(val))}
                  options={[
                    { value: 5, label: "⭐⭐⭐⭐⭐ (5 Stars)" },
                    { value: 4, label: "⭐⭐⭐⭐ (4 Stars)" },
                    { value: 3, label: "⭐⭐⭐ (3 Stars)" },
                    { value: 2, label: "⭐⭐ (2 Stars)" },
                    { value: 1, label: "⭐ (1 Star)" },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-textPrimary">Testimonial Quote / Review *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. The AI evaluator gave instant feedback on my BullMQ queue implementation. Landed my dream job right after completing this program!"
                value={t.quote}
                onChange={(e) => handleTestimonialChange(idx, 'quote', e.target.value)}
                className="mt-1.5 w-full rounded-xl bg-bgSoft p-3 text-xs font-bold text-textPrimary border border-borderLight"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
