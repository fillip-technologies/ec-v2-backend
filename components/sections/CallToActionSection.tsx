"use client";

import React from "react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ArrowRight, Sparkles, Building2 } from "lucide-react";

interface CallToActionSectionProps {
  onOpenEnquiry: () => void;
}

export const CallToActionSection: React.FC<CallToActionSectionProps> = ({ onOpenEnquiry }) => {
  return (
    <section className="relative isolate overflow-hidden bg-white py-16 sm:py-20">
      <Container size="wide">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-surfaceNavy via-surfaceDark to-surfaceNavy px-6 py-12 text-center text-white shadow-2xl sm:px-12 sm:py-16">
          {/* Background Ambient Radial Glow */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-brand/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-success/20 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-brand">
              <Sparkles className="h-3.5 w-3.5 text-success" />
              Start Your Project Internship Today
            </span>

            <h2 className="mt-6 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Ready to turn learning into verifiable career proof?
            </h2>

            <p className="mt-4 text-base leading-8 text-borderSoft/80">
              Select your project track, complete step-by-step milestones, submit code to GitHub, and earn an AI-reviewed certificate.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="h-4 w-4" />}
                onClick={onOpenEnquiry}
              >
                Enroll Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={<Building2 className="h-4 w-4 text-brand" />}
                onClick={onOpenEnquiry}
                className="bg-white/10 text-white hover:bg-white hover:text-textPrimary"
              >
                College Partnership
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
