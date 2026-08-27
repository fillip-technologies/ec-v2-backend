"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { HeroStatsCounterSection } from "@/components/sections/HeroStatsCounterSection";
import { AboutNewSection } from "@/components/sections/AboutNewSection";
import { ModulesSection } from "@/components/sections/ModulesSection";
import { CollegeTieUpSection } from "@/components/sections/CollegeTieUpSection";
import { HowWorkSection } from "@/components/sections/HowWorkSection";
import { DashboardPreviewSection } from "@/components/sections/DashboardPreviewSection";
import { CertificateShowcaseSection } from "@/components/sections/CertificateShowcaseSection";
import { PartnershipCollegesSection } from "@/components/sections/PartnershipCollegesSection";
import { OurVerticalsSection } from "@/components/sections/OurVerticalsSection";
import { StatSection } from "@/components/sections/StatSection";
import { MasterInternshipSection } from "@/components/sections/MasterInternshipSection";
import { WhyChooseUsSection } from "@/components/sections/WhyChooseUsSection";
import { ChooseSection } from "@/components/sections/ChooseSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { EnquiryModal } from "@/components/ui/EnquiryModal";

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Technology & Data");

  const handleOpenModal = (category?: string) => {
    if (category) {
      setSelectedCategory(category);
    }
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgBody text-textPrimary antialiased selection:bg-brand selection:text-white">
      {/* 1. Header / Navbar */}
      <Navbar onOpenEnquiry={() => handleOpenModal()} />

      <main className="flex-grow">
        {/* 2. Hero Section */}
        <HeroSection onOpenEnquiry={() => handleOpenModal()} />

        {/* 3. Hero Stats Counter */}
        <HeroStatsCounterSection />

        {/* 4. Why Students Struggle (About New) */}
        <AboutNewSection />

        {/* 5. Level-Based Project Tracks (Modules) */}
        <ModulesSection onOpenEnquiry={() => handleOpenModal()} />

        {/* 6. College Tie-Up Program */}
        <CollegeTieUpSection />

        {/* 7. How It Works Pipeline */}
        <HowWorkSection />

        {/* 8. Student Workspace Dashboard Preview */}
        <DashboardPreviewSection />

        {/* 9. Certificate Showcase */}
        <CertificateShowcaseSection />

        {/* 10. Partnership Colleges Logos */}
        <PartnershipCollegesSection />

        {/* 11. Our Verticals */}
        <OurVerticalsSection />

        {/* 12. Success Numbers Stat Section */}
        <StatSection />

        {/* 13. Master Internship Plans (Pricing) */}
        <MasterInternshipSection onOpenEnquiry={() => handleOpenModal()} />

        {/* 14. Why Choose Us */}
        <WhyChooseUsSection />

        {/* 15. Student Testimonials (Choose) */}
        <ChooseSection />

        {/* 16. FAQ Accordion */}
        <FaqSection />
      </main>

      {/* 17. Footer */}
      <Footer />

      {/* Lead Capture Modal */}
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultCategory={selectedCategory}
      />
    </div>
  );
}
