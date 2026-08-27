'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  School,
  Building,
  GraduationCap,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  CreditCard,
  Ticket,
  Award,
  FileCode2,
  GitCommit,
  FileText,
  RefreshCw,
  BarChart3,
  Sparkles,
  ChevronRight,
  BookOpen,
  Layers,
  ArrowUpRight,
  CheckCircle,
} from 'lucide-react';
import { getAdminStudentDetail } from '@/lib/api/admin';
import { showToast } from '@/lib/toast';

interface AdminStudentDetailViewProps {
  studentId: number;
  onBack?: () => void;
}

export const AdminStudentDetailView: React.FC<AdminStudentDetailViewProps> = ({
  studentId,
  onBack,
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'orders' | 'submissions' | 'certificates'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedProgramId, setExpandedProgramId] = useState<number | null>(null);

  const fetchDetails = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminStudentDetail(studentId);
      setData(res);
      if (res.enrollments?.length > 0 && expandedProgramId === null) {
        setExpandedProgramId(res.enrollments[0].id);
      }
      if (isManual) {
        showToast.success('Student audit dossier refreshed', 'Synced');
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to fetch student details', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchDetails();
    }
  }, [studentId]);

  const handleCopy = (text: string, key: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast.success('Copied to clipboard', 'Copied');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm font-bold text-textMuted">Loading student comprehensive dossier...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-borderLight text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-danger mx-auto" />
        <h3 className="text-lg font-black text-textPrimary">Student Record Not Found</h3>
        <p className="text-xs text-textMuted max-w-md mx-auto">
          We couldn't retrieve the student profile with ID #{studentId}. It may have been removed or the ID is invalid.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brandDark transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </button>
        )}
      </div>
    );
  }

  const { user, student, enrollments, orders, certificates, submissions, metrics } = data;

  const studentFullName = student?.fullName || `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || user?.email?.split('@')[0] || 'Student Intern';
  const collegeName = student?.college?.name || student?.customCollegeName || 'N/A';
  const isCustomCollege = !student?.college?.name && Boolean(student?.customCollegeName);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Breadcrumb Navigation & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-textMuted">
              <span>Admin Console</span>
              <span>/</span>
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="hover:text-brand hover:underline cursor-pointer transition font-bold"
                >
                  Students
                </button>
              ) : (
                <span>Students</span>
              )}
              <span>/</span>
              <span className="text-brand font-mono">#STU-{studentId}</span>
            </div>
            <h1 className="text-xl font-black text-textPrimary mt-0.5">
              Student Detail
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDetails(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-borderLight text-xs font-bold text-textPrimary hover:bg-bgSoft transition cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand' : 'text-textMuted'}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Profile Summary Card */}
      <div className="bg-white rounded-[28px] border border-borderLight p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full blur-3xl -z-1 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Identity Info */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-brand to-brandDark flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-md shrink-0">
              {studentFullName.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-textPrimary truncate">{studentFullName}</h2>
                <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-mono font-black text-brand">
                  #ID-{studentId}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    user?.status === 'active'
                      ? 'bg-statusPassedBg text-statusPassedText'
                      : user?.status === 'disabled'
                      ? 'bg-statusErrorBg text-statusErrorText'
                      : 'bg-statusEvaluatingBg text-statusEvaluatingText'
                  }`}
                >
                  {user?.status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {user?.status || 'Active'}
                </span>
              </div>

              {/* Contact meta */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-bold text-textMuted">
                <div className="flex items-center gap-1 text-textPrimary">
                  <Mail className="h-3.5 w-3.5 text-brand shrink-0" />
                  <span className="truncate">{user?.email || 'N/A'}</span>
                  {user?.email && (
                    <button
                      onClick={() => handleCopy(user.email, 'email')}
                      className="text-textMuted hover:text-brand transition ml-1"
                      title="Copy email"
                    >
                      {copiedKey === 'email' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    </button>
                  )}
                </div>

                {user?.phoneNo && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-textMuted shrink-0" />
                    <span>{user.phoneNo}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-brand shrink-0" />
                  <span className="text-textPrimary font-extrabold">{collegeName}</span>
                  {isCustomCollege && (
                    <span className="text-[10px] bg-bgSoft px-1.5 py-0.2 rounded text-textMuted font-normal">
                      (Custom / Unlisted)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats on Right */}
          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-borderLight/80 pt-4 md:pt-0 md:pl-6">
            <div className="text-center px-3">
              <div className="text-2xl font-black text-brand">{metrics?.totalEnrollments || 0}</div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-textMuted">Programs</div>
            </div>
            <div className="h-8 w-px bg-borderLight" />
            <div className="text-center px-3">
              <div className="text-2xl font-black text-emerald-600">{metrics?.passedSubmissions || 0}</div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-textMuted">Steps Passed</div>
            </div>
            <div className="h-8 w-px bg-borderLight" />
            <div className="text-center px-3">
              <div className="text-2xl font-black text-textPrimary">
                {metrics?.averageScore ? `${metrics.averageScore}%` : 'N/A'}
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-textMuted">Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Metric Indicator Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-borderLight shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">Active Tracks</span>
            <BookOpen className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2 text-xl font-black text-textPrimary">
            {metrics?.activeEnrollments || 0}{' '}
            <span className="text-xs font-bold text-textMuted">/ {metrics?.totalEnrollments || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-borderLight shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">Submissions</span>
            <FileCode2 className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2 text-xl font-black text-textPrimary">
            {metrics?.totalSubmissions || 0}{' '}
            <span className="text-xs font-bold text-emerald-600">({metrics?.passedSubmissions || 0} Passed)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-borderLight shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">Total Value / Paid</span>
            <CreditCard className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2 text-xl font-black text-textPrimary">
            ₹{metrics?.totalSpent?.toLocaleString('en-IN') || 0}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-borderLight shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">Certificates</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-black text-textPrimary">
            {metrics?.totalCertificates || 0}{' '}
            <span className="text-xs font-bold text-textMuted">Issued</span>
          </div>
        </div>
      </div>

      {/* 4. Tabbed Content Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-borderLight pb-1 select-none">
        {[
          { id: 'overview', label: 'Academic & Profile', icon: <User className="h-4 w-4" /> },
          { id: 'programs', label: `Programs & Workspaces (${enrollments?.length || 0})`, icon: <BookOpen className="h-4 w-4" /> },
          { id: 'orders', label: `Orders & Billing (${orders?.length || 0})`, icon: <CreditCard className="h-4 w-4" /> },
          { id: 'submissions', label: `Submissions & AI Reviews (${submissions?.length || 0})`, icon: <FileCode2 className="h-4 w-4" /> },
          { id: 'certificates', label: `Certificates (${certificates?.length || 0})`, icon: <Award className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand text-white shadow-2xs'
                : 'text-textMuted hover:text-textPrimary hover:bg-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 5. TAB 1: ACADEMIC & PROFILE DETAILS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity & Academic Meta */}
          <div className="bg-white rounded-3xl border border-borderLight p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-black text-textPrimary flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-brand" />
              <span>Academic Credentials</span>
            </h3>

            <div className="divide-y divide-borderLight/60 text-xs">
              <div className="py-3 flex items-center justify-between">
                <span className="text-textMuted font-bold">First Name</span>
                <span className="font-extrabold text-textPrimary">{student?.firstName || 'N/A'}</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-textMuted font-bold">Last Name</span>
                <span className="font-extrabold text-textPrimary">{student?.lastName || 'N/A'}</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-textMuted font-bold">University Roll / USN</span>
                <span className="font-mono font-extrabold text-brand uppercase">
                  {student?.usn || 'N/A'}
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-textMuted font-bold">Academic Branch / Specialization</span>
                <span className="font-extrabold text-textPrimary">{student?.branch || 'N/A'}</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-textMuted font-bold">Graduation Year</span>
                <span className="font-extrabold text-textPrimary">{student?.graduationYear || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Institutional Affiliation */}
          <div className="bg-white rounded-3xl border border-borderLight p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-black text-textPrimary flex items-center gap-2">
              <School className="h-4 w-4 text-brand" />
              <span>Institutional Affiliation</span>
            </h3>

            <div className="divide-y divide-borderLight/60 text-xs">
              <div className="py-3 flex items-start justify-between gap-4">
                <span className="text-textMuted font-bold shrink-0">Institution Name</span>
                <span className="font-extrabold text-textPrimary text-right">
                  {collegeName}
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-textMuted font-bold">Affiliation Type</span>
                <span className="font-extrabold text-textPrimary">
                  {student?.college ? 'MoU Partner Campus' : 'Self Registered / Custom'}
                </span>
              </div>
              {student?.college && (
                <>
                  <div className="py-3 flex items-start justify-between gap-4">
                    <span className="text-textMuted font-bold shrink-0">Campus Address</span>
                    <span className="font-medium text-textPrimary text-right">
                      {student.college.address || 'N/A'}
                    </span>
                  </div>
                  <div className="py-3 flex items-center justify-between">
                    <span className="text-textMuted font-bold">Campus Status</span>
                    <span className="font-bold text-emerald-600 uppercase text-[10px]">
                      {student.college.status || 'Approved'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Account Governance & Security */}
          <div className="bg-white rounded-3xl border border-borderLight p-6 space-y-4 shadow-xs md:col-span-2">
            <h3 className="text-sm font-black text-textPrimary flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <span>User Account & Security Dossier</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-bgSoft/60 border border-borderLight/80">
                <span className="text-textMuted block text-[11px] font-bold">User Identifier:</span>
                <span className="font-mono font-bold text-textPrimary mt-0.5 block">#USR-{user?.id}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-bgSoft/60 border border-borderLight/80">
                <span className="text-textMuted block text-[11px] font-bold">Assigned Role:</span>
                <span className="font-bold text-brand uppercase mt-0.5 block">{user?.role?.name || 'student'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-bgSoft/60 border border-borderLight/80">
                <span className="text-textMuted block text-[11px] font-bold">Country / Region:</span>
                <span className="font-bold text-textPrimary mt-0.5 block">
                  {user?.country?.name || 'India'} ({user?.country?.isoCode || 'IN'})
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-bgSoft/60 border border-borderLight/80">
                <span className="text-textMuted block text-[11px] font-bold">Joined On:</span>
                <span className="font-bold text-textPrimary mt-0.5 block">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 2: PROGRAMS & WORKSPACES */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          {enrollments?.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-borderLight text-center text-textMuted font-bold text-xs">
              No enrolled programs found for this student.
            </div>
          ) : (
            enrollments.map((enr: any) => {
              const isExpanded = expandedProgramId === enr.id;

              return (
                <div key={enr.id} className="bg-white rounded-3xl border border-borderLight overflow-hidden shadow-xs">
                  {/* Program Header */}
                  <div
                    onClick={() => setExpandedProgramId(isExpanded ? null : enr.id)}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-bgSoft/30 transition select-none"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold text-base text-textPrimary">
                            {enr.program?.title || 'Internship Program'}
                          </h3>
                          <span className="rounded-md bg-bgSoft px-2 py-0.5 text-[10px] font-mono font-bold text-textMuted">
                            #ENR-{enr.id}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              enr.status === 'COMPLETED'
                                ? 'bg-statusPassedBg text-statusPassedText'
                                : 'bg-brand/10 text-brand'
                            }`}
                          >
                            {enr.status}
                          </span>
                        </div>
                        <div className="text-xs text-textMuted mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Duration: {enr.program?.durationHours || 120} Hours (Hands-on Track)</span>
                          <span>·</span>
                          <span>
                            Enrolled:{' '}
                            {new Date(enr.enrolledAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {enr.completedAt && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-600 font-bold">
                                Completed:{' '}
                                {new Date(enr.completedAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-xs font-bold text-brand">
                        {isExpanded ? 'Collapse Track' : 'View Workspaces'}
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 text-brand transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Expanded Projects & Tasks Workspace Tree */}
                  {isExpanded && (
                    <div className="p-6 border-t border-borderLight bg-bgSoft/20 space-y-6">
                      <h4 className="text-xs font-black text-textMuted uppercase tracking-wider flex items-center gap-2">
                        <Layers className="h-4 w-4 text-brand" />
                        <span>Selected Capstone Projects & Guided Workspace Steps (3 Projects)</span>
                      </h4>

                      <div className="space-y-4">
                        {enr.selectedProjects?.map((sp: any, pIdx: number) => {
                          const workspace = sp.workspace;
                          const tasks = workspace?.tasks || [];

                          return (
                            <div
                              key={sp.id}
                              className="bg-white rounded-2xl border border-borderLight/80 p-5 space-y-4 shadow-2xs"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-borderLight/60 pb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="rounded-md bg-brand text-white font-mono font-bold text-[10px] px-1.5 py-0.5">
                                      Project {pIdx + 1}
                                    </span>
                                    <h5 className="font-extrabold text-sm text-textPrimary">
                                      {sp.project?.title || 'Capstone Project'}
                                    </h5>
                                  </div>
                                  <p className="text-xs text-textMuted mt-1">
                                    {sp.project?.description || 'Hands-on practical deliverable track.'}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3">
                                  {workspace?.repoUrl && (
                                    <a
                                      href={workspace.repoUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-bgSoft hover:bg-borderLight text-textPrimary font-bold text-xs transition"
                                    >
                                      <GitCommit className="h-3.5 w-3.5 text-brand" />
                                      <span>GitHub Repo</span>
                                      <ExternalLink className="h-3 w-3 text-textMuted" />
                                    </a>
                                  )}
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      sp.status === 'DONE'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : sp.status === 'ACTIVE'
                                        ? 'bg-brand/10 text-brand'
                                        : 'bg-bgSoft text-textMuted'
                                    }`}
                                  >
                                    {sp.status}
                                  </span>
                                </div>
                              </div>

                              {/* Tasks List */}
                              <div className="space-y-2">
                                <div className="text-[11px] font-bold text-textMuted uppercase tracking-wider">
                                  Steps & Deliverables:
                                </div>

                                {tasks.length === 0 ? (
                                  <div className="text-xs text-textMuted italic py-2">
                                    No workspace tasks generated for this project yet.
                                  </div>
                                ) : (
                                  <div className="divide-y divide-borderLight/40 text-xs">
                                    {tasks.map((task: any, tIdx: number) => {
                                      const progress = task.progress;
                                      const latestSub = task.submissions?.[0];
                                      const review = latestSub?.aiReview;

                                      return (
                                        <div
                                          key={task.id}
                                          className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
                                        >
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-textPrimary">
                                                Step {tIdx + 1}: {task.title}
                                              </span>
                                              <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                  progress?.status === 'PASSED'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : progress?.status === 'OPEN'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : progress?.status === 'NEEDS_WORK'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-bgSoft text-textMuted'
                                                }`}
                                              >
                                                {progress?.status || 'LOCKED'}
                                              </span>
                                            </div>
                                            {task.description && (
                                              <p className="text-[11px] text-textMuted line-clamp-1">
                                                {task.description}
                                              </p>
                                            )}
                                          </div>

                                          {/* Submission status & score */}
                                          <div className="flex items-center gap-3 text-right">
                                            {latestSub ? (
                                              <div className="space-y-0.5">
                                                <div className="flex items-center gap-2 justify-end">
                                                  <span className="text-[11px] text-textMuted font-mono">
                                                    Attempt #{latestSub.attemptIndex || 1}
                                                  </span>
                                                  {review?.score !== undefined && (
                                                    <span className="font-extrabold text-brand font-mono">
                                                      Score: {review.score}/100
                                                    </span>
                                                  )}
                                                </div>
                                                {review?.feedback && (
                                                  <div className="text-[10px] text-textMuted max-w-xs truncate text-right">
                                                    Feedback: {review.feedback}
                                                  </div>
                                                )}
                                              </div>
                                            ) : (
                                              <span className="text-[11px] text-textMuted italic">No submission yet</span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 7. TAB 3: ORDERS & BILLING AUDIT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-borderLight overflow-hidden shadow-xs">
          <div className="p-5 border-b border-borderLight">
            <h3 className="text-sm font-black text-textPrimary flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-brand" />
              <span>Student Order & Payment Reconciliation Ledger</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bgSoft/60 border-b border-borderLight text-[11px] font-extrabold uppercase tracking-wider text-textMuted">
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Program Track</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Method / Gateway</th>
                  <th className="py-3.5 px-4">Payment Txn ID</th>
                  <th className="py-3.5 px-4">Coupon / Batch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight/60">
                {orders?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-textMuted font-bold">
                      No order records found for this student.
                    </td>
                  </tr>
                ) : (
                  orders.map((o: any) => {
                    const isCoupon = Boolean(o.couponId || o.coupon?.code || Number(o.amount) === 0);
                    const latestPayment = o.payments?.[0];

                    return (
                      <tr key={o.id} className="hover:bg-bgSoft/30 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-brand">
                          #ORD-{o.id}
                          <div className="text-[10px] text-textMuted font-sans">
                            {new Date(o.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-textPrimary">
                          {o.program?.title || 'Internship Program'}
                        </td>
                        <td className="py-3.5 px-4 font-black text-textPrimary">
                          ₹{Number(o.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              o.status === 'PAID'
                                ? 'bg-statusPassedBg text-statusPassedText'
                                : o.status === 'PENDING'
                                ? 'bg-statusEvaluatingBg text-statusEvaluatingText'
                                : 'bg-statusErrorBg text-statusErrorText'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-textPrimary">
                          {isCoupon ? 'Zero-Cost Institutional Coupon' : o.gateway || 'Razorpay'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-textMuted">
                          {latestPayment?.gatewayPaymentId || o.gatewayOrderId || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          {o.coupon ? (
                            <div>
                              <span className="font-mono font-bold text-brand uppercase">{o.coupon.code}</span>
                              {o.coupon.batch && (
                                <div className="text-[10px] text-textMuted">
                                  {o.coupon.batch.college?.name || o.coupon.batch.name}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-textMuted">Direct Payment</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. TAB 4: SUBMISSIONS & AI AUDIT */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-3xl border border-borderLight overflow-hidden shadow-xs">
          <div className="p-5 border-b border-borderLight">
            <h3 className="text-sm font-black text-textPrimary flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-brand" />
              <span>Full AI Evaluation & Submission Audit Trail</span>
            </h3>
          </div>

          <div className="divide-y divide-borderLight/60">
            {submissions?.length === 0 ? (
              <div className="p-8 text-center text-textMuted font-bold text-xs">
                No code submissions or AI reviews recorded yet.
              </div>
            ) : (
              submissions.map((sub: any) => {
                const review = sub.aiReview;
                const task = sub.workspaceTask;
                const proj = task?.studentWorkspace?.enrollmentProject?.project;
                const prog = task?.studentWorkspace?.enrollmentProject?.enrollment?.program;

                return (
                  <div key={sub.id} className="p-5 space-y-3 hover:bg-bgSoft/20 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-textPrimary text-sm">
                            {task?.title || 'Workspace Step Task'}
                          </span>
                          <span className="text-xs text-textMuted">
                            ({proj?.title || 'Capstone Project'})
                          </span>
                        </div>
                        <div className="text-[11px] text-textMuted mt-0.5">
                          Program: {prog?.title || 'Internship'} · Submitted:{' '}
                          {new Date(sub.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {sub.commitHash && (
                          <span className="font-mono text-xs bg-bgSoft px-2 py-0.5 rounded text-textPrimary font-bold">
                            git:{sub.commitHash.slice(0, 7)}
                          </span>
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                            sub.status === 'PASSED'
                              ? 'bg-statusPassedBg text-statusPassedText'
                              : 'bg-statusErrorBg text-statusErrorText'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                    </div>

                    {/* AI Review Details Box */}
                    {review && (
                      <div className="p-4 rounded-2xl bg-bgSoft/50 border border-borderLight/80 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-textPrimary flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-brand" />
                            <span>AI Evaluator Assessment</span>
                          </span>
                          <span className="font-mono font-black text-brand text-sm">
                            Score: {review.score} / {review.maxScore || 100}
                          </span>
                        </div>

                        {review.feedback && (
                          <p className="text-xs text-textPrimary leading-relaxed bg-white p-3 rounded-xl border border-borderLight/60">
                            {review.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 9. TAB 5: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          {certificates?.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-borderLight text-center text-textMuted font-bold text-xs">
              No completion certificates issued for this student yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert: any) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-3xl border border-borderLight p-6 space-y-4 shadow-xs relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <Award className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-textPrimary text-sm">
                          {cert.enrollment?.program?.title || 'Verified Internship Certificate'}
                        </h4>
                        <span className="text-[11px] font-mono text-brand font-bold block mt-0.5">
                          UUID: {cert.uuid}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700">
                      Verified
                    </span>
                  </div>

                  <div className="text-xs text-textMuted flex items-center justify-between border-t border-borderLight/60 pt-3">
                    <span>
                      Issued on:{' '}
                      {new Date(cert.issuedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {cert.certificateUrl && (
                      <a
                        href={cert.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-brand font-bold hover:underline"
                      >
                        <span>View Document</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
