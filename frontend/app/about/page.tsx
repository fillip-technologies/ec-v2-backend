"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutPillars } from "@/components/about/AboutPillars";
import { AboutLeadership } from "@/components/about/AboutLeadership";
import { AboutStory } from "@/components/about/AboutStory";
import { AboutOfferings } from "@/components/about/AboutOfferings";
import { AboutProcess } from "@/components/about/AboutProcess";
import { AboutValues } from "@/components/about/AboutValues";
import { AboutImpactStats } from "@/components/about/AboutImpactStats";
import { AboutCta } from "@/components/about/AboutCta";
import { EnquiryModal } from "@/components/ui/EnquiryModal";

export default function AboutPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-bgBody text-textPrimary antialiased selection:bg-brand selection:text-white">
      {/* Navbar Header */}
      <Navbar onOpenEnquiry={() => setModalOpen(true)} />

      <main className="flex-grow">
        {/* 1. Hero */}
        <AboutHero onOpenEnquiry={() => setModalOpen(true)} />

        {/* 2. Pillars */}
        <AboutPillars />

        {/* 3. Leadership (Founders) */}
        <AboutLeadership />

        {/* 4. Story & Mission / Vision */}
        <AboutStory />

        {/* 5. What We Offer */}
        <AboutOfferings />

        {/* 6. Process Pipeline */}
        <AboutProcess />

        {/* 7. Values */}
        <AboutValues />

        {/* 8. Impact & Reach Stats */}
        <AboutImpactStats />

        {/* 9. CTA Banner */}
        <AboutCta onOpenEnquiry={() => setModalOpen(true)} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Lead Capture Modal */}
      <EnquiryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
