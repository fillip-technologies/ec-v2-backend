import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import {
  getPrograms,
  getClusters,
  getTopics,
  getTechnologies,
  getCountries,
} from "@/lib/api/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Internship Programs Catalogue | Engineers Clinic",
  description:
    "Explore 120-hour remote internship programs with AI rubric evaluation.",
};

export default async function CatalogPage() {
  // Fetch live catalog data from NestJS backend API
  const [programs, clusters, topics, technologies, countries] = await Promise.all([
    getPrograms(),
    getClusters(),
    getTopics(),
    getTechnologies(),
    getCountries(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-bgBody">
      <Navbar />
      <div className="flex-1">
        <CatalogClient
          initialPrograms={programs}
          initialClusters={clusters}
          initialTopics={topics}
          initialTechnologies={technologies}
          initialCountries={countries}
        />
      </div>
      <Footer />
    </div>
  );
}
