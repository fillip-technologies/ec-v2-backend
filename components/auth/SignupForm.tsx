"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Building,
  Lock,
  CheckCircle2,
  ArrowRight,
  Phone,
  Sparkles,
  BookOpen,
  Calendar,
  Eye,
  EyeOff,
  Search,
  Check,
  Building2,
  Globe,
} from "lucide-react";
import { registerStudent, registerCollege, getPublicColleges, PublicCollegeItem } from "@/lib/api/auth";
import { getCountries } from "@/lib/api/catalog";
import { Country } from "@/types/catalog";
import { getFlagEmoji } from "@/lib/utils/currency";
import { showToast } from "@/lib/toast";
import { SearchableSelect, SearchableSelectOption } from "@/components/shared/SearchableSelect";
import { CustomDropdown } from "@/components/shared/CustomDropdown";

interface SignupFormProps {
  initialRole?: "student" | "college";
}

const START_YEAR = new Date().getFullYear() + 8; // e.g. 2034
const END_YEAR = 1990;
const GRADUATION_YEARS = Array.from(
  { length: START_YEAR - END_YEAR + 1 },
  (_, i) => {
    const yr = START_YEAR - i;
    return { value: yr, label: String(yr) };
  },
);

export const SignupForm: React.FC<SignupFormProps> = ({ initialRole = "student" }) => {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "college">(initialRole);

  const handleRoleSwitch = (newRole: "student" | "college") => {
    setRole(newRole);
    router.replace(`/signup?role=${newRole}`, { scroll: false });
  };

  // Student Fields
  const [studentFirstName, setStudentFirstName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentCountryId, setStudentCountryId] = useState<number | "">("");
  const [studentCollegeSelection, setStudentCollegeSelection] = useState<string | number>("");
  const [studentCustomCollegeName, setStudentCustomCollegeName] = useState("");
  const [studentUsn, setStudentUsn] = useState("");
  const [studentGraduationYear, setStudentGraduationYear] = useState<number | "">("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentConfirmPassword, setStudentConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // College Fields
  const [collegeName, setCollegeName] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [collegePhone, setCollegePhone] = useState("");
  const [collegeCountryId, setCollegeCountryId] = useState<number | "">("");
  const [collegeAddress, setCollegeAddress] = useState("");
  const [collegePassword, setCollegePassword] = useState("");
  const [collegeConfirmPassword, setCollegeConfirmPassword] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedRole, setSubmittedRole] = useState<"student" | "college">("student");
  const [errorMsg, setErrorMsg] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [dbColleges, setDbColleges] = useState<PublicCollegeItem[]>([]);
  const [collegesLoading, setCollegesLoading] = useState<boolean>(true);

  // Fetch approved colleges and active countries on mount
  useEffect(() => {
    let isMounted = true;
    Promise.all([getPublicColleges(), getCountries()])
      .then(([collegesData, countriesData]) => {
        if (isMounted) {
          setDbColleges(collegesData);
          setCountries(countriesData);
          setCollegesLoading(false);
          // Default country to India or first active country
          if (countriesData.length > 0) {
            const india = countriesData.find((c) => c.isoCode.toUpperCase() === "IN");
            const defaultId = india ? india.id : countriesData[0].id;
            setStudentCountryId(defaultId);
            setCollegeCountryId(defaultId);
          }
        }
      })
      .catch(() => {
        if (isMounted) setCollegesLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Format countries for CustomDropdown
  const countryOptions = useMemo(() => {
    return countries.map((c) => ({
      value: c.id,
      label: `${getFlagEmoji(c.isoCode)} ${c.name}`,
      badge: `${c.currencyCode} (${c.isoCode})`,
    }));
  }, [countries]);

  // Format colleges for SearchableSelect
  const collegeSelectOptions: SearchableSelectOption[] = useMemo(() => {
    const list: SearchableSelectOption[] = dbColleges.map((c) => ({
      value: c.id,
      label: c.name,
      subLabel: c.address || undefined,
      badge: "PARTNER CAMPUS",
      icon: <Building className="h-3.5 w-3.5 text-brand" />,
    }));

    // Add "Other" write-in option at the end
    list.push({
      value: "other",
      label: "🏢 Other (Enter unlisted college / university name)",
      subLabel: "Select this if your campus is not listed above",
      badge: "CUSTOM",
      icon: <Building2 className="h-3.5 w-3.5 text-amber-600" />,
    });

    return list;
  }, [dbColleges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (role === "student") {
        if (studentPassword !== studentConfirmPassword) {
          throw new Error("Passwords do not match");
        }

        if (studentPassword.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }

        const isOther = studentCollegeSelection === "other" || studentCollegeSelection === "";
        const collegeId = isOther ? null : Number(studentCollegeSelection);
        const customCollegeName = isOther ? studentCustomCollegeName.trim() : "";

        if (isOther && !customCollegeName) {
          throw new Error("Please enter your college / university name");
        }

        const data = await registerStudent({
          firstName: studentFirstName.trim(),
          lastName: studentLastName.trim(),
          email: studentEmail.toLowerCase().trim(),
          password: studentPassword,
          phoneNo: studentPhone.trim() || undefined,
          countryId: studentCountryId ? Number(studentCountryId) : 1,
          collegeId: collegeId || undefined,
          customCollegeName: customCollegeName || undefined,
          college_name: customCollegeName || undefined,
          usn: studentUsn.trim() || undefined,
          graduationYear: studentGraduationYear ? Number(studentGraduationYear) : undefined,
        });

        if (data.accessToken) {
          localStorage.setItem("token", data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
          }
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        }

        setLoading(false);
        setSubmittedRole("student");
        setSuccess(true);
        showToast.success(
          "Student account created successfully! Welcome to Engineers Clinic.",
          "Registration Complete",
        );
      } else {
        if (collegePassword !== collegeConfirmPassword) {
          throw new Error("Passwords do not match");
        }

        if (collegePassword.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }

        const data = await registerCollege({
          email: collegeEmail.toLowerCase().trim(),
          password: collegePassword,
          phoneNo: collegePhone.trim() || "N/A",
          countryId: collegeCountryId ? Number(collegeCountryId) : 1,
          collegeName: collegeName.trim(),
          address: collegeAddress.trim() || "Campus Address",
        });

        setLoading(false);
        setSubmittedRole("college");
        setSuccess(true);
        showToast.success(
          "College registration submitted! An administrator will review and verify your account.",
          "Registration Submitted",
        );
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || "An error occurred during registration";
      setErrorMsg(msg);
      showToast.error(msg, "Registration Failed");
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-[2rem] border border-borderLight bg-white/40 p-4 shadow-2xl backdrop-blur-2xl">
        <div className="rounded-[1.75rem] border border-white/80 bg-white/95 p-6 sm:p-8 shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-borderLight pb-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  {success
                    ? submittedRole === "college"
                      ? "College Partnership Application"
                      : "Student Intern Registration"
                    : role === "student"
                    ? "Student Intern Registration"
                    : "Partner College Registration"}
                </span>
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-textPrimary tracking-tight">
                {success
                  ? submittedRole === "college"
                    ? "Application Received"
                    : "Welcome to the Platform"
                  : "Create your account"}
              </h2>
            </div>

            {/* Role Toggle Switch (Only visible before submission) */}
            {!success && (
              <div className="inline-flex rounded-full bg-bgSoft p-1 border border-borderLight self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleRoleSwitch("student")}
                  className={`rounded-full px-5 py-2 text-xs font-black transition cursor-pointer ${
                    role === "student"
                      ? "bg-brand text-white shadow-md"
                      : "text-textSecondary hover:text-brand"
                  }`}
                >
                  Student Intern
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch("college")}
                  className={`rounded-full px-5 py-2 text-xs font-black transition cursor-pointer ${
                    role === "college"
                      ? "bg-brand text-white shadow-md"
                      : "text-textSecondary hover:text-brand"
                  }`}
                >
                  College Partner
                </button>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800">
              {errorMsg}
            </div>
          )}

          {success ? (
            <div className="my-8 rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-8 text-center text-emerald-900 space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-black">
                  {submittedRole === "college" ? "Institutional Registration Submitted!" : "Welcome to Engineers Clinic!"}
                </h3>
                <p className="mt-2 text-xs font-medium text-emerald-800 max-w-md mx-auto">
                  {submittedRole === "college"
                    ? "Your college partner application has been recorded. Our administrative team will verify your institutional credentials and notify you upon activation."
                    : "Your student profile is now configured. You can start exploring programs, redeem college coupons, and unlock industry projects."}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {submittedRole === "student" ? (
                  <Link
                    href="/student"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-xs font-black text-white shadow-md transition hover:bg-brandHover"
                  >
                    <span>Launch Student Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-xs font-black text-white shadow-md transition hover:bg-brandHover"
                  >
                    <span>Proceed to Login</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {role === "student" ? (
                /* ================= STUDENT FORM FIELDS ================= */
                <>
                  {/* First Name & Last Name Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-textPrimary">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                        <input
                          type="text"
                          required
                          value={studentFirstName}
                          onChange={(e) => setStudentFirstName(e.target.value)}
                          placeholder="e.g. Aditya"
                          className="w-full rounded-xl border border-borderLight bg-bgSoft/50 pl-10 pr-4 py-2.5 text-xs font-bold text-textPrimary outline-hidden transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-textPrimary">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                        <input
                          type="text"
                          required
                          value={studentLastName}
                          onChange={(e) => setStudentLastName(e.target.value)}
                          placeholder="e.g. Sharma"
                          className="w-full rounded-xl border border-borderLight bg-bgSoft/50 pl-10 pr-4 py-2.5 text-xs font-bold text-textPrimary outline-hidden transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email & Phone Number Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-textPrimary">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                        <input
                          type="email"
                          required
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          placeholder="aditya@example.com"
                          className="w-full rounded-xl border border-borderLight bg-bgSoft/50 pl-10 pr-4 py-2.5 text-xs font-bold text-textPrimary outline-hidden transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-textPrimary">
                        Phone Number
                      </label>
                      <div className="relative mt-1.5">
                        <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                        <input
                          type="tel"
                          value={studentPhone}
                          onChange={(e) => setStudentPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full rounded-xl border border-borderLight bg-bgSoft/50 pl-10 pr-4 py-2.5 text-xs font-bold text-textPrimary outline-hidden transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Country Dropdown */}
                  <div>
                    <CustomDropdown
                      label="Country / Region"
                      required
                      placeholder="Select your country..."
                      options={countryOptions}
                      value={studentCountryId}
                      onChange={(val) => setStudentCountryId(val ? Number(val) : "")}
                      icon={<Globe className="h-3.5 w-3.5 text-brand" />}
                    />
                  </div>

                  {/* College / Institution Searchable Dropdown */}
                  <div>
                    <SearchableSelect
                      label="College / University"
                      required
                      placeholder="Search or select your college campus..."
                      searchPlaceholder="Type to search partner colleges..."
                      options={collegeSelectOptions}
                      value={studentCollegeSelection}
                      onChange={(val) => {
                        setStudentCollegeSelection(val);
                        if (val !== "other") {
                          setStudentCustomCollegeName("");
                        }
                      }}
                      emptyMessage="College not found in partner list."
                      allowCustomAction={{
                        label: "Not listed? Click to enter custom college name",
                        action: (query) => {
                          setStudentCollegeSelection("other");
                          if (query.trim()) {
                            setStudentCustomCollegeName(query.trim());
                          }
                        },
                      }}
                    />
                  </div>

                  {/* Custom College Name Input (Shows if 'other' is chosen or not found) */}
                  {studentCollegeSelection === "other" && (
                    <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-2 animate-in fade-in duration-150">
                      <label className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-amber-600" />
                        <span>Enter Your College / University Name <span className="text-rose-500">*</span></span>
                      </label>
                      <input
                        type="text"
                        required
                        value={studentCustomCollegeName}
                        onChange={(e) => setStudentCustomCollegeName(e.target.value)}
                        placeholder="e.g. National Institute of Technology Calicut"
                        className="w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-xs font-bold text-textPrimary outline-hidden transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                        autoFocus
                      />
                      <p className="text-[11px] text-amber-800">
                        Your university will be recorded and linked to your student profile and completion certificate.
                      </p>
                    </div>
                  )}

                  {/* Roll No / USN & Graduation Year Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-textPrimary">
                        University Roll No / USN (Optional)
                      </label>
                      <div className="relative mt-1.5">
                        <BookOpen className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                        <input
                          type="text"
                          value={studentUsn}
                          onChange={(e) => setStudentUsn(e.target.value.toUpperCase())}
                          placeholder="e.g. 1RA22CS045"
                          className="w-full rounded-xl border border-borderLight bg-bgSoft/50 pl-10 pr-4 py-2.5 text-xs font-bold text-textPrimary uppercase outline-hidden transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    </div>

                    <div>
                      <CustomDropdown
                        label="Expected Graduation Year"
                        placeholder="Select Year..."
                        options={GRADUATION_YEARS}
                        value={studentGraduationYear}
                        onChange={(val) =>
                          setStudentGraduationYear(val ? Number(val) : "")
                        }
                        icon={<Calendar className="h-3.5 w-3.5" />}
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-textPrimary">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="w-full rounded-xl border border-borderLight bg-bgSoft/50 pl-10 pr-10 py-2.5 text-xs font-bold text-textPrimary outline-hidden transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-textPrimary">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={studentConfirmPassword}
                          onChange={(e) => setStudentConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full rounded-xl border border-borderLight bg-bgSoft/50 pl-10 pr-4 py-2.5 text-xs font-bold text-textPrimary outline-hidden transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* ================= COLLEGE PARTNER FORM FIELDS ================= */
                <>
                  <div>
                    <label className="text-xs font-bold text-textPrimary">
                      College / Institution Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                      <input
                        type="text"
                        required
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        placeholder="e.g. Vellore Institute of Technology"
                        className="w-full rounded-xl border border-borderLight bg-bgSoft/50 pl-10 pr-4 py-2.5 text-xs font-bold text-textPrimary outline-hidden transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-textPrimary">
                        Official TPO / Dean Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                        <input
                          type="email"
                          required
                          value={collegeEmail}
                          onChange={(e) => setCollegeEmail(e.target.value)}
                          placeholder="tpo@university.edu"
                          className="w-full rounded-xl border border-borderLight bg-bgSoft/50 pl-10 pr-4 py-2.5 text-xs font-bold text-textPrimary outline-hidden transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-textPrimary">
                        Contact Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                        <input
                          type="tel"
                          required
                          value={collegePhone}
                          onChange={(e) => setCollegePhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full rounded-xl border border-borderLight bg-bgSoft/50 pl-10 pr-4 py-2.5 text-xs font-bold text-textPrimary outline-hidden transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Country & Campus Address Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <CustomDropdown
                        label="Country / Region"
                        required
                        placeholder="Select country..."
                        options={countryOptions}
                        value={collegeCountryId}
                        onChange={(val) => setCollegeCountryId(val ? Number(val) : "")}
                        icon={<Globe className="h-3.5 w-3.5 text-brand" />}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-textPrimary">
                        Physical Campus Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={collegeAddress}
                        onChange={(e) => setCollegeAddress(e.target.value)}
                        placeholder="e.g. Katpadi, Vellore, Tamil Nadu"
                        className="mt-1.5 w-full rounded-xl border border-borderLight bg-bgSoft/50 px-4 py-2.5 text-xs font-bold text-textPrimary outline-hidden transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                  </div>

                  {/* Password Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-textPrimary">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={collegePassword}
                          onChange={(e) => setCollegePassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="w-full rounded-xl border border-borderLight bg-bgSoft/50 pl-10 pr-10 py-2.5 text-xs font-bold text-textPrimary outline-hidden transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-textPrimary">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={collegeConfirmPassword}
                          onChange={(e) => setCollegeConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className="w-full rounded-xl border border-borderLight bg-bgSoft/50 pl-10 pr-4 py-2.5 text-xs font-bold text-textPrimary outline-hidden transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-xs font-black text-white shadow-md hover:bg-brandHover transition cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create {role === "student" ? "Student" : "College"} Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs font-bold text-textMuted">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-black text-brand transition hover:text-textPrimary"
                  >
                    Log in here
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
