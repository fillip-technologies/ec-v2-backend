'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AdminCollegeDetailView } from '@/components/admin/AdminCollegeDetailView';
import { UserSidebar } from '@/components/shared/UserSidebar';
import { Loader2 } from 'lucide-react';

function CollegeDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user, roleName } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const collegeId = Number(params?.id);
  const activeRole = roleName || (user as any)?.role?.name || (typeof user?.role === 'string' ? user.role : '');
  const isAdmin = activeRole === 'super_admin' || activeRole === 'admin';

  if (!mounted || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bgSoft">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-bgSoft space-y-3">
        <h2 className="text-lg font-black text-textPrimary">Unauthorized Access</h2>
        <p className="text-xs text-textMuted">You need administrative permissions to view college dossiers.</p>
        <button
          onClick={() => router.push('/student')}
          className="px-4 py-2 rounded-xl bg-brand text-white font-bold text-xs cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-bgSoft">
      {/* Pinned Left Sidebar */}
      <UserSidebar
        activeSlug="colleges"
        onSelectSlug={(slug) => router.push(`/admin?tab=${slug}`)}
        onOpenProfile={() => router.push('/admin?tab=profile')}
      />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto p-4 pt-16 sm:p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          <AdminCollegeDetailView
            collegeId={collegeId}
            onBack={() => router.push('/admin?tab=colleges')}
            onSelectStudent={(sId) => router.push(`/admin/studentdetail/${sId}`)}
          />
        </div>
      </main>
    </div>
  );
}

export default function CollegeDetailPage() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center bg-bgSoft">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        }
      >
        <CollegeDetailPageContent />
      </Suspense>
    </AuthProvider>
  );
}
