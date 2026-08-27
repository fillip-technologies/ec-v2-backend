"use client";

import React from "react";
import Image from "next/image";
import { Container } from "../ui/Container";
import { Badge } from "../ui/Badge";
import { QrCode, Share2, FileCheck, GitBranch } from "lucide-react";

export const CertificateShowcaseSection: React.FC = () => {
  const highlights = [
    {
      icon: <QrCode className="h-5 w-5 text-brand" />,
      title: "QR Verification",
      desc: "Instant tamper-proof authenticity check resolving to public verification URL.",
    },
    {
      icon: <Share2 className="h-5 w-5 text-info" />,
      title: "LinkedIn Ready",
      desc: "One-click license & certification sharing to elevate your professional profile.",
    },
    {
      icon: <FileCheck className="h-5 w-5 text-success" />,
      title: "Resume Ready Proof",
      desc: "Includes 120-hour internship duration & project credits.",
    },
    {
      icon: <GitBranch className="h-5 w-5 text-warningMuted" />,
      title: "GitHub Proof of Work",
      desc: "Linked directly to reviewed repositories, commits, and AI grading score.",
    },
  ];

  return (
    <section id="certificate-sample" className="relative isolate overflow-hidden bg-bgBody py-16 sm:py-20 lg:py-24">
      <Container size="wide">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Text Column */}
          <div>
            <Badge variant="brand">Certificate Credentials</Badge>
            <h2 className="mt-5 text-3xl font-black leading-tight text-textPrimary sm:text-4xl lg:text-5xl">
              A certificate backed by completed project work.
            </h2>
            <p className="mt-4 text-base leading-8 text-textGray">
              Engineers Clinic certificates carry unique verification codes and QR tags, giving recruiters and colleges instant access to your evaluated deliverables.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-borderSoft bg-white p-5 transition duration-300 hover:scale-[1.02] hover:border-brand hover:shadow-xl"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-bgSoft">
                    {item.icon}
                  </span>
                  <h3 className="mt-4 font-black text-textPrimary text-sm sm:text-base">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-textGray">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image Showcase Column */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand/20 to-success/15 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-borderSoft bg-white p-4 shadow-2xl transition duration-500 hover:scale-[1.02]">
              <Image
                src="/images/ec-cer.png"
                alt="Engineers Clinic Verified Certificate Sample"
                width={700}
                height={500}
                className="h-auto w-full object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
