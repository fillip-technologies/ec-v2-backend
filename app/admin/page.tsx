'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardPage from '../student/page';
import { Loader2 } from 'lucide-react';

function AdminPageContent() {
  const router = useRouter();
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

  return <DashboardPage />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-bgSoft">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
