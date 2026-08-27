'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UserSidebar } from '@/components/shared/UserSidebar';
import { AdminCreateProgramView } from '@/components/admin/AdminCreateProgramView';
import { Loader2 } from 'lucide-react';

function AdminProgramContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawId = searchParams.get('id');
  const programId = rawId && !isNaN(Number(rawId)) ? Number(rawId) : undefined;

  const { user, roleName } = useAuth();
  const [checking, setChecking] = useState(true);

  const activeRole = roleName || (user as any)?.role?.name || (typeof user?.role === 'string' ? user.role : '');
  const isAdmin = activeRole === 'super_admin' || activeRole === 'admin';

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    if (user && !isAdmin) {
      router.push('/login');
      return;
    }

    setChecking(false);
  }, [user, isAdmin, router]);

  if (checking || !user || !isAdmin) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bgSoft">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  const handleBackToPrograms = () => {
    router.push('/admin?tab=programs');
  };

  const handleProgramSaved = () => {
    router.push('/admin?tab=programs');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-bgSoft">
      {/* Pinned Left Sidebar */}
      <UserSidebar
        activeSlug="programs"
        onSelectSlug={(slug) => {
          router.push(`/admin?tab=${slug}`);
        }}
        onOpenProfile={() => router.push('/admin?tab=profile')}
      />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto p-4 pt-16 sm:p-6 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <AdminCreateProgramView
            programId={programId}
            onBack={handleBackToPrograms}
            onSuccess={handleProgramSaved}
          />
        </div>
      </main>
    </div>
  );
}

export default function AdminProgramPage() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center bg-bgSoft">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        }
      >
        <AdminProgramContent />
      </Suspense>
    </AuthProvider>
  );
}
