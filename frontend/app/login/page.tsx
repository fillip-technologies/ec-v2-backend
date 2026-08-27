"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthRobotSpline } from "@/components/auth/AuthRobotSpline";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgBody text-textPrimary antialiased selection:bg-brand selection:text-white">
      <Navbar />

      <main className="flex-grow">
        <section className="relative overflow-hidden bg-gradient-to-br from-surface via-white to-bgMain px-4 py-12 sm:px-8 lg:px-14 lg:py-16">
          {/* Ambient Glow Orbs */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,92,252,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(124,92,252,0.12),_transparent_38%)]" />
          <div className="pointer-events-none absolute left-0 top-20 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              {/* Left Side 3D Spline Robot */}
              <AuthRobotSpline sceneUrl="https://my.spline.design/robotfollowcursorforlandingpage-f11Rc2js8cf5Tfzla4AM0K3F/" />

              {/* Right Side Glassmorphic Login Card */}
              <LoginForm />
            </div>
          </div>
        </section>
      </main>

      <Footer className="mt-0" />
    </div>
  );
}
