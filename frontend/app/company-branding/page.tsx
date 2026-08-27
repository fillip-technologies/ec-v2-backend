"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BrandingHero } from "@/components/company-branding/BrandingHero";
import { BrandingStats } from "@/components/company-branding/BrandingStats";
import { BrandingPromote } from "@/components/company-branding/BrandingPromote";
import { BrandingChannels } from "@/components/company-branding/BrandingChannels";
import { BrandingProcess } from "@/components/company-branding/BrandingProcess";
import { BrandingAnalytics } from "@/components/company-branding/BrandingAnalytics";
import { BrandingCaseStudies } from "@/components/company-branding/BrandingCaseStudies";
import { BrandingTestimonials } from "@/components/company-branding/BrandingTestimonials";
import { BrandingFaq } from "@/components/company-branding/BrandingFaq";
import { BrandingCta } from "@/components/company-branding/BrandingCta";
import { EnquiryModal } from "@/components/ui/EnquiryModal";

export default function CompanyBrandingPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-bgBody text-textPrimary antialiased selection:bg-brand selection:text-white">
      <Navbar onOpenEnquiry={() => setModalOpen(true)} />

      <main className="flex-grow">
        {/* 1. Hero */}
        <BrandingHero />

        {/* 2. Stats strip */}
        <BrandingStats />

        {/* 3. Campaign inventory */}
        <BrandingPromote />

        {/* 4. Distribution channels */}
        <BrandingChannels />

        {/* 5. Process workflow */}
        <BrandingProcess />

        {/* 6. Reporting layer */}
        <BrandingAnalytics />

        {/* 7. Case studies */}
        <BrandingCaseStudies />

        {/* 8. Testimonials */}
        <BrandingTestimonials />

        {/* 9. Buyer FAQ */}
        <BrandingFaq />

        {/* 10. CTA Onboarding Banner */}
        <BrandingCta />
      </main>

      <Footer />

      <EnquiryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
