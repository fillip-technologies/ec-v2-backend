'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import roleSidebarConfig from '@/config/roleSidebarConfig.json';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Send,
  ClipboardList,
  Award,
  CreditCard,
  Ticket,
  BarChart3,
  Users,
  User,
  LogOut,
  GraduationCap,
  School,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

export interface UserSidebarProps {
  activeSlug: string;
  onSelectSlug?: (slug: string) => void;
  onNavigate?: (slug: string) => void;
  onOpenProfile?: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({
  activeSlug,
  onSelectSlug,
  onNavigate,
  onOpenProfile,
}) => {
  const { user, roleName, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleSelectSlug = (slug: string) => {
    if (typeof onSelectSlug === 'function') {
      onSelectSlug(slug);
    } else if (typeof onNavigate === 'function') {
      onNavigate(slug);
    }
  };

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      // Auto-collapse on tablet and mobile (< 1024px)
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userRole = roleName || 'student';

  // Load sidebar config dynamically based on active user role from JSON
  const roleConfig =
    (roleSidebarConfig as Record<string, any>)[userRole] || roleSidebarConfig.student;

  const getIconForSlug = (slug: string, isCompact = false) => {
    const iconClass = isCompact ? 'h-5 w-5 shrink-0' : 'h-4 w-4 shrink-0';
    switch (slug) {
      case 'overview':
        return <LayoutDashboard className={iconClass} />;
      case 'analytics':
        return <BarChart3 className={iconClass} />;
      case 'projects':
      case 'programs':
      case 'program':
        return <FolderKanban className={iconClass} />;
      case 'submissions':
        return <Send className={iconClass} />;
      case 'rubrics':
        return <ClipboardList className={iconClass} />;
      case 'certificate':
        return <Award className={iconClass} />;
      case 'orders':
      case 'payments':
        return <CreditCard className={iconClass} />;
      case 'coupons':
        return <Ticket className={iconClass} />;
      case 'reports':
        return <BarChart3 className={iconClass} />;
      case 'students':
        return <GraduationCap className={iconClass} />;
      case 'colleges':
        return <School className={iconClass} />;
      case 'users':
        return <Users className={iconClass} />;
      case 'profile':
        return <User className={iconClass} />;
      default:
        return <FolderKanban className={iconClass} />;
    }
  };

  const studentObj = (user as any)?.student;
  const firstName = studentObj?.firstName || user?.firstName || '';
  const lastName = studentObj?.lastName || user?.lastName || '';

  const displayName = mounted
    ? (firstName || lastName)
      ? `${firstName} ${lastName}`.trim()
      : user?.email
      ? user.email.split('@')[0]
      : 'Account'
    : 'Account';

  const avatarInitials = mounted
    ? firstName
      ? `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase()
      : user?.email
      ? user.email[0].toUpperCase()
      : 'U'
    : 'U';

  const userEmailDisplay = mounted ? user?.email || 'Logged in user' : 'Logged in user';

  const handleItemClick = (slug: string) => {
    handleSelectSlug(slug);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* 1. Mobile Floating Hamburger Toggle (< 768px when drawer is closed) */}
      <button
        type="button"
        onClick={() => setMobileDrawerOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2.5 rounded-2xl bg-white border border-borderLight shadow-md text-textPrimary hover:text-brand transition cursor-pointer"
        title="Open Navigation Menu"
        aria-label="Open Navigation Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* 2. Mobile Backdrop Drawer Overlay (< 768px) */}
      {mobileDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-white p-5 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Mobile Drawer Header */}
              <div className="flex items-center justify-between pb-2 border-b border-borderLight/60">
                <Link
                  href="/"
                  className="block transition-opacity hover:opacity-85"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <Image
                    src="/images/Engineers-clinic-logo-black.png"
                    alt="Engineers Clinic"
                    width={180}
                    height={46}
                    priority
                    className="h-10 w-auto max-w-full object-contain"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-bgSoft text-textMuted hover:text-textPrimary transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div
                className="text-[10px] font-extrabold text-textMuted uppercase tracking-widest px-1"
                suppressHydrationWarning
              >
                {roleConfig.roleName || 'Student Portal'}
              </div>

              {/* Dynamic Navigation Groups */}
              {roleConfig.groups?.map((group: any) => (
                <div key={group.id} className="space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-textMuted px-2">
                    {group.label}
                  </div>

                  <nav className="space-y-1">
                    {group.items
                      ?.filter((item: any) => item.enabled !== false)
                      .map((item: any) => {
                        const isActive = activeSlug === item.slug;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleItemClick(item.slug)}
                            className={`w-full flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-xs font-bold transition-all text-left cursor-pointer ${
                              isActive
                                ? 'bg-brand text-white shadow-xs'
                                : 'text-textPrimary hover:bg-bgSoft hover:text-brand'
                            }`}
                          >
                            {getIconForSlug(item.slug)}
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                  </nav>
                </div>
              ))}
            </div>

            {/* Mobile Drawer Bottom User Card */}
            <div className="mt-6 pt-4 border-t border-borderLight/60">
              <div className="flex items-center justify-between gap-2 rounded-[20px] bg-bgSoft p-2.5 border border-borderLight/60">
                <button
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile();
                    else handleSelectSlug('profile');
                    setMobileDrawerOpen(false);
                  }}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left group cursor-pointer"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand font-black text-xs group-hover:bg-brand group-hover:text-white transition-all"
                    suppressHydrationWarning
                  >
                    {avatarInitials}
                  </div>
                  <div className="flex-1 truncate">
                    <div
                      className="text-xs font-extrabold text-textPrimary truncate group-hover:text-brand transition-all"
                      suppressHydrationWarning
                    >
                      {displayName}
                    </div>
                    <div
                      className="text-[10px] font-medium text-textMuted truncate"
                      suppressHydrationWarning
                    >
                      {userEmailDisplay}
                    </div>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-dangerLight text-danger hover:bg-danger hover:text-white transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Desktop & Tablet Pinned Sidebar */}
      <aside
        className={`hidden md:flex h-full shrink-0 border-r border-borderLight bg-white flex-col justify-between overflow-y-auto transition-all duration-300 ease-in-out selection:bg-brand selection:text-white ${
          isCollapsed ? 'w-20 p-3' : 'w-64 p-5'
        }`}
      >
        <div className="space-y-6">
          {/* Header Bar with Logo (Clean without top toggle) */}
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <div className="flex-1 min-w-0 px-1 pt-1">
                <Link
                  href="/"
                  className="block transition-opacity hover:opacity-85"
                  aria-label="Engineers Clinic Home"
                >
                  <Image
                    src="/images/Engineers-clinic-logo-black.png"
                    alt="Engineers Clinic"
                    width={220}
                    height={56}
                    priority
                    className="h-11 w-auto max-w-full object-contain"
                  />
                </Link>
                <div
                  className="text-[10px] font-extrabold text-textMuted uppercase tracking-widest mt-1.5 px-1 truncate"
                  suppressHydrationWarning
                >
                  {roleConfig.roleName || 'Student Portal'}
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center pt-1">
                <Link
                  href="/"
                  className="h-10 w-10 rounded-2xl flex items-center justify-center transition"
                  title="Engineers Clinic Home"
                >
                  <Image
                    src="/images/Engineers-clinic-short.png"
                    alt="EC"
                    width={56}
                    height={56}
                    priority
                    className="h-11 w-auto max-w-full object-contain"
                  />
                </Link>
              </div>
            )}
          </div>

          <hr className="border-borderLight/60" />

          {/* Dynamic Navigation Groups from JSON */}
          {roleConfig.groups?.map((group: any) => (
            <div key={group.id} className="space-y-1.5">
              {!isCollapsed && (
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-textMuted px-2">
                  {group.label}
                </div>
              )}

              <nav className={`space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                {group.items
                  ?.filter((item: any) => item.enabled !== false)
                  .map((item: any) => {
                    const isActive = activeSlug === item.slug;

                    if (isCollapsed) {
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectSlug(item.slug)}
                          className={`h-11 w-11 flex items-center justify-center rounded-2xl transition-all cursor-pointer group relative ${
                            isActive
                              ? 'bg-brand text-white shadow-xs scale-105'
                              : 'text-textPrimary hover:bg-bgSoft hover:text-brand'
                          }`}
                          title={item.label}
                        >
                          {getIconForSlug(item.slug, true)}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectSlug(item.slug)}
                        className={`w-full flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-xs font-bold transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-brand text-white shadow-xs'
                            : 'text-textPrimary hover:bg-bgSoft hover:text-brand'
                        }`}
                      >
                        {getIconForSlug(item.slug)}
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Bottom Area: Collapse Button + Profile Footer */}
        <div className="mt-6 pt-3 border-t border-borderLight/60 space-y-3">
          {/* Collapse/Expand Toggle Button (Just above profile section) */}
          {!isCollapsed ? (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="w-full flex items-center gap-3 rounded-[14px] px-3 py-2 text-xs font-extrabold text-textMuted hover:bg-bgSoft hover:text-brand transition-all text-left cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Collapse</span>
            </button>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="h-10 w-10 flex items-center justify-center rounded-2xl text-textMuted hover:bg-bgSoft hover:text-brand transition-all cursor-pointer"
                title="Expand Sidebar"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* User Profile & Logout Section */}
          {!isCollapsed ? (
            /* Expanded Footer: Avatar + Name + Logout */
            <div className="flex items-center justify-between gap-2 rounded-[20px] bg-bgSoft p-2.5 border border-borderLight/60">
              <button
                onClick={() => {
                  if (onOpenProfile) onOpenProfile();
                  else handleSelectSlug('profile');
                }}
                className="flex items-center gap-2.5 flex-1 min-w-0 text-left group cursor-pointer"
                title="Open Profile"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand font-black text-xs group-hover:bg-brand group-hover:text-white transition-all"
                  suppressHydrationWarning
                >
                  {avatarInitials}
                </div>
                <div className="flex-1 truncate">
                  <div
                    className="text-xs font-extrabold text-textPrimary truncate group-hover:text-brand transition-all"
                    suppressHydrationWarning
                  >
                    {displayName}
                  </div>
                  <div
                    className="text-[10px] font-medium text-textMuted truncate"
                    suppressHydrationWarning
                  >
                    {userEmailDisplay}
                  </div>
                </div>
              </button>

              <button
                onClick={logout}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-dangerLight text-danger hover:bg-danger hover:text-white transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* Collapsed Footer: Compact Centered Avatar + Logout */
            <div className="flex flex-col items-center gap-2.5">
              <button
                onClick={() => {
                  if (onOpenProfile) onOpenProfile();
                  else handleSelectSlug('profile');
                }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand font-black text-xs hover:bg-brand hover:text-white transition-all cursor-pointer shadow-2xs"
                title={`${displayName} (Profile)`}
                suppressHydrationWarning
              >
                {avatarInitials}
              </button>
              <button
                onClick={logout}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-dangerLight text-danger hover:bg-danger hover:text-white transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

