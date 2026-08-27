"use client";

import React from "react";
import Image from "next/image";

export const PartnershipCollegesSection: React.FC = () => {
  const collegeLogos = [
    { name: "VIT", file: "vit.png" },
    { name: "SRM Institute", file: "srm.png" },
    { name: "SASTRA University", file: "sastra.png" },
    { name: "Manipal University", file: "manipal.png" },
    { name: "IIT Kanpur", file: "iitkanpur.png" },
    { name: "IIT Bombay", file: "IITBombay.png" },
    { name: "GNDU", file: "gndu.png" },
    { name: "DTU", file: "dtu.png" },
    { name: "Christ University", file: "Christ.png" },
    { name: "Bennett University", file: "Bennett.webp" },
    { name: "Amity University", file: "AMITY.png" },
  ];

  return (
    <section className="bg-bgBody py-12 sm:py-16">
      <div className="container-main">
        <div className="border-y border-borderSoft py-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-brand">
              Partnership Colleges
            </span>
            <h2 className="mt-3 text-2xl font-black leading-tight text-textPrimary sm:text-3xl">
              Trusted by students from leading campuses.
            </h2>
            <p className="mt-4 text-base leading-7 text-textGray">
              Our programs support learners across respected colleges and universities with practical project-based training.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {collegeLogos.map((college, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center overflow-hidden rounded-2xl border border-borderSoft bg-white px-5 shadow-[0_12px_32px_rgba(15,10,42,0.05)]"
                style={{ height: "88px" }}
              >
                <Image
                  src={`/images/companylogo/${college.file}`}
                  alt={`${college.name} logo`}
                  width={128}
                  height={56}
                  className="object-contain max-h-14 w-auto h-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
