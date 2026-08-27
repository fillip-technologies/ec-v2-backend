import React from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProgramDetailClient } from "@/components/program-detail/ProgramDetailClient";
import { getProgramByIdOrSlug, getCountries } from "@/lib/api/catalog";

export const dynamic = "force-dynamic";

interface ProgramPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProgramPageProps) {
  const resolvedParams = await params;
  const program = await getProgramByIdOrSlug(resolvedParams.slug);

  if (!program) {
    return {
      title: "Program Not Found | Engineers Clinic",
    };
  }

  return {
    title: `${program.title} | Engineers Clinic`,
    description:
      program.description ||
      `Enroll in ${program.title} - Remote internship program with AI rubric evaluation.`,
  };
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const resolvedParams = await params;
  const [program, countries] = await Promise.all([
    getProgramByIdOrSlug(resolvedParams.slug),
    getCountries(),
  ]);

  if (!program) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-bgBody">
      <Navbar />
      <div className="flex-1">
        <ProgramDetailClient program={program} countries={countries} />
      </div>
      <Footer />
    </div>
  );
}
