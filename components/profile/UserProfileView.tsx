'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  School,
  Shield,
  Crown,
  KeyRound,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Building,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { getAuthProfile, updateAuthProfile, changeAuthPassword, getPublicColleges } from '@/lib/api/auth';
import { getCountries } from '@/lib/api/catalog';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SpinnerCard } from '@/components/ui/Spinner';
import { CustomDropdown } from '@/components/shared/CustomDropdown';
import { showToast } from '@/lib/toast';

export const UserProfileView: React.FC = () => {
  const { user: authUser, roleName } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('primary');

  // Metadata dropdowns
  const [countries, setCountries] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);

  // Form State
  const [phoneNo, setPhoneNo] = useState('');
  const [countryId, setCountryId] = useState<number | string>('');

  // Student specific state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [collegeId, setCollegeId] = useState<number | string>('');
  const [customCollegeName, setCustomCollegeName] = useState('');
  const [usn, setUsn] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState<number | string>('');

  // College specific state
  const [collegeName, setCollegeName] = useState('');
  const [collegeAddress, setCollegeAddress] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const fetchFullProfile = async () => {
    try {
      setLoading(true);
      const [profData, countriesData, collegesData] = await Promise.all([
        getAuthProfile(),
        getCountries().catch(() => []),
        getPublicColleges().catch(() => []),
      ]);

      setProfile(profData);
      setCountries(countriesData || []);
      setColleges(collegesData || []);

      // Populate form state
      setPhoneNo(profData.phoneNo || '');
      setCountryId(profData.countryId || profData.country?.id || '');

      if (profData.student) {
        setFirstName(profData.student.firstName || '');
        setLastName(profData.student.lastName || '');
        setCollegeId(profData.student.collegeId || '');
        setCustomCollegeName(profData.student.customCollegeName || '');
        setUsn(profData.student.usn || '');
        setBranch(profData.student.branch || '');
        setGraduationYear(profData.student.graduationYear || '');
      }

      if (profData.collegeMembers && profData.collegeMembers.length > 0) {
        const col = profData.collegeMembers[0].college;
        if (col) {
          setCollegeName(col.name || '');
          setCollegeAddress(col.address || '');
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      if (authUser) {
        setProfile(authUser);
        setPhoneNo(authUser.phoneNo || '');
        setCountryId(authUser.countryId || '');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullProfile();
  }, []);

  const currentRole = roleName?.toLowerCase() || profile?.role?.name?.toLowerCase() || 'student';
  const isStudent = currentRole === 'student';
  const isCollege = currentRole === 'college';
  const isAdmin = currentRole === 'admin' || currentRole === 'support';
  const isSuperAdmin = currentRole === 'super_admin';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: any = {
        phoneNo,
        countryId: countryId ? Number(countryId) : undefined,
      };

      if (isStudent) {
        payload.firstName = firstName;
        payload.lastName = lastName;
        payload.collegeId = collegeId ? Number(collegeId) : null;
        payload.customCollegeName = !collegeId ? customCollegeName : null;
        payload.usn = usn;
        payload.branch = branch;
        payload.graduationYear = graduationYear ? Number(graduationYear) : null;
      }

      if (isCollege) {
        payload.collegeName = collegeName;
        payload.collegeAddress = collegeAddress;
      }

      const updated = await updateAuthProfile(payload);
      setProfile(updated);
      showToast.success('Profile details updated successfully!', 'Profile Updated');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update profile', 'Update Failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast.error('Please enter your current password', 'Validation Error');
      return;
    }
    if (newPassword.length < 6) {
      showToast.error('New password must be at least 6 characters', 'Validation Error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast.error('New password and confirm password do not match', 'Validation Error');
      return;
    }

    try {
      setUpdatingPassword(true);
      await changeAuthPassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast.success('Account password updated successfully!', 'Password Changed');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update password', 'Error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return <SpinnerCard label="Loading account profile..." />;
  }

  // Hero Display Info
  const displayName = isStudent
    ? `${profile?.student?.firstName || ''} ${profile?.student?.lastName || ''}`.trim() || profile?.email
    : isCollege
    ? profile?.collegeMembers?.[0]?.college?.name || profile?.email
    : isSuperAdmin
    ? 'Super Administrator'
    : 'System Administrator';

  const userRoleDisplay = isStudent
    ? 'STUDENT'
    : isCollege
    ? 'COLLEGE'
    : isSuperAdmin
    ? 'SUPER_ADMIN'
    : 'ADMIN';

  const initialLetter = (displayName?.[0] || profile?.email?.[0] || 'U').toUpperCase();

  const countryDropdownOptions = countries.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.isoCode})`,
    badge: c.currencyCode,
  }));

  const collegeDropdownOptions = [
    { value: '', label: 'Other / Unlisted Institution' },
    ...colleges.map((col) => ({
      value: col.id,
      label: col.name,
      subLabel: col.address,
    })),
  ];

  const graduationYearOptions = [2023, 2024, 2025, 2026, 2027, 2028, 2029].map((yr) => ({
    value: yr,
    label: String(yr),
  }));

  return (
    <div className="space-y-6">
      {/* 1. Profile Hero Dossier Card */}
      <div className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand font-black text-2xl border-2 border-brand/20 shadow-xs">
              {isSuperAdmin ? (
                <Crown className="h-9 w-9 text-amber-500" />
              ) : isCollege ? (
                <School className="h-9 w-9 text-brand" />
              ) : isAdmin ? (
                <Shield className="h-9 w-9 text-brand" />
              ) : (
                <span>{initialLetter}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-textPrimary tracking-tight">
                  {displayName}
                </h1>
                <StatusBadge status={userRoleDisplay} size="sm" />
                <StatusBadge status={profile?.status || 'ACTIVE'} size="sm" />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-textMuted mt-1.5">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-brand" />
                  <span>{profile?.email}</span>
                </span>
                {profile?.phoneNo && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-brand" />
                    <span>{profile.phoneNo}</span>
                  </span>
                )}
                {profile?.country && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-brand" />
                    <span>{profile.country.name} ({profile.country.isoCode})</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted block">
              Member Since
            </span>
            <span className="text-xs font-bold text-textPrimary">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex items-center gap-2 border-b border-borderLight pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('primary')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'primary'
                ? 'bg-brand text-white shadow-xs'
                : 'bg-bgSoft text-textSecondary hover:text-textPrimary hover:bg-borderLight'
            }`}
          >
            {isStudent
              ? 'Personal Details'
              : isCollege
              ? 'College Details'
              : isSuperAdmin
              ? 'Master Account'
              : 'Admin Account'}
          </button>

          {isStudent && (
            <button
              onClick={() => setActiveTab('academic')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeTab === 'academic'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-bgSoft text-textSecondary hover:text-textPrimary hover:bg-borderLight'
              }`}
            >
              Academic Details
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeTab === 'permissions'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-bgSoft text-textSecondary hover:text-textPrimary hover:bg-borderLight'
              }`}
            >
              Assigned Permissions
            </button>
          )}

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'security'
                ? 'bg-brand text-white shadow-xs'
                : 'bg-bgSoft text-textSecondary hover:text-textPrimary hover:bg-borderLight'
            }`}
          >
            Security & Password
          </button>
        </div>
      </div>

      {/* 2. TAB: Primary Account / Personal Info */}
      {activeTab === 'primary' && (
        <form onSubmit={handleSaveProfile} className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-borderLight pb-4">
            <h2 className="text-base font-black text-textPrimary">
              {isStudent
                ? 'Personal & Account Details'
                : isCollege
                ? 'Institution Record & Contact'
                : isSuperAdmin
                ? 'Master Account Details'
                : 'Admin Account Information'}
            </h2>
            <p className="text-xs text-textMuted mt-0.5">
              Information directly associated with your account in the system database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* If Student: First & Last Name */}
            {isStudent && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-textPrimary">First Name (first_name)</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-textPrimary">Last Name (last_name)</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* If College: College Name & Address */}
            {isCollege && (
              <>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-textPrimary">College / University Name (name)</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-textPrimary">Campus Address (address)</label>
                  <input
                    type="text"
                    value={collegeAddress}
                    onChange={(e) => setCollegeAddress(e.target.value)}
                    required
                    className="w-full rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* Email (Read Only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textPrimary">Email Address (email)</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full rounded-xl border border-borderLight bg-bgSoft/50 px-3.5 py-2.5 text-xs font-bold text-textMuted cursor-not-allowed"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textPrimary">Phone Number (phone_no)</label>
              <input
                type="tel"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand focus:outline-none"
              />
            </div>

            {/* Country with CustomDropdown */}
            <CustomDropdown
              label="Country / Region (country_id)"
              value={countryId}
              onChange={(val) => setCountryId(val)}
              options={countryDropdownOptions}
              placeholder="Select Country"
            />

            {/* Status (Read Only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textPrimary">Account Status (status)</label>
              <input
                type="text"
                value={profile?.status || 'ACTIVE'}
                disabled
                className="w-full rounded-xl border border-borderLight bg-bgSoft/50 px-3.5 py-2.5 text-xs font-bold text-textMuted cursor-not-allowed uppercase"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-borderLight">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white font-extrabold text-xs shadow-xs hover:bg-brandHover transition cursor-pointer disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. TAB: Student Academic Details */}
      {isStudent && activeTab === 'academic' && (
        <form onSubmit={handleSaveProfile} className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-borderLight pb-4">
            <h2 className="text-base font-black text-textPrimary">Academic Details</h2>
            <p className="text-xs text-textMuted mt-0.5">
              University registration, branch, and graduation timeline (students table).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* College Institution CustomDropdown */}
            <CustomDropdown
              label="Enrolled College (college_id)"
              value={collegeId}
              onChange={(val) => {
                setCollegeId(val);
                if (val) {
                  setCustomCollegeName('');
                }
              }}
              options={collegeDropdownOptions}
              placeholder="Select Enrolled College"
            />

            {/* Custom College Name: Shown ONLY when no registered college is selected */}
            {(!collegeId || collegeId === '') && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textPrimary">Custom College Name (custom_college_name)</label>
                <input
                  type="text"
                  value={customCollegeName}
                  onChange={(e) => setCustomCollegeName(e.target.value)}
                  placeholder="Enter your college / university name"
                  className="w-full rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand focus:outline-none"
                />
              </div>
            )}

            {/* USN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textPrimary">University Serial Number (usn)</label>
              <input
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                placeholder="e.g. 1VE21CS048"
                className="w-full rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand focus:outline-none"
              />
            </div>

            {/* Branch */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textPrimary">Branch / Department (branch)</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand focus:outline-none"
              />
            </div>

            {/* Graduation Year with CustomDropdown */}
            <CustomDropdown
              label="Graduation Year (graduation_year)"
              value={graduationYear}
              onChange={(val) => setGraduationYear(val)}
              options={graduationYearOptions}
              placeholder="Select Graduation Year"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-borderLight">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white font-extrabold text-xs shadow-xs hover:bg-brandHover transition cursor-pointer disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Academic Details'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. TAB: Admin Assigned Permissions */}
      {isAdmin && activeTab === 'permissions' && (
        <div className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-borderLight pb-4">
            <h2 className="text-base font-black text-textPrimary">Assigned Role Permissions</h2>
            <p className="text-xs text-textMuted mt-0.5">
              Active operational privileges granted to role &quot;{profile?.role?.name || 'admin'}&quot;.
            </p>
          </div>

          {Array.isArray(profile?.role?.permissions) && profile.role.permissions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {profile.role.permissions.map((rp: any, idx: number) => {
                const perm = rp.permission;
                return (
                  <div key={idx} className="p-3.5 rounded-xl border border-borderLight bg-bgSoft/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-textPrimary">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{perm?.name || perm?.slug}</span>
                    </div>
                    <div className="text-[11px] font-mono text-brand font-semibold">{perm?.slug}</div>
                    {perm?.module && (
                      <div className="text-[10px] uppercase font-extrabold text-textMuted">
                        Module: {perm.module}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-bgSoft text-center text-xs font-bold text-textMuted">
              Full Administrator Privileges Assigned
            </div>
          )}
        </div>
      )}

      {/* 5. TAB: Security & Password Update */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className="rounded-[28px] border border-borderLight bg-white p-6 sm:p-8 shadow-xs space-y-6 max-w-xl">
          <div className="border-b border-borderLight pb-4">
            <h2 className="text-base font-black text-textPrimary">Change Account Password</h2>
            <p className="text-xs text-textMuted mt-0.5">
              Ensure your account is secured with a strong password (minimum 6 characters).
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textPrimary">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-borderLight bg-bgSoft pl-3.5 pr-10 py-2.5 text-xs font-bold text-textPrimary focus:border-brand focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textPrimary">New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password (min 6 chars)"
                className="w-full rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textPrimary">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-borderLight bg-bgSoft px-3.5 py-2.5 text-xs font-bold text-textPrimary focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-borderLight flex justify-end">
            <button
              type="submit"
              disabled={updatingPassword}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white font-extrabold text-xs shadow-xs hover:bg-brandHover transition cursor-pointer disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" />
              <span>{updatingPassword ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
