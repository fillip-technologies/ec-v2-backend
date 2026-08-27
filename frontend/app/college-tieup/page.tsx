"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CollegeHero } from "@/components/college-tieup/CollegeHero";
import { CollegeStats } from "@/components/college-tieup/CollegeStats";
import { CollegeBenefits } from "@/components/college-tieup/CollegeBenefits";
import { CollegeServices } from "@/components/college-tieup/CollegeServices";
import { CollegeProcess } from "@/components/college-tieup/CollegeProcess";
import { CollegeFeatures } from "@/components/college-tieup/CollegeFeatures";
import { CollegeTestimonials } from "@/components/college-tieup/CollegeTestimonials";
import { CollegeFaq } from "@/components/college-tieup/CollegeFaq";
import { CollegeCta } from "@/components/college-tieup/CollegeCta";

export default function CollegeTieupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgBody text-textPrimary antialiased selection:bg-brand selection:text-white">
      <Navbar />

      <main className="flex-grow">
        {/* 1. Hero */}
        <CollegeHero />

        {/* 2. Stats */}
        <CollegeStats />

        {/* 3. Benefits */}
        <CollegeBenefits />

        {/* 4. Beyond Learning Services */}
        <CollegeServices />

        {/* 5. Operating Process */}
        <CollegeProcess />

        {/* 6. Operational Features */}
        <CollegeFeatures />

        {/* 7. Testimonials */}
        <CollegeTestimonials />

        {/* 8. FAQ */}
        <CollegeFaq />

        {/* 9. CTA Banner */}
        <CollegeCta />
      </main>

      <Footer />
    </div>
  );
}
