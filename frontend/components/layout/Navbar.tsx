"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { MegaMenu } from "./MegaMenu";
import { ChevronDown, Gift, Menu, X, LayoutGrid, Megaphone, User, LogOut, Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getCountries } from "@/lib/api/catalog";
import { detectUserGeoLocation } from "@/lib/api/geo";
import { getFlagEmoji, getCurrencySymbol } from "@/lib/utils/currency";

interface NavbarProps {
  onOpenEnquiry?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenEnquiry }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const [countries, setCountries] = useState<any[]>([
    { id: 1, isoCode: "IN", name: "India", currencyCode: "INR" },
    { id: 2, isoCode: "US", name: "United States", currencyCode: "USD" },
    { id: 3, isoCode: "GB", name: "United Kingdom", currencyCode: "GBP" },
    { id: 4, isoCode: "AE", name: "UAE", currencyCode: "AED" },
  ]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("IN");

  useEffect(() => {
    // Fetch countries from backend
    getCountries()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCountries(data);
        }
      })
      .catch((err) => console.warn("Using fallback countries:", err));

    // Detect user country
    detectUserGeoLocation().then((geo) => {
      if (geo && geo.countryCode) {
        setSelectedCountryCode(geo.countryCode);
      }
    });

    // Listen to location:changed event from Catalog, Checkout, or other components
    const handleLocationChanged = (e: any) => {
      if (e.detail?.countryCode) {
        setSelectedCountryCode(e.detail.countryCode);
      }
    };
    window.addEventListener("location:changed", handleLocationChanged);
    return () => window.removeEventListener("location:changed", handleLocationChanged);
  }, []);

  const handleCountryChange = (isoCode: string) => {
    setSelectedCountryCode(isoCode);
    setCountryDropdownOpen(false);
    if (typeof document !== "undefined") {
      const match = countries.find((c) => c.isoCode === isoCode);
      const payload = {
        countryCode: isoCode,
        currency: match?.currencyCode || "INR",
        countryName: match?.name || "India",
      };
      document.cookie = `user_geo_data=${encodeURIComponent(JSON.stringify(payload))};path=/;max-age=${30 * 24 * 60 * 60}`;
      window.dispatchEvent(new CustomEvent("location:changed", { detail: payload }));
    }
  };

  const activeCountry = countries.find((c) => c.isoCode === selectedCountryCode) || countries[0];

  const [mobileInternshipOpen, setMobileInternshipOpen] = useState(false);
  const [mobileEnterpriseOpen, setMobileEnterpriseOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const getDashboardUrl = (userRole?: any) => {
    const roleStr = (typeof userRole === "string" ? userRole : userRole?.name || "").toLowerCase();
    if (roleStr === "college") return "/college";
    if (roleStr === "admin" || roleStr === "super_admin" || roleStr === "support") return "/admin";
    return "/student";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-borderLight/70 bg-white/60 backdrop-blur-2xl transition-all duration-300">
      <div className="container-main flex items-center justify-between py-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3" aria-label="Engineers Clinic home">
          <Image
            src="/images/Engineers-clinic-logo-black.png"
            alt="Engineers Clinic"
            width={190}
            height={48}
            priority
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation Shell */}
        <nav className="nav-shell hidden items-center gap-1 p-2 lg:flex">
          <Link
            href="/"
            className={`nav-link ${pathname === "/" ? "nav-link-active" : ""}`}
          >
            Home
          </Link>

          {/* Internships Mega Menu */}
          <MegaMenu />

          {/* College Tie-ups */}
          <Link
            href="/college-tieup"
            className={`nav-link ${
              pathname?.startsWith("/college-tieup") ? "nav-link-active" : ""
            }`}
          >
            College Tie-ups
          </Link>

          {/* For Enterprises & Employers */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setEnterpriseOpen(!enterpriseOpen);
                setMoreOpen(false);
              }}
              className={`nav-link cursor-pointer ${
                enterpriseOpen || pathname?.startsWith("/company-branding") ? "nav-link-active" : ""
              }`}
            >
              <span>For Enterprises & Employers</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  enterpriseOpen ? "rotate-180 text-white" : "text-current"
                }`}
              />
            </button>

            {enterpriseOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setEnterpriseOpen(false)} />
                <div className="dropdown-panel absolute left-0 top-full z-50 mt-3 w-[340px] p-3 shadow-2xl">
                  <Link
                    href="/company-branding"
                    onClick={() => setEnterpriseOpen(false)}
                    className="group flex items-start gap-4 rounded-[14px] p-4 transition hover:bg-bgSoft"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-brand text-white shadow-sm">
                      <LayoutGrid className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-textPrimary">
                        Company For Branding
                      </span>
                      <span className="mt-1 block text-caption">
                        Promote your brand among students and colleges through campaigns.
                      </span>
                    </span>
                  </Link>

                  <Link
                    href="/college-tieup"
                    onClick={() => setEnterpriseOpen(false)}
                    className="group mt-2 flex items-start gap-4 rounded-[14px] p-4 transition hover:bg-bgSoft"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-brand/15 text-brand">
                      <Megaphone className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-textPrimary">
                        For Selling Services & Products
                      </span>
                      <span className="mt-1 block text-caption">
                        Reach verified students, colleges, and young professionals.
                      </span>
                    </span>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* More Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMoreOpen(!moreOpen);
                setEnterpriseOpen(false);
              }}
              className={`nav-link cursor-pointer ${
                moreOpen || pathname?.startsWith("/about") ? "nav-link-active" : ""
              }`}
            >
              <span>More</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  moreOpen ? "rotate-180 text-white" : "text-current"
                }`}
              />
            </button>

            {moreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                <div className="dropdown-panel absolute right-0 top-full z-50 mt-3 w-[260px] p-3 shadow-2xl">
                  <a
                    href="#how-it-works"
                    onClick={() => setMoreOpen(false)}
                    className="block rounded-[14px] px-4 py-3 text-sm font-semibold text-textSecondary transition hover:bg-bgSoft hover:text-brand"
                  >
                    AI Tools
                  </a>
                  <Link
                    href="/about"
                    onClick={() => setMoreOpen(false)}
                    className="mt-1 block rounded-[14px] px-4 py-3 text-sm font-semibold text-textSecondary transition hover:bg-bgSoft hover:text-brand"
                  >
                    About Us
                  </Link>
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5">
          {/* Dynamic Region / Country Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setCountryDropdownOpen(!countryDropdownOpen);
                setProfileDropdownOpen(false);
                setEnterpriseOpen(false);
                setMoreOpen(false);
              }}
              className={`flex h-12 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition hover:bg-bgSoft cursor-pointer ${
                countryDropdownOpen ? "bg-bgSoft text-brand" : "text-textSecondary hover:text-textPrimary"
              }`}
              title={`Region: ${activeCountry.name} (${activeCountry.currencyCode})`}
            >
              <span className="text-2xl leading-none">{getFlagEmoji(selectedCountryCode)}</span>
              <span className="hidden sm:inline font-bold text-xs uppercase tracking-wider">
                {selectedCountryCode}
              </span>
            </button>

            {countryDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setCountryDropdownOpen(false)} />
                <div className="dropdown-panel absolute right-0 top-full z-50 mt-3 w-64 p-3 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-textMuted border-b border-borderLight/70">
                    Select Region & Currency
                  </div>
                  <div className="mt-2 space-y-1 max-h-64 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">
                    {countries.map((c) => {
                      const isSelected = c.isoCode === selectedCountryCode;
                      const flag = getFlagEmoji(c.isoCode);
                      const symbol = getCurrencySymbol(c.currencyCode);

                      return (
                        <button
                          key={c.isoCode || c.id}
                          type="button"
                          onClick={() => handleCountryChange(c.isoCode)}
                          className={`flex w-full items-center justify-between gap-3 rounded-[14px] px-3.5 py-2.5 text-xs font-bold transition text-left cursor-pointer ${
                            isSelected
                              ? "bg-brand text-white shadow-xs"
                              : "text-textPrimary hover:bg-bgSoft hover:text-brand"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg leading-none shrink-0">{flag}</span>
                            <span className="truncate">{c.name}</span>
                          </div>
                          <span
                            className={`text-[10px] font-mono shrink-0 ${
                              isSelected ? "text-white/80" : "text-textMuted"
                            }`}
                          >
                            {c.currencyCode} {symbol}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Dropdown or Login Button */}
          {user ? (
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-borderLight bg-white hover:bg-bgSoft transition-all cursor-pointer"
                title={user.email}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-brand/10 text-brand font-black text-xl">
                  {user.email?.[0].toUpperCase() || "U"}
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-[20px] border border-borderLight bg-white p-2 shadow-lg z-50">
                  <Link
                    href={getDashboardUrl(user.role)}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-textPrimary hover:bg-bgSoft hover:text-brand transition-all text-left"
                  >
                    <User className="h-4 w-4" />
                    <span>Go to Dashboard</span>
                  </Link>

                  <Link
                    href={`${getDashboardUrl(user.role)}?tab=profile`}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-textPrimary hover:bg-bgSoft hover:text-brand transition-all text-left"
                  >
                    <User className="h-4 w-4 text-brand" />
                    <span>My Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-danger hover:bg-dangerLight transition-all text-left cursor-pointer border-t border-borderLight mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-primary hidden lg:inline-flex"
            >
              Login
            </Link>
          )}

          {/* Mobile Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="grid h-11 w-11 place-items-center rounded-[14px] border border-borderLight bg-white text-textPrimary shadow-sm lg:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-borderLight bg-white lg:hidden">
          <nav className="container-main space-y-2 py-5">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`block rounded-[14px] px-5 py-4 text-sm font-bold transition ${
                pathname === "/"
                  ? "bg-brand text-white"
                  : "text-textSecondary hover:bg-bgSoft hover:text-brand"
              }`}
            >
              Home
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenEnquiry?.();
              }}
              className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[14px] border border-secondary/50 bg-secondarySoft px-5 py-4 text-sm font-black text-textPrimary shadow-sm cursor-pointer"
            >
              <Gift className="relative text-brand h-4 w-4" />
              <span className="relative">Refer & Earn</span>
            </button>

            {/* Mobile Internships Accordion */}
            <div className="rounded-[14px] border border-borderLight bg-white">
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-bold text-textPrimary"
                onClick={() => setMobileInternshipOpen(!mobileInternshipOpen)}
              >
                <span>Internships</span>
                <ChevronDown
                  className={`h-4 w-4 transition ${
                    mobileInternshipOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileInternshipOpen && (
                <div className="border-t border-borderLight p-4">
                  <MegaMenu mobile onSelect={() => setMobileOpen(false)} />
                </div>
              )}
            </div>

            <Link
              href="/college-tieup"
              onClick={() => setMobileOpen(false)}
              className={`block rounded-[14px] px-5 py-4 text-sm font-bold transition ${
                pathname?.startsWith("/college-tieup")
                  ? "bg-brand text-white"
                  : "text-textSecondary hover:bg-bgSoft hover:text-brand"
              }`}
            >
              College Tie-ups
            </Link>

            {/* Mobile Enterprise Accordion */}
            <div className="rounded-[14px] border border-borderLight bg-white">
              <button
                type="button"
                className={`flex w-full items-center justify-between px-5 py-4 text-left text-sm font-bold transition ${
                  pathname?.startsWith("/company-branding")
                    ? "text-brand"
                    : "text-textPrimary"
                }`}
                onClick={() => setMobileEnterpriseOpen(!mobileEnterpriseOpen)}
              >
                <span>For Enterprises & Employers</span>
                <ChevronDown
                  className={`h-4 w-4 transition ${
                    mobileEnterpriseOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileEnterpriseOpen && (
                <div className="space-y-2 border-t border-borderLight p-4">
                  <Link
                    href="/company-branding"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-[14px] bg-bgSoft px-4 py-3 text-sm font-semibold text-textPrimary"
                  >
                    Company For Branding
                  </Link>
                  <Link
                    href="/college-tieup"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-[14px] bg-bgSoft px-4 py-3 text-sm font-semibold text-textPrimary"
                  >
                    For Selling Services & Products
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile More Accordion */}
            <div className="rounded-[14px] border border-borderLight bg-white">
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-bold text-textPrimary"
                onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
              >
                <span>More</span>
                <ChevronDown
                  className={`h-4 w-4 transition ${
                    mobileMoreOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileMoreOpen && (
                <div className="space-y-2 border-t border-borderLight p-4">
                  <a
                    href="#how-it-works"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-[14px] bg-bgSoft px-4 py-3 text-sm font-semibold text-textPrimary"
                  >
                    AI Tools
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      onOpenEnquiry?.();
                    }}
                    className="w-full text-left block rounded-[14px] bg-bgSoft px-4 py-3 text-sm font-semibold text-textPrimary"
                  >
                    Refer & Earn
                  </button>
                  <a
                    href="#faq"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-[14px] bg-bgSoft px-4 py-3 text-sm font-semibold text-textPrimary"
                  >
                    Blog
                  </a>
                  <a
                    href="#about"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-[14px] bg-bgSoft px-4 py-3 text-sm font-semibold text-textPrimary"
                  >
                    About Us
                  </a>
                </div>
              )}
            </div>

            {/* Mobile Region / Country Selector */}
            <div className="rounded-[16px] border border-borderLight bg-bgSoft/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-brand uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Region & Currency</span>
                </span>
                <span className="text-base leading-none">{getFlagEmoji(selectedCountryCode)}</span>
              </div>
              <select
                value={selectedCountryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full rounded-xl border border-borderLight bg-white px-3 py-2.5 text-xs font-bold text-textPrimary shadow-2xs outline-none focus:border-brand"
              >
                {countries.map((c) => (
                  <option key={c.isoCode || c.id} value={c.isoCode}>
                    {getFlagEmoji(c.isoCode)} {c.name} ({c.currencyCode} {getCurrencySymbol(c.currencyCode)})
                  </option>
                ))}
              </select>
            </div>

            {user ? (
              <div className="space-y-2">
                <Link
                  href={getDashboardUrl(user.role)}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full rounded-[14px] bg-brand px-5 py-3.5 text-center text-sm font-bold text-white cursor-pointer shadow-xs"
                >
                  Dashboard
                </Link>
                <Link
                  href={`${getDashboardUrl(user.role)}?tab=profile`}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full rounded-[14px] border border-borderLight bg-bgSoft px-5 py-3 text-center text-sm font-bold text-textPrimary cursor-pointer hover:bg-surface"
                >
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="block w-full rounded-[14px] bg-rose-600 px-5 py-3 text-center text-sm font-bold text-white cursor-pointer hover:bg-rose-700 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full rounded-[14px] bg-brand px-5 py-4 text-center text-sm font-bold text-white cursor-pointer"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
