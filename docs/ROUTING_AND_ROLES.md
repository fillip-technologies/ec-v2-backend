# Multi-Role Routing & Dynamic Tab Engine

This document details how the **Engineers Clinic Frontend** handles role-based access, sidebar menu composition, and URL-synchronized single-page dashboard routing.

---

## 🧭 1. Unified Single-Page Dashboard Concept

Rather than reloading separate heavy pages when navigating between dashboard views, the application uses a **Reactive Single-Page Shell** (`app/student/page.tsx`).

### How It Works:
```
                                User Logs In
                                     │
                                     ▼
                    [AuthContext] Resolves User Role
             (e.g., `student`, `college`, `super_admin`)
                                     │
                                     ▼
          [roleSidebarConfig.json] Generates Role Navigation
                                     │
                                     ▼
          [URL Search Params] Syncs `?tab=overview&id=123`
                                     │
                                     ▼
             Renders Active View Component with Suspense
```

---

## 🗂️ 2. Dynamic Sidebar Configuration (`config/roleSidebarConfig.json`)

The sidebar items are driven dynamically from a centralized configuration file mapped by role:

```json
{
  "super_admin": [
    {
      "group": "PLATFORM",
      "items": [
        { "name": "Overview", "slug": "overview", "icon": "LayoutDashboard" },
        { "name": "Colleges", "slug": "colleges", "icon": "School" },
        { "name": "User Base", "slug": "users", "icon": "Users" },
        { "name": "Programs", "slug": "programs", "icon": "BookOpen" }
      ]
    }
  ],
  "college": [
    {
      "group": "CAMPUS COHORT",
      "items": [
        { "name": "Overview", "slug": "overview", "icon": "LayoutDashboard" },
        { "name": "Students", "slug": "students", "icon": "Users" },
        { "name": "Coupons", "slug": "coupons", "icon": "Ticket" },
        { "name": "Reports", "slug": "reports", "icon": "FileCheck" }
      ]
    }
  ],
  "student": [
    {
      "group": "LEARNING",
      "items": [
        { "name": "Overview", "slug": "overview", "icon": "LayoutDashboard" },
        { "name": "My Programs", "slug": "program", "icon": "FolderKanban" },
        { "name": "Submissions", "slug": "submissions", "icon": "Send" },
        { "name": "Rubrics", "slug": "rubrics", "icon": "ShieldCheck" }
      ]
    }
  ]
}
```

---

## 🔗 3. URL Synchronization & Browser History

The dashboard keeps the browser address bar synchronized with the active view without triggering full page reloads:

- **Switching Tabs**: When a user clicks a menu item or card, `handleNavigateSlug(slug, id)` runs:
  ```typescript
  const url = new URL(window.location.href);
  url.searchParams.set('tab', slug);
  window.history.pushState({}, '', url.toString());
  ```
- **Browser Back / Forward Support**: A `popstate` event listener automatically detects browser back/forward buttons and updates `activeSlug` and any detail view IDs (`idParam`).
- **Deep Linking**: Refreshing or sharing a URL like `http://localhost:3000/student?tab=submissions` opens directly to that tab.

---

## 👤 4. Unified Profile Navigation

In accordance with clean UX principles:
- The user profile is accessible via the **bottom user avatar card** in `UserSidebar.tsx` and the **Navbar user dropdown**.
- Clicking either triggers `handleSelectSlug('profile')`, rendering the role-aware [`UserProfileView.tsx`](../components/profile/UserProfileView.tsx).
