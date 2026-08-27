"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthRobotSpline } from "@/components/auth/AuthRobotSpline";
import { SignupForm } from "@/components/auth/SignupForm";

function SignupContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const initialRole = roleParam === "college" ? "college" : "student";

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      {/* Left Side 3D Robot */}
      <AuthRobotSpline sceneUrl="https://my.spline.design/r4xbot-iAs0s9UvHqSshESeDIZqCcMw/" />

      {/* Right Side Signup Form */}
      <SignupForm initialRole={initialRole} />
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgBody text-textPrimary antialiased selection:bg-brand selection:text-white">
      <Navbar />

      <main className="flex-grow">
        <section className="relative overflow-hidden bg-gradient-to-br from-surface via-white to-bgSoft px-4 py-12 sm:px-8 lg:px-14 lg:py-16">
          {/* Ambient Glow Orbs */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,92,252,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(245,200,66,0.14),_transparent_36%)]" />
          <div className="pointer-events-none absolute left-0 top-20 h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">
            <Suspense
              fallback={
                <div className="flex h-96 items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
                </div>
              }
            >
              <SignupContent />
            </Suspense>
          </div>
        </section>
      </main>

      <Footer className="mt-0" />
    </div>
  );
}
