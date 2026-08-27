'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserSidebar } from '@/components/shared/UserSidebar';
import { TaskSubmissionModal } from '@/components/student/TaskSubmissionModal';
import { Project } from '@/types/catalog';
import { getProgramByIdOrSlug, getPrograms } from '@/lib/api/catalog';
import {
  getStudentOverview,
  getStudentWorkspace,
  getStudentPrograms,
  getStudentSubmissions,
  getStudentRubrics,
  submitStudentTask,
} from '@/lib/api/student';
import {
  getAdminOverview,
  getAdminColleges,
  updateCollegeStatus,
  getAdminUsers,
  updateUserStatus,
} from '@/lib/api/admin';
import {
  getCollegeOverview,
  getCollegeStudents,
  getCollegeCoupons,
  getCollegeReports,
} from '@/lib/api/college';
import { showToast } from '@/lib/toast';
import { School, Shield, Loader2, Award, CreditCard } from 'lucide-react';

// Lightweight fallback loader for lazy dynamic chunks
const ViewLoadingFallback = () => (
  <div className="flex h-64 items-center justify-center rounded-2xl bg-white/60 p-8">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-6 w-6 animate-spin text-brand" />
      <span className="text-xs font-bold text-textMuted">Loading view...</span>
    </div>
  </div>
);

// Student Views (Core)
const StudentOverview = dynamic(
  () => import('@/components/student/StudentOverview').then((m) => m.StudentOverview),
  { loading: ViewLoadingFallback }
);
const StudentProgramView = dynamic(
  () => import('@/components/student/StudentProgramView').then((m) => m.StudentProgramView),
  { loading: ViewLoadingFallback }
);
const StudentSubmissionsView = dynamic(
  () => import('@/components/student/StudentSubmissionsView').then((m) => m.StudentSubmissionsView),
  { loading: ViewLoadingFallback }
);
const StudentRubricsView = dynamic(
  () => import('@/components/student/StudentRubricsView').then((m) => m.StudentRubricsView),
  { loading: ViewLoadingFallback }
);
const StudentOrdersView = dynamic(
  () => import('@/components/student/StudentOrdersView').then((m) => m.StudentOrdersView),
  { loading: ViewLoadingFallback }
);
const StudentCertificateView = dynamic(
  () => import('@/components/student/StudentCertificateView').then((m) => m.StudentCertificateView),
  { loading: ViewLoadingFallback }
);

// Admin Views (Code-Split for Students)
const AdminOverview = dynamic(
  () => import('@/components/admin/AdminOverview').then((m) => m.AdminOverview),
  { loading: ViewLoadingFallback }
);
const AdminAnalyticsView = dynamic(
  () => import('@/components/admin/AdminAnalyticsView').then((m) => m.AdminAnalyticsView),
  { loading: ViewLoadingFallback }
);
const AdminCollegesView = dynamic(
  () => import('@/components/admin/AdminCollegesView').then((m) => m.AdminCollegesView),
  { loading: ViewLoadingFallback }
);
const AdminUsersView = dynamic(
  () => import('@/components/admin/AdminUsersView').then((m) => m.AdminUsersView),
  { loading: ViewLoadingFallback }
);
const AdminProgramsView = dynamic(
  () => import('@/components/admin/AdminProgramsView').then((m) => m.AdminProgramsView),
  { loading: ViewLoadingFallback }
);
const AdminCouponsView = dynamic(
  () => import('@/components/admin/AdminCouponsView').then((m) => m.AdminCouponsView),
  { loading: ViewLoadingFallback }
);
const AdminSubmissionsView = dynamic(
  () => import('@/components/admin/AdminSubmissionsView').then((m) => m.AdminSubmissionsView),
  { loading: ViewLoadingFallback }
);
const AdminOrdersView = dynamic(
  () => import('@/components/admin/AdminOrdersView').then((m) => m.AdminOrdersView),
  { loading: ViewLoadingFallback }
);
const AdminStudentDetailView = dynamic(
  () => import('@/components/admin/AdminStudentDetailView').then((m) => m.AdminStudentDetailView),
  { loading: ViewLoadingFallback }
);
const AdminStudentsListView = dynamic(
  () => import('@/components/admin/AdminStudentsListView').then((m) => m.AdminStudentsListView),
  { loading: ViewLoadingFallback }
);
const AdminCollegeDetailView = dynamic(
  () => import('@/components/admin/AdminCollegeDetailView').then((m) => m.AdminCollegeDetailView),
  { loading: ViewLoadingFallback }
);

