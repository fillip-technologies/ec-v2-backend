"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/api/auth";
import { showToast } from "@/lib/toast";

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      // Authenticate with Email & Password (backend automatically determines user role)
      const data = await login({
        email,
        password,
      });

      // Store JWT Tokens in localStorage
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setLoading(false);
      const rawRole = data.user?.role?.name || data.user?.role || "";
      const userRole = typeof rawRole === "string" ? rawRole.toLowerCase() : "";
      const userName = data.user?.firstName ? `${data.user.firstName}` : data.user?.email || 'User';

      showToast.flash(
        'success',
        `Welcome back, ${userName}! Logged in successfully.`,
        'Authenticated'
      );

      if (userRole === "super_admin" || userRole === "admin" || userRole === "support") {
        window.location.href = "/admin";
      } else if (userRole === "college") {
        window.location.href = "/college";
      } else {
        window.location.href = "/student";
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || "Invalid email or password";
      setErrorMessage(msg);
      showToast.error(msg, "Login Failed");
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-[2rem] border border-white/50 bg-white/25 p-4 shadow-2xl shadow-brand/10 backdrop-blur-2xl">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          {/* Header */}
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-brand">
              Secure Portal
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-textPrimary">
              Login to Account
            </h2>
            <p className="mt-2 text-sm leading-6 text-textMuted">
              Enter your registered email and password to access your dashboard
            </p>
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-dangerBorder bg-dangerLight px-4 py-3 text-sm text-dangerDark font-medium">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email Field */}
            <div>
              <label className="text-sm font-bold text-textPrimary">Email Address</label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu or personal email"
                  className="w-full rounded-2xl border border-borderLight bg-surface pl-11 pr-4 py-3.5 text-sm text-textPrimary outline-none transition placeholder:text-textMuted focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-textPrimary">Password</label>
              </div>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full rounded-2xl border border-borderLight bg-surface pl-11 pr-11 py-3.5 text-sm text-textPrimary outline-none transition placeholder:text-textMuted focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary transition cursor-pointer p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-brandLight px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition hover:scale-[1.01] cursor-pointer disabled:opacity-70"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Registration Options */}
            <div className="mt-8 pt-6 border-t border-borderLight/60 text-center space-y-2">
              <p className="text-xs text-textMuted font-medium">
                New to Engineers Clinic?
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-extrabold">
                <Link
                  href="/signup?role=student"
                  className="text-brand hover:underline"
                >
                  Sign up as Student
                </Link>
                <span className="text-borderLight">•</span>
                <Link
                  href="/signup?role=college"
                  className="text-brand hover:underline"
                >
                  Register College Institution
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

