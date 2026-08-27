'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Award,
  Users,
  CheckCircle2,
  Download,
  Search,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { showToast } from '@/lib/toast';
import { EmptyState } from '@/components/ui/EmptyState';

interface CollegeReportsViewProps {
  reportsData: any;
}

export const CollegeReportsView: React.FC<CollegeReportsViewProps> = ({ reportsData }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const cohortData: any[] = Array.isArray(reportsData?.cohortSummary)
    ? reportsData.cohortSummary
    : [];

  const filteredCohort = useMemo(() => {
    return cohortData.filter((item: any) =>
      item.programTitle.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [cohortData, searchQuery]);

  const handleExportSummaryCSV = () => {
    if (cohortData.length === 0) {
      showToast.error('No report data available to export', 'Export Error');
      return;
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Program Track,Enrolled Count,Completed Count,Average Score,Status']
        .concat(
          cohortData.map(
            (c: any) =>
              `"${c.programTitle}",${c.enrolledCount},${c.completedCount},"${c.avgScore}","${c.status}"`,
          ),
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportsData?.institutionName || 'College'}_Completion_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success('Exported completion summary as CSV!', 'Export Complete');
  };

  const totalEnrolled = reportsData?.totalEnrolledCohort || 0;
  const completedCount = reportsData?.completedInternships || 0;
  const certsCount = reportsData?.certificatesIssued || 0;
  const completionRate = reportsData?.completionRatePercentage || 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-borderLight shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand">
            <BarChart3 className="h-4 w-4" />
            <span>Academic Performance Telemetry</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-textPrimary tracking-tight">
            Institutional Completion & Verification Reports
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Scored outcomes, completion analytics, and QR certificate verification summary for{' '}
            <span className="font-bold text-textPrimary">{reportsData?.institutionName || 'your campus'}</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportSummaryCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-bgSoft hover:bg-borderLight text-textPrimary font-extrabold text-xs transition cursor-pointer shadow-2xs"
        >
          <Download className="h-4 w-4" />
          <span>Export Report CSV</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[24px] border border-borderLight shadow-xs space-y-2">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-xs font-bold uppercase">Total Enrolled Cohort</span>
            <Users className="h-4 w-4 text-brand" />
          </div>
          <div className="text-3xl font-black text-textPrimary">
            {totalEnrolled}
          </div>
          <div className="text-xs text-textMuted">Registered campus learners</div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-borderLight shadow-xs space-y-2">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-xs font-bold uppercase">Completed Internships</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {completedCount}
          </div>
          <div className="text-xs text-emerald-700 font-semibold">
            {completionRate}% Overall Completion Rate
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-borderLight shadow-xs space-y-2">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-xs font-bold uppercase">Certificates Issued</span>
            <Award className="h-4 w-4 text-brand" />
          </div>
          <div className="text-3xl font-black text-brand">
            {certsCount}
          </div>
          <div className="text-xs text-brand font-semibold">Verified QR Credentials</div>
        </div>
      </div>

      {/* Program-Wise Completion DataTable */}
      <div className="rounded-[28px] border border-borderLight bg-white shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-borderLight flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-bgBody/30">
          <div className="text-sm font-black text-textPrimary flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-brand" />
            <span>Program Track Completion Breakdown</span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search program track..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-bold rounded-xl border border-borderLight bg-white text-textPrimary placeholder:text-textMuted focus:border-brand focus:outline-none transition"
            />
          </div>
        </div>

        {filteredCohort.length === 0 ? (
          <div className="p-10 text-center">
            <EmptyState
              variant="inline"
              title={searchQuery ? 'No Matching Programs' : 'No Enrolled Cohorts Found'}
              description={
                searchQuery
                  ? 'No program tracks matched your search keyword.'
                  : 'Students from your institution have not enrolled in any program tracks yet.'
              }
              icon={<GraduationCap className="h-7 w-7 text-textMuted/40" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borderLight bg-bgBody/50 text-[11px] font-black uppercase tracking-wider text-textMuted">
                  <th className="py-3.5 px-4 sm:px-6">Program Track</th>
                  <th className="py-3.5 px-4">Cohort Enrolled</th>
                  <th className="py-3.5 px-4">Completion Progress</th>
                  <th className="py-3.5 px-4">Average Evaluation Score</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight text-xs font-medium">
                {filteredCohort.map((item: any) => {
                  const completionPct =
                    item.enrolledCount > 0
                      ? Math.round((item.completedCount / item.enrolledCount) * 100)
                      : 0;

                  return (
                    <tr key={item.id} className="hover:bg-bgSoft/40 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-extrabold text-textPrimary">
                        {item.programTitle}
                      </td>

                      <td className="py-4 px-4 font-black text-textPrimary">
                        {item.enrolledCount} Students
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-textPrimary">
                            {item.completedCount} / {item.enrolledCount}
                          </span>
                          <span className="text-[10px] text-textMuted font-bold">
                            ({completionPct}%)
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-28 rounded-full bg-bgSoft overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap font-black text-emerald-700">
                        {item.avgScore}
                      </td>

                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Verified</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