// College Views (Code-Split)
const CollegeOverview = dynamic(
  () => import('@/components/college/CollegeOverview').then((m) => m.CollegeOverview),
  { loading: ViewLoadingFallback }
);
const CollegeStudentsView = dynamic(
  () => import('@/components/college/CollegeStudentsView').then((m) => m.CollegeStudentsView),
  { loading: ViewLoadingFallback }
);
const CollegeCouponsView = dynamic(
  () => import('@/components/college/CollegeCouponsView').then((m) => m.CollegeCouponsView),
  { loading: ViewLoadingFallback }
);
const CollegeReportsView = dynamic(
  () => import('@/components/college/CollegeReportsView').then((m) => m.CollegeReportsView),
  { loading: ViewLoadingFallback }
);
const UserProfileView = dynamic(
  () => import('@/components/profile/UserProfileView').then((m) => m.UserProfileView),
  { loading: ViewLoadingFallback }
);

function DashboardContent() {
  const { user, roleName } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || searchParams.get('slug');
  const idParam = searchParams.get('id');

  const [activeSlug, setActiveSlug] = useState<string>(tabParam || 'overview');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    (tabParam === 'students' || tabParam === 'studentdetail') && idParam ? Number(idParam) : null
  );
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(
    (tabParam === 'colleges' || tabParam === 'collegedetail') && idParam ? Number(idParam) : null
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [programsData, setProgramsData] = useState<any[]>([]);
  const [catalogPrograms, setCatalogPrograms] = useState<any[]>([]);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [rubricsList, setRubricsList] = useState<any[]>([]);

  // Super Admin Data State
  const [adminOverviewData, setAdminOverviewData] = useState<any>(null);
  const [adminColleges, setAdminColleges] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);

  // B2B College Data State
  const [collegeOverviewData, setCollegeOverviewData] = useState<any>(null);
  const [collegeStudents, setCollegeStudents] = useState<any[]>([]);
  const [collegeCoupons, setCollegeCoupons] = useState<any[]>([]);
  const [collegeReports, setCollegeReports] = useState<any>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{
    id: number;
    title: string;
    repoUrl?: string;
    workspaceId?: number;
  } | null>(null);

  // Track fetched tabs to avoid redundant re-fetching
  const fetchedTabsRef = useRef<Set<string>>(new Set());

  const currentRole = roleName?.toLowerCase() || 'student';
  const isAdmin = currentRole === 'super_admin' || currentRole === 'admin' || currentRole === 'support';
  const isCollege = currentRole === 'college';

  // Synchronize state with URL parameters
  useEffect(() => {
    if (tabParam && tabParam !== activeSlug) {
      setActiveSlug(tabParam);
    }
    if (idParam) {
      if (tabParam === 'students' || tabParam === 'studentdetail') {
        setSelectedStudentId(Number(idParam));
      } else if (tabParam === 'colleges' || tabParam === 'collegedetail') {
        setSelectedCollegeId(Number(idParam));
      }
    } else {
      setSelectedStudentId(null);
      setSelectedCollegeId(null);
    }
  }, [tabParam, idParam]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      const currentTab = new URLSearchParams(window.location.search).get('tab') || 'overview';
      const currentId = new URLSearchParams(window.location.search).get('id');
      setActiveSlug(currentTab);
      if (currentId) {
        if (currentTab === 'students' || currentTab === 'studentdetail') {
          setSelectedStudentId(Number(currentId));
        } else if (currentTab === 'colleges' || currentTab === 'collegedetail') {
          setSelectedCollegeId(Number(currentId));
        }
      } else {
        setSelectedStudentId(null);
        setSelectedCollegeId(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleOpenSubmissionModal = (
    taskId: number,
    taskTitle: string,
    repoUrl?: string,
    workspaceId?: number
  ) => {
    setSelectedTask({ id: taskId, title: taskTitle, repoUrl, workspaceId });
    setIsModalOpen(true);
  };

  const handleSubmissionSuccess = () => {
    getStudentOverview().then((data) => { if (data) setOverviewData(data); });
    getStudentPrograms().then((progs) => { if (Array.isArray(progs) && progs.length > 0) setProgramsData(progs); });
    getStudentSubmissions().then((subs) => { if (Array.isArray(subs)) setSubmissionsList(subs); });
  };

  // Admin College Handlers
  const handleApproveCollege = async (id: number) => {
    try {
      await updateCollegeStatus(id, 'approved');
      setAdminColleges((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'approved' } : c))
      );
      getAdminOverview().then((updated) => {
        if (updated) setAdminOverviewData(updated);
      });
      showToast.success('College account approved successfully.', 'College Approved');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to approve college', 'Action Failed');
    }
  };

  const handleRejectCollege = async (id: number) => {
    try {
      await updateCollegeStatus(id, 'rejected');
      setAdminColleges((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c))
      );
      getAdminOverview().then((updated) => {
        if (updated) setAdminOverviewData(updated);
      });
      showToast.info('College account has been marked as rejected.', 'College Rejected');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to reject college', 'Action Failed');
    }
  };

  // Admin User Status Handler
  const handleUpdateUserStatus = async (id: number, status: string) => {
    try {
      await updateUserStatus(id, status);
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status } : u))
      );
      showToast.success(`User status updated to "${status}".`, 'Status Updated');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update user status', 'Action Failed');
    }
  };

  // =========================================================================
  // ON-DEMAND (LAZY) TAB DATA FETCHING
  // =========================================================================
  useEffect(() => {
    const tabKey = `${currentRole}:${activeSlug}`;

    if (isAdmin) {
      if (activeSlug === 'overview' && !adminOverviewData) {
        getAdminOverview().then((data) => { if (data) setAdminOverviewData(data); });
      } else if (activeSlug === 'colleges' && adminColleges.length === 0) {
        getAdminColleges().then((colleges) => setAdminColleges(colleges));
      } else if (activeSlug === 'users' && adminUsers.length === 0) {
        getAdminUsers().then((users) => setAdminUsers(users));
      } else if (activeSlug === 'programs' && catalogPrograms.length === 0) {
        getPrograms().then((progs) => setCatalogPrograms(progs));
      }
    } else if (isCollege) {
      if (activeSlug === 'overview' && !collegeOverviewData) {
        getCollegeOverview().then((data) => { if (data) setCollegeOverviewData(data); });
      } else if (activeSlug === 'students' && collegeStudents.length === 0) {
        getCollegeStudents().then((students) => setCollegeStudents(students));
      } else if (activeSlug === 'coupons' && collegeCoupons.length === 0) {
        getCollegeCoupons().then((coupons) => setCollegeCoupons(coupons));
      } else if (activeSlug === 'reports' && !collegeReports) {
        getCollegeReports().then((reports) => setCollegeReports(reports));
      }
    } else {
      // Student on-demand loading
      if (activeSlug === 'overview' && !overviewData) {
        getStudentOverview().then((data) => { if (data) setOverviewData(data); });
        getStudentPrograms().then((progs) => { if (Array.isArray(progs) && progs.length > 0) setProgramsData(progs); });
      } else if (activeSlug === 'program') {
        if (programsData.length === 0) {
          getStudentPrograms().then((progs) => { if (Array.isArray(progs) && progs.length > 0) setProgramsData(progs); });
        }
        if (projects.length === 0) {
          getStudentWorkspace()
            .then((wsProjects) => {
              if (Array.isArray(wsProjects) && wsProjects.length > 0) {
                setProjects(wsProjects);
              } else {
                getProgramByIdOrSlug('fullstack-web-engineering-mern-nextjs')
                  .then((data) => { if (data?.projects) setProjects(data.projects); });
              }
            })
            .catch(() => {
              getProgramByIdOrSlug('fullstack-web-engineering-mern-nextjs')
                .then((data) => { if (data?.projects) setProjects(data.projects); });
            });
        }
      } else if (activeSlug === 'submissions' && submissionsList.length === 0) {
        getStudentSubmissions().then((data) => { if (Array.isArray(data)) setSubmissionsList(data); });
      } else if (activeSlug === 'rubrics' && rubricsList.length === 0) {
        getStudentRubrics().then((data) => { if (Array.isArray(data)) setRubricsList(data); });
      }
    }

    fetchedTabsRef.current.add(tabKey);
  }, [
    activeSlug,
    isAdmin,
    isCollege,
    currentRole,
    adminOverviewData,
    adminColleges.length,
    adminUsers.length,
    catalogPrograms.length,
    collegeOverviewData,
    collegeStudents.length,
    collegeCoupons.length,
    collegeReports,
    overviewData,
    projects.length,
    submissionsList.length,
    rubricsList.length,
  ]);

  const studentObj = (user as any)?.student;
  const firstName = studentObj?.firstName || user?.firstName || '';

  const handleNavigateSlug = (slug: string, id?: number | null) => {
    setActiveSlug(slug);
    if (slug === 'students' || slug === 'studentdetail') {
      setSelectedStudentId(id !== undefined ? id : null);
      setSelectedCollegeId(null);
    } else if (slug === 'colleges' || slug === 'collegedetail') {
      setSelectedCollegeId(id !== undefined ? id : null);
      setSelectedStudentId(null);
    } else {
      setSelectedStudentId(null);
      setSelectedCollegeId(null);
    }

    const url = new URL(window.location.href);
    url.searchParams.set('tab', slug);
    if (id) {
      url.searchParams.set('id', String(id));
    } else {
      url.searchParams.delete('id');
    }
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bgBody">
      <UserSidebar
        activeSlug={activeSlug}
        onSelectSlug={handleNavigateSlug}
        onNavigate={handleNavigateSlug}
      />

      <main className="flex-1 h-full overflow-y-auto p-4 pt-16 sm:p-6 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Super Admin Console Views */}
          {isAdmin ? (
            <Suspense fallback={<ViewLoadingFallback />}>
              {activeSlug === 'overview' && (
                <AdminOverview
                  overviewData={adminOverviewData}
                  onApproveCollege={handleApproveCollege}
                  onRejectCollege={handleRejectCollege}
                  onNavigateSlug={handleNavigateSlug}
                />
              )}

              {activeSlug === 'analytics' && (
                <AdminAnalyticsView />
              )}

              {activeSlug === 'students' && (
                selectedStudentId ? (
                  <AdminStudentDetailView
                    studentId={selectedStudentId}
                    onBack={() => handleNavigateSlug('students')}
                  />
                ) : (
                  <AdminStudentsListView
                    onSelectStudent={(id) => handleNavigateSlug('students', id)}
                  />
                )
              )}

              {activeSlug === 'colleges' && (
                selectedCollegeId ? (
                  <AdminCollegeDetailView
                    collegeId={selectedCollegeId}
                    onBack={() => handleNavigateSlug('colleges')}
                  />
                ) : (
                  <AdminCollegesView
                    colleges={adminColleges}
                    onApproveCollege={handleApproveCollege}
                    onRejectCollege={handleRejectCollege}
                    onSelectCollege={(id) => handleNavigateSlug('colleges', id)}
                  />
                )
              )}

              {activeSlug === 'users' && (
                <AdminUsersView
                  users={adminUsers}
                  onUpdateUserStatus={handleUpdateUserStatus}
                />
              )}

              {activeSlug === 'programs' && (
                <AdminProgramsView
                  programs={catalogPrograms}
                  onProgramUpdated={() => getPrograms().then((progs) => setCatalogPrograms(progs))}
                />
              )}

              {activeSlug === 'coupons' && (
                <AdminCouponsView />
              )}

              {activeSlug === 'submissions' && (
                <AdminSubmissionsView />
              )}

              {activeSlug === 'orders' && (
                <AdminOrdersView />
              )}

              {activeSlug === 'profile' && (
                <UserProfileView />
              )}
            </Suspense>
          ) : isCollege ? (
            /* B2B College Portal Views */
            <Suspense fallback={<ViewLoadingFallback />}>
              {activeSlug === 'overview' && (
                <CollegeOverview
                  overviewData={collegeOverviewData}
                  onNavigateSlug={handleNavigateSlug}
                />
              )}

              {activeSlug === 'students' && (
                <CollegeStudentsView
                  students={collegeStudents}
                />
              )}

              {activeSlug === 'coupons' && (
                <CollegeCouponsView
                  coupons={collegeCoupons}
                />
              )}

              {activeSlug === 'reports' && (
                <CollegeReportsView
                  reportsData={collegeReports}
                />
              )}

              {activeSlug === 'profile' && (
                <UserProfileView />
              )}
            </Suspense>
          ) : (
            /* Student Dashboard Views */
            <Suspense fallback={<ViewLoadingFallback />}>
              {activeSlug === 'overview' && (
                <StudentOverview
                  overview={overviewData}
                  profile={profileData}
                  programs={programsData}
                  projects={projects}
                  onNavigateSlug={handleNavigateSlug}
                  onSelectSlug={handleNavigateSlug}
                  onOpenSubmitModal={handleOpenSubmissionModal}
                />
              )}

              {activeSlug === 'program' && (
                <StudentProgramView
                  programsData={programsData}
                  programs={programsData}
                  projects={projects}
                  onOpenSubmitModal={handleOpenSubmissionModal}
                />
              )}

              {activeSlug === 'submissions' && (
                <StudentSubmissionsView
                  submissions={submissionsList}
                  onNavigateProgram={() => handleNavigateSlug('program')}
                />
              )}

              {activeSlug === 'rubrics' && (
                <StudentRubricsView
                  rubrics={rubricsList}
                />
              )}

              {activeSlug === 'orders' && (
                <StudentOrdersView />
              )}

              {(activeSlug === 'certificate' || activeSlug === 'certificates') && (
                <StudentCertificateView
                  onNavigateToProgram={() => handleNavigateSlug('program')}
                />
              )}

              {activeSlug === 'profile' && (
                <UserProfileView />
              )}
            </Suspense>
          )}
        </div>
      </main>

      {/* Task Submission Modal */}
      {selectedTask && (
        <TaskSubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          repoUrl={selectedTask.repoUrl}
          workspaceId={selectedTask.workspaceId}
          onSubmitSuccess={handleSubmissionSuccess}
          submitFn={submitStudentTask}
        />
      )}
    </div>
  );
}

export default function StudentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-bgBody">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-xs font-bold text-textMuted uppercase tracking-wider">
              Loading Dashboard...
            </p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
