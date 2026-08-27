'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Download,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { getStudentCertificates } from '@/lib/api/student';
import { showToast } from '@/lib/toast';
import Link from 'next/link';

export interface CertificateItem {
  id: number;
  uuid: string;
  programTitle: string;
  certificateUrl?: string | null;
  issuedAt: string;
  verifyUrl: string;
}

interface StudentCertificateViewProps {
  certificates?: CertificateItem[];
  onNavigateToProgram?: () => void;
}

export const StudentCertificateView: React.FC<StudentCertificateViewProps> = ({
  certificates: initialCertificates,
  onNavigateToProgram,
}) => {
  const [certificates, setCertificates] = useState<CertificateItem[]>(
    Array.isArray(initialCertificates) ? initialCertificates : []
  );
  const [loading, setLoading] = useState<boolean>(!initialCertificates);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [copiedUuid, setCopiedUuid] = useState<string | null>(null);

  const fetchCertificates = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getStudentCertificates();
      setCertificates(Array.isArray(data) ? data : []);
      if (isManual) {
        showToast.success('Certificates synced with accreditation registry', 'Synced');
      }
    } catch (err: any) {
      console.error('Failed to fetch certificates:', err);
      if (isManual) {
        showToast.error('Could not load certificates', 'Error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialCertificates || initialCertificates.length === 0) {
      fetchCertificates();
    }
  }, [initialCertificates]);

  const handleCopy = (text: string, id: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedUuid(id);
    showToast.success('Certificate Credential ID copied', 'Copied');
    setTimeout(() => setCopiedUuid(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-borderLight shadow-xs">
        <div>
          <h1 className="text-xl font-black text-textPrimary flex items-center gap-2">
            <Award className="h-6 w-6 text-brand" />
            Verified Internship Certificates & Accreditations
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Official QR-verifiable certificates of completion issued upon satisfactory rubric grading of all required deliverables.
          </p>
        </div>

        <button
          onClick={() => fetchCertificates(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2 text-xs font-bold text-textPrimary hover:bg-borderLight hover:text-brand transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand' : ''}`} />
          <span>{refreshing ? 'Verifying...' : 'Refresh Registry'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 rounded-[28px] border border-borderLight bg-white shadow-xs">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <span className="text-xs font-bold text-textMuted uppercase tracking-wider mt-3">
            Checking Blockchain & Registry for Issued Certificates...
          </span>
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const issuedDate = new Date(cert.issuedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={cert.id}
                className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group space-y-5"
              >
                {/* Decorative Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-brand to-brandDark" />

                {/* Card Header with Badges */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 group-hover:scale-105 transition-transform shadow-2xs">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="h-3 w-3" /> QR Verifiable
                      </span>
                      <h3 className="text-base font-black text-textPrimary mt-1 line-clamp-1">
                        {cert.programTitle}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Details Box */}
                <div className="rounded-2xl bg-bgSoft/60 border border-borderLight/60 p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-textMuted">
                    <span className="font-bold flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-textMuted" /> Issued Date
                    </span>
                    <span className="font-black text-textPrimary">{issuedDate}</span>
                  </div>

                  <div className="flex items-center justify-between text-textMuted pt-2 border-t border-borderLight/60">
                    <span className="font-bold">Credential UUID</span>
                    <div className="flex items-center gap-1.5">
                      <code className="font-mono text-[11px] font-bold text-textPrimary bg-white px-2 py-0.5 rounded-md border border-borderLight">
                        {cert.uuid.slice(0, 16)}...
                      </code>
                      <button
                        onClick={() => handleCopy(cert.uuid, cert.uuid)}
                        className="p-1 rounded-md hover:bg-white text-textMuted hover:text-brand transition cursor-pointer"
                        title="Copy Full UUID"
                      >
                        {copiedUuid === cert.uuid ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                  {cert.certificateUrl ? (
                    <a
                      href={cert.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand py-2.5 px-4 text-xs font-black text-white hover:bg-brandHover shadow-xs transition cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Certificate</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => handleCopy(window.location.origin + cert.verifyUrl, `link-${cert.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand py-2.5 px-4 text-xs font-black text-white hover:bg-brandHover shadow-xs transition cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{copiedUuid === `link-${cert.id}` ? 'Verification Link Copied' : 'Copy Verification Link'}</span>
                    </button>
                  )}

                  <a
                    href={cert.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-borderLight bg-white py-2.5 px-3.5 text-xs font-bold text-textPrimary hover:bg-bgSoft hover:text-brand transition cursor-pointer"
                    title="Open public verification page"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Verify</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-[28px] border border-dashed border-borderLight bg-white p-12 text-center shadow-xs space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            <Award className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-black text-textPrimary">
              No Certificates Earned Yet
            </h3>
            <p className="text-xs text-textMuted leading-relaxed">
              Internship certificates are generated and registered automatically once all capstone milestone deliverables in your programme are completed and graded as <span className="font-bold text-emerald-600">PASSED</span>.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {onNavigateToProgram && (
              <button
                onClick={onNavigateToProgram}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-black text-white hover:bg-brandHover shadow-xs transition cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                <span>Go to Programme Deliverables</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => fetchCertificates(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-borderLight bg-bgSoft px-4 py-2.5 text-xs font-bold text-textPrimary hover:bg-borderLight transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Check for Newly Issued Certs</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
