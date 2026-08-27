"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Sparkles, Send } from "lucide-react";
import { Button } from "./Button";
import { CustomDropdown } from "@/components/shared/CustomDropdown";

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  defaultCategory?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  title = "Start Your Project Internship",
  subtitle = "Fill in your details to receive curriculum guidance, project catalog, and enrollment procedure.",
  defaultCategory = "Technology & Data",
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    level: "Beginner (45 Days)",
    category: defaultCategory,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-borderSoft bg-white p-6 sm:p-8 shadow-2xl transition-all z-10">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-bgSoft text-textGray transition hover:bg-brand hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-successLight text-success">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="mt-6 text-2xl font-black text-textPrimary">Enquiry Submitted!</h3>
            <p className="mt-3 text-sm text-textGray">
              Thank you for reaching out. Our academic counselor will contact you at{" "}
              <span className="font-semibold text-textPrimary">{formData.phone || formData.email}</span> with complete project track details.
            </p>
            <Button variant="primary" className="mt-8 w-full" onClick={handleReset}>
              Got It, Thanks
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-bgSoft text-brand">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-xs font-black uppercase tracking-[0.16em] text-brand">
                Engineers Clinic
              </span>
            </div>

            <h3 className="mt-4 text-2xl font-black text-textPrimary sm:text-3xl">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-textGray">{subtitle}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-textPrimary">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1.5 w-full rounded-2xl border border-borderSoft bg-bgBody px-4 py-3 text-sm font-medium text-textPrimary outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-textPrimary">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1.5 w-full rounded-2xl border border-borderSoft bg-bgBody px-4 py-3 text-sm font-medium text-textPrimary outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-textPrimary">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1.5 w-full rounded-2xl border border-borderSoft bg-bgBody px-4 py-3 text-sm font-medium text-textPrimary outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-textPrimary">
                    College / Institution
                  </label>
                  <input
                    type="text"
                    placeholder="Your College Name"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="mt-1.5 w-full rounded-2xl border border-borderSoft bg-bgBody px-4 py-3 text-sm font-medium text-textPrimary outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div>
                  <CustomDropdown
                    label="Target Level"
                    options={[
                      "Beginner (45 Days)",
                      "Intermediate (75 Days)",
                      "Advanced (90 Days)",
                    ]}
                    value={formData.level}
                    onChange={(val) => setFormData({ ...formData, level: val })}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                icon={<Send className="h-4 w-4" />}
                className="mt-6 w-full"
              >
                Submit Enquiry
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
