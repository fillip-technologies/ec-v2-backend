# UI Components & Design System Catalog

This document catalogs the key shared UI components, design tokens, and glassmorphism standards across the **Engineers Clinic Frontend**.

---

## 🎨 1. Glassmorphism & Card Aesthetics

The platform uses a refined glassmorphism theme characterized by:
- **Card Containers**: `rounded-[24px]` or `rounded-[28px]` with `border border-borderLight bg-white shadow-xs`.
- **Hero Banners**: `bg-gradient-to-r from-textPrimary via-gray-900 to-brand p-6 text-white shadow-md`.
- **Frosted Pills**: `bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold`.
- **Hover Micro-interactions**: `hover:border-brand/40 transition-all cursor-pointer`.

---

## 🧩 2. Core Shared Component Catalog

### A. [`CustomDropdown.tsx`](../components/shared/CustomDropdown.tsx)
An accessible custom select menu replacing native browser selects.
- **Props**: `options: { value: string | number; label: string }[]`, `value`, `onChange`, `placeholder`, `disabled`.
- **Features**:
  - Automatically positions menu and flips orientation if near page boundaries.
  - Detects outside clicks and closes gracefully.
  - Full keyboard accessibility and high-contrast active item indicators.

### B. [`StatusBadge.tsx`](../components/ui/StatusBadge.tsx)
Standardized, role-agnostic status badge component.
- **Statuses Supported**:
  - `ACTIVE` / `PASSED` / `APPROVED` $\rightarrow$ Emerald / Green
  - `PENDING` / `NEEDS_WORK` / `IN_PROGRESS` $\rightarrow$ Amber / Yellow
  - `LOCKED` / `EXHAUSTED` / `REJECTED` $\rightarrow$ Slate / Red
- **Sizes**: `sm` (compact 10px font), `md` (standard).

### C. [`UserSidebar.tsx`](../components/shared/UserSidebar.tsx)
Responsive pinned left navigation sidebar.
- **Features**:
  - Dynamically renders navigation groups from `roleSidebarConfig.json`.
  - Highlights active slug with primary brand accent pill.
  - Features pinned bottom profile card showing user initials, name, and role badge.

### D. [`UserProfileView.tsx`](../components/profile/UserProfileView.tsx)
Role-aware comprehensive user profile dossier with tabs:
1. **Personal Details**: Name, email, phone number, registered college/institution.
   - *Conditional College Visibility*: If an accredited registered college is selected, custom college name text inputs are hidden.
2. **Academic Details**: Graduation year, roll number, specialization branch.
3. **Assigned Permissions**: Granular badge list of active RBAC capabilities.
4. **Security & Password**: Secure password update form with validation.

---

## 🖥️ 3. Overview Dashboard Views

### A. [`StudentOverview.tsx`](../components/student/StudentOverview.tsx)
- Unified welcome banner with linear progress bar.
- 4 KPI cards: Hours Logged, Projects Done, AI Average Score, Certificate Status.
- Interactive Current Active Task & Latest AI Evaluation cards with direct action handlers.

### B. [`CollegeOverview.tsx`](../components/college/CollegeOverview.tsx)
- Institutional partner status banner.
- 4 KPI cards: Cohort Students, Active Workspaces, Certifications, Allocated Seats.
- Split cards: Active Coupon Batches list & Cohort by Track proportion bars.
- Recent Campus Students table with milestone deliverable completion progress.

### C. [`AdminOverview.tsx`](../components/admin/AdminOverview.tsx)
- Super Admin active console banner.
- 6 Platform Stat Cards (Revenue, Users, Colleges, Programs, Enrollments, Submissions).
- Interactive 12-month rolling revenue bar chart with hover tooltips.
- Action cards: Pending College Vetting (with 1-click Approve/Reject) & Submissions Awaiting Review.
