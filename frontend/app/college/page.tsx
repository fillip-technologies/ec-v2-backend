'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardPage from '../student/page';
import Link from 'next/link';
import { School, ArrowRight } from 'lucide-react';

function CollegePageContent() {
  const { user, roleName } = useAuth();
  const activeRole = roleName || (user as any)?.role?.name || (typeof user?.role === 'string' ? user.role : '');
  const isCollege = activeRole === 'college';

  if (!user || !isCollege) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-bgSoft p-4">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 border border-borderLight shadow-xl text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <School className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black text-textPrimary">B2B College Institution Portal</h1>
          <p className="text-xs text-textMuted">
            Please log in with your institutional college admin account to access your campus cohort.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand text-white font-extrabold text-xs shadow-md"
          >
            <span>Go to Portal Login</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return <DashboardPage />;
}

export default function CollegePage() {
  return <CollegePageContent />;
}
