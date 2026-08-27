'use client';

import React, { useState, useEffect } from 'react';
import {
  School,
  Building,
  MapPin,
  Users,
  CreditCard,
  Ticket,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Mail,
  Phone,
  ExternalLink,
  Search,
  Eye,
  AlertCircle,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { getAdminCollegeDetail, updateCollegeStatus } from '@/lib/api/admin';
import { showToast } from '@/lib/toast';

interface AdminCollegeDetailViewProps {
  collegeId: number;
  onBack?: () => void;
  onSelectStudent?: (studentId: number) => void;
}

export const AdminCollegeDetailView: React.FC<AdminCollegeDetailViewProps> = ({
  collegeId,
  onBack,
  onSelectStudent,
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'seats' | 'coupons' | 'students' | 'certificates'>('overview');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchCollegeDetails = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminCollegeDetail(collegeId);
      setData(res);
      if (isManual) {
        showToast.success('Institution dossier refreshed', 'Synced');
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load college details', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (collegeId) {
      fetchCollegeDetails();
    }
  }, [collegeId]);

  const handleCopy = (text: string, key: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast.success('Copied to clipboard', 'Copied');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleStatusChange = async (newStatus: 'approved' | 'rejected' | 'pending') => {
    setStatusUpdating(true);
    try {
      await updateCollegeStatus(collegeId, newStatus);
      showToast.success(`College status updated to ${newStatus.toUpperCase()}`, 'Status Updated');
      await fetchCollegeDetails(false);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update college status', 'Error');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm font-bold text-textMuted">Loading institution comprehensive dossier...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-borderLight text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-danger mx-auto" />
        <h3 className="text-lg font-black text-textPrimary">College Record Not Found</h3>
        <p className="text-xs text-textMuted max-w-md mx-auto">
          We couldn't retrieve the college profile with ID #{collegeId}. It may have been removed or the ID is invalid.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brandDark transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Colleges
          </button>
        )}
      </div>
    );
  }

  const { college, members, seatOrders, couponBatches, students, certificates, metrics } = data;

  const filteredStudents = students.filter((s: any) => {
    const query = studentSearchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      s.name?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query) ||
      s.usn?.toLowerCase().includes(query) ||
      s.branch?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Breadcrumb & Controls Bar */}
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
                  Colleges
                </button>
              ) : (
                <span>Colleges</span>
              )}
              <span>/</span>
              <span className="text-brand font-mono">#COL-{collegeId}</span>
            </div>
            <h1 className="text-xl font-black text-textPrimary mt-0.5">
              Institution Dossier & Cohorts
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {college.status !== 'approved' && (
            <button
              onClick={() => handleStatusChange('approved')}
              disabled={statusUpdating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 transition cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Approve Institution</span>
            </button>
          )}
          {college.status !== 'rejected' && (
            <button
              onClick={() => handleStatusChange('rejected')}
              disabled={statusUpdating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white font-extrabold text-xs transition cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Reject Institution</span>
            </button>
          )}
          <button
            onClick={() => fetchCollegeDetails(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-borderLight text-xs font-bold text-textPrimary hover:bg-bgSoft transition cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand' : 'text-textMuted'}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Institution Profile Card */}
      <div className="bg-white rounded-[28px] border border-borderLight p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full blur-3xl -z-1 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-md shrink-0">
              <School className="h-9 w-9" />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-textPrimary truncate">{college.name}</h2>
                <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-mono font-black text-brand">
                  #ID-{collegeId}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    college.status === 'approved'
                      ? 'bg-statusPassedBg text-statusPassedText'
                      : college.status === 'rejected'
                      ? 'bg-statusErrorBg text-statusErrorText'
                      : 'bg-statusEvaluatingBg text-statusEvaluatingText'
                  }`}
                >
                  {college.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                  {college.status === 'rejected' && <XCircle className="h-3 w-3" />}
                  {college.status === 'pending' && <Clock className="h-3 w-3" />}
                  {college.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-bold text-textMuted">
                <div className="flex items-center gap-1 text-textPrimary">
                  <MapPin className="h-3.5 w-3.5 text-brand shrink-0" />
                  <span>{college.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Country:</span>
                  <span className="text-textPrimary font-extrabold">{college.country?.name || 'India'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Coordinators:</span>
                  <span className="text-textPrimary font-extrabold">{members?.length || 0} Members</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Header Metric Summary */}
          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-borderLight/80 pt-4 md:pt-0 md:pl-6">
            <div className="text-center px-3">
              <div className="text-2xl font-black text-brand">{metrics?.totalStudents || 0}</div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-textMuted">Students</div>
            </div>
            <div className="h-8 w-px bg-borderLight" />
            <div className="text-center px-3">
              <div className="text-2xl font-black text-emerald-600">
                {metrics?.totalSeatsRedeemed || 0} / {metrics?.totalSeatsPurchased || 0}
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-textMuted">Seats Used</div>
            </div>
            <div className="h-8 w-px bg-borderLight" />
            <div className="text-center px-3">
              <div className="text-2xl font-black text-textPrimary">
                {metrics?.seatUtilizationRate || 0}%
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-textMuted">Utilization</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Metric Indicator Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-borderLight shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">Seats Purchased</span>
            <Ticket className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2 text-xl font-black text-textPrimary">
            {metrics?.totalSeatsPurchased || 0}{' '}
            <span className="text-xs font-bold text-emerald-600">({metrics?.totalSeatsRedeemed || 0} Redeemed)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-borderLight shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">Student Cohort</span>
            <Users className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2 text-xl font-black text-textPrimary">
            {metrics?.totalStudents || 0}{' '}
            <span className="text-xs font-bold text-textMuted">({metrics?.activeEnrollments || 0} Active)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-borderLight shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">B2B Revenue</span>
            <CreditCard className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2 text-xl font-black text-textPrimary">
            ₹{metrics?.totalB2BRevenue?.toLocaleString('en-IN') || 0}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-borderLight shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">Certificates</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-black text-textPrimary">
            {metrics?.totalCertificatesIssued || 0}{' '}
            <span className="text-xs font-bold text-textMuted">Issued</span>
          </div>
        </div>
      </div>

      {/* 4. Tab Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-borderLight pb-1 select-none">
        {[
          { id: 'overview', label: 'Governance & Members', icon: <School className="h-4 w-4" /> },
          { id: 'students', label: `Student Cohort (${students?.length || 0})`, icon: <Users className="h-4 w-4" /> },
          { id: 'seats', label: `Seat Orders (${seatOrders?.length || 0})`, icon: <CreditCard className="h-4 w-4" /> },
          { id: 'coupons', label: `Coupon Batches (${couponBatches?.length || 0})`, icon: <Ticket className="h-4 w-4" /> },
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

      {/* 5. TAB 1: GOVERNANCE & MEMBER COORDINATORS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Institutional Specs */}
          <div className="bg-white rounded-3xl border border-borderLight p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-black text-textPrimary flex items-center gap-2">
              <Building className="h-4 w-4 text-brand" />
              <span>Campus Specifications & MoU</span>
            </h3>

            <div className="divide-y divide-borderLight/60 text-xs">
              <div className="py-3 flex items-center justify-between">
                <span className="text-textMuted font-bold">Institution Legal Name</span>
                <span className="font-extrabold text-textPrimary">{college.name}</span>
              </div>
              <div className="py-3 flex items-start justify-between gap-4">
                <span className="text-textMuted font-bold shrink-0">Campus Address</span>
                <span className="font-extrabold text-textPrimary text-right">{college.address}</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-textMuted font-bold">Country & Jurisdiction</span>
                <span className="font-extrabold text-textPrimary">
                  {college.country?.name} ({college.country?.currencyCode || 'INR'})
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-textMuted font-bold">MoU Partner Status</span>
                <span className="font-bold text-emerald-600 uppercase text-[10px]">
                  {college.status}
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-textMuted font-bold">Onboarded On</span>
                <span className="font-extrabold text-textPrimary">
                  {new Date(college.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Member Coordinators */}
          <div className="bg-white rounded-3xl border border-borderLight p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-black text-textPrimary flex items-center gap-2">
              <Users className="h-4 w-4 text-brand" />
              <span>Institutional Coordinators & Member Logins</span>
            </h3>

            {members?.length === 0 ? (
              <div className="text-center py-8 text-xs text-textMuted font-bold">
                No dedicated coordinator accounts mapped to this college yet.
              </div>
            ) : (
              <div className="divide-y divide-borderLight/60 text-xs">
                {members.map((m: any) => (
                  <div key={m.userId} className="py-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-extrabold text-textPrimary flex items-center gap-1.5">
                        <span>{m.email}</span>
                        <span className="rounded bg-bgSoft px-1.5 py-0.2 text-[9px] font-mono text-textMuted">
                          #USR-{m.userId}
                        </span>
                      </div>
                      <div className="text-[10px] text-textMuted mt-0.5">
                        {m.phoneNo ? `Phone: ${m.phoneNo} · ` : ''}Joined:{' '}
                        {new Date(m.joinedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <span className="rounded-full bg-brand/10 text-brand font-bold text-[10px] px-2 py-0.5 uppercase">
                      {m.roleName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 2: STUDENT COHORT */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-borderLight overflow-hidden shadow-xs space-y-4">
          <div className="p-5 border-b border-borderLight flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-textPrimary flex items-center gap-2">
                <Users className="h-4 w-4 text-brand" />
                <span>Affiliated Campus Students ({students?.length || 0})</span>
              </h3>
              <p className="text-xs text-textMuted mt-0.5">
                Students registered under {college.name}.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textMuted" />
              <input
                type="text"
                placeholder="Search student, USN, branch..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="w-full rounded-xl bg-bgSoft pl-9 pr-3 py-1.5 text-xs font-bold text-textPrimary border border-borderLight/60 focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bgSoft/60 border-b border-borderLight text-[11px] font-extrabold uppercase tracking-wider text-textMuted">
                  <th className="py-3.5 px-4">Student Intern</th>
                  <th className="py-3.5 px-4">University Roll / USN</th>
                  <th className="py-3.5 px-4">Branch & Grad Year</th>
                  <th className="py-3.5 px-4 text-center">Enrolled Tracks</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[70px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight/60">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-textMuted font-bold">
                      No students found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s: any) => (
                    <tr key={s.id} className="hover:bg-bgSoft/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-textPrimary">{s.name || 'Student'}</div>
                        <div className="text-[11px] text-textMuted mt-0.5 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{s.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-brand uppercase">
                        {s.usn || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-textPrimary">
                        {s.branch || 'General'}
                        <div className="text-[10px] text-textMuted font-bold">
                          {s.graduationYear ? `Class of ${s.graduationYear}` : 'N/A'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-textPrimary">
                        <span className="rounded bg-brand/10 text-brand px-2 py-0.5 text-xs font-bold">
                          {s.enrollmentCount || 0} Programs
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            s.status === 'active'
                              ? 'bg-statusPassedBg text-statusPassedText'
                              : 'bg-statusEvaluatingBg text-statusEvaluatingText'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap min-w-[70px]">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectStudent) {
                              onSelectStudent(s.id);
                            } else {
                              window.open(`/admin/studentdetail/${s.id}`, '_blank');
                            }
                          }}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-brand/10 text-brand hover:bg-brand hover:text-white transition-all cursor-pointer shadow-2xs shrink-0"
                          title="View Student Dossier"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB 3: SEAT ORDERS & B2B PURCHASES */}
      {activeTab === 'seats' && (
        <div className="bg-white rounded-3xl border border-borderLight overflow-hidden shadow-xs">
          <div className="p-5 border-b border-borderLight">
            <h3 className="text-sm font-black text-textPrimary flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-brand" />
              <span>Institutional Seat Orders & Invoicing Ledger</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bgSoft/60 border-b border-borderLight text-[11px] font-extrabold uppercase tracking-wider text-textMuted">
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Program Track</th>
                  <th className="py-3.5 px-4">Seats Allocated</th>
                  <th className="py-3.5 px-4">Redeemed</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Invoice Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight/60">
                {seatOrders?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-textMuted font-bold">
                      No bulk seat purchase orders recorded for this institution yet.
                    </td>
                  </tr>
                ) : (
                  seatOrders.map((so: any) => (
                    <tr key={so.id} className="hover:bg-bgSoft/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand">
                        #SEAT-{so.id}
                        <div className="text-[10px] text-textMuted font-sans">
                          {new Date(so.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-textPrimary">
                        {so.program?.title || 'Internship Program'}
                      </td>
                      <td className="py-3.5 px-4 font-black text-textPrimary">
                        {so.seatsPurchased} Seats
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {so.seatsRedeemed || 0} ({so.seatsPurchased > 0 ? Math.round(((so.seatsRedeemed || 0) / so.seatsPurchased) * 100) : 0}%)
                      </td>
                      <td className="py-3.5 px-4 font-black text-textPrimary">
                        ₹{Number(so.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            so.status === 'PAID'
                              ? 'bg-statusPassedBg text-statusPassedText'
                              : 'bg-statusEvaluatingBg text-statusEvaluatingText'
                          }`}
                        >
                          {so.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-textMuted">
                        {so.invoiceRef || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. TAB 4: COUPON BATCHES */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          {couponBatches?.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-borderLight text-center text-textMuted font-bold text-xs">
              No coupon batches generated for this college yet.
            </div>
          ) : (
            couponBatches.map((cb: any) => (
              <div key={cb.id} className="bg-white rounded-3xl border border-borderLight p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-borderLight/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-base text-brand uppercase">
                        {cb.batchCode}
                      </span>
                      <span className="rounded bg-bgSoft px-2 py-0.5 text-[10px] font-bold text-textMuted">
                        Batch #{cb.id}
                      </span>
                    </div>
                    <div className="text-xs text-textMuted mt-1">
                      Program: <span className="font-bold text-textPrimary">{cb.program?.title || 'Program'}</span> · Created:{' '}
                      {new Date(cb.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 text-xs font-black">
                      {cb.coupons?.filter((c: any) => c.status === 'REDEEMED').length || 0} / {cb.totalCoupons} Redeemed
                    </span>
                  </div>
                </div>

                {/* Sample Coupons Table */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-textMuted uppercase tracking-wider">
                    Coupon Codes in Batch:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {cb.coupons?.map((c: any) => {
                      const redemption = c.orders?.[0];
                      const student = redemption?.student;

                      return (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-xl border border-borderLight/80 bg-bgSoft/30 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-textPrimary block truncate">
                              {c.code}
                            </span>
                            {student && (
                              <span className="text-[10px] text-textMuted block truncate">
                                Used by: {student.firstName} {student.lastName}
                              </span>
                            )}
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                              c.status === 'REDEEMED'
                                ? 'bg-statusPassedBg text-statusPassedText'
                                : 'bg-statusEvaluatingBg text-statusEvaluatingText'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 9. TAB 5: CERTIFICATES & CREDENTIALS */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          {certificates?.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-borderLight text-center text-textMuted font-bold text-xs">
              No completion certificates issued for students of this college yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert: any) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-3xl border border-borderLight p-6 space-y-3 shadow-xs"
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
                      Issued:{' '}
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
