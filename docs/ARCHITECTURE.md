# Frontend Architecture & Client Engineering

This document outlines the architectural structure, directory layout, layout composition, and API client interceptor of the **Engineers Clinic Frontend**.

---

## 🏛️ 1. Directory Layout & Taxonomy

```
engineers-clinic-frontend/
├── app/                         # Next.js 16 App Router Routes
│   ├── layout.tsx               # Root application shell (AuthProvider, fonts, toast)
│   ├── page.tsx                 # Public marketing homepage
│   ├── catalog/                 # Academic catalog and [slug] curriculum pages
│   ├── student/                 # Core unified dashboard engine (`DashboardContent`)
│   ├── college/                 # College B2B portal wrapper
│   ├── admin/                   # Super Admin portal wrapper
│   ├── login/                   # JWT authentication sign-in
│   └── signup/                  # Student / College onboarding registration
│
├── components/                  # UI Component Library
│   ├── admin/                   # Super admin views (Overview, Colleges, Users, Coupons)
│   ├── college/                 # College views (Overview, Students, Coupons, Reports)
│   ├── student/                 # Student views (Overview, Program, Workspace, Submissions)
│   ├── profile/                 # Role-aware user profile dossier (`UserProfileView`)
│   ├── layout/                  # Navbar, Footer, MegaMenu
│   ├── sections/                # Modular landing page sections
│   ├── shared/                  # Reusable components (`UserSidebar`, `CustomDropdown`)
│   └── ui/                      # Base primitives (`StatusBadge`, `EnquiryModal`, Modals)
│
├── config/                      # Static configurations & JSON mappings
│   ├── api.ts                   # Backend URL resolution
│   ├── roleSidebarConfig.json   # Role-to-menu navigation configuration
│   └── studentData.json         # Fallback data definitions
│
├── context/                     # Global State Providers
│   └── AuthContext.tsx          # Authentication state, current user, login/logout actions
│
├── lib/                         # Utilities & Data Fetching Layer
│   └── api/
│       ├── client.ts            # Core API interceptor with JWT auto-refresh & 401 retry
│       ├── auth.ts              # Authentication & profile endpoints
│       ├── catalog.ts           # Academic catalog & programs fetching
│       ├── student.ts           # Student workspace, tasks, and submission APIs
│       ├── college.ts           # College telemetry, coupons, and reports APIs
│       ├── admin.ts             # Super admin management APIs
│       └── payments.ts          # Payment order creation and gateway verification
│
└── types/                       # TypeScript Type Definitions
    └── catalog.ts               # Cluster, Topic, Program, Project, Submission types
```

---

## 🔄 2. API Client Interceptor (`lib/api/client.ts`)

All frontend API calls pass through the centralized `apiClient` wrapper. This ensures:
1. **Automatic Bearer Token Injection**: Pulls the active JWT from `localStorage` and injects `Authorization: Bearer <token>`.
2. **Transparent 401 Pre-Flight Auto-Refresh**: If an access token expires:
   - Suspends the failed request.
   - Calls `POST /auth/refresh` using the stored refresh token.
   - On success, updates `localStorage` with the new token and immediately replays the original request without user interruption.
   - On failure, clears auth state and redirects smoothly to `/login`.

---

## 🎨 3. Design System & Theme Tokens

Tailwind CSS is configured with the brand's custom design tokens:
- **`brand`** (`#7C5CFC`): Primary platform purple accent.
- **`brandHover`** (`#6947eb`): Interactive hover state.
- **`bgBody`** (`#F7F8FC`): Ultra-clean soft dashboard background.
- **`surface`** (`#FFFFFF`): Elevated glass card surface.
- **`textPrimary`** (`#1E1B4B`): High-contrast slate heading color.
- **`textMuted`** (`#64748B`): Subtitle and metadata text.
- **`borderLight`** (`#E2E8F0`): Minimal subtle border.
