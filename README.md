# Engineers Clinic — Frontend Application

> Modern, high-performance web platform and unified multi-role operating system built with **Next.js 16 (App Router & Turbopack)**, **Tailwind CSS**, and **Lucide React**.

---

## 📑 Table of Contents
- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Local Quick Start](#-local-quick-start)
- [Key Portals & Features](#-key-portals--features)
- [Architecture & Deep Documentation](#-architecture--deep-documentation)
- [Building for Production](#-building-for-production)

---

## 🌟 Project Overview
The **Engineers Clinic Frontend** serves as both the public web presence and the interactive dashboard engine for the entire platform:
1. **Public Marketing & Catalog**: Multi-currency checkout, dynamic cluster/topic exploration, institutional tie-up showcases, and FAQ sections.
2. **Unified Multi-Role Dashboard (`/student`, `/college`, `/admin`)**: Single reactive dashboard shell that dynamically transforms into the Student Workspace, B2B College Portal, or Super Admin Console based on authenticated credentials.
3. **Interactive Milestone Workspace**: Integrated GitHub repository linking, task submission modals, AI evaluation feedback displays, and QR-verifiable certificate viewer.

---

## 🚀 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with Custom Glassmorphism Design Tokens |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **State & Auth** | React Context (`AuthContext`), Local Storage Token Sync, URL Search Params |
| **HTTP Client** | Modular Fetch Interceptor with Automatic Token Refresh (`lib/api/client.ts`) |

---

## ⚡ Local Quick Start

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Engineers Clinic Backend**: Running on `http://localhost:5000`

### 2. Install Dependencies
```bash
cd engineers-clinic-frontend
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```
Configure backend API URL:
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:5000/api"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_placeholder"
```

### 4. Start Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

---

## 🧭 Key Portals & Features

| Route | Role / Audience | Features |
| :--- | :--- | :--- |
| **`/`** | Public Visitors | Dynamic landing page, statistics, testimonials, lead capture modal. |
| **`/catalog`** | Prospective Learners | Multi-cluster catalog filtering, 120-hr program details, currency switcher. |
| **`/catalog/[slug]`** | Prospective Learners | Detailed curriculum syllabus, 3 capstone breakdown, pricing checkout. |
| **`/student`** | Students | Milestone task board, GitHub submission modal, AI rubric feedback, certificate. |
| **`/college`** | College Partners | Campus seat allocation, active coupon batch cards, cohort completion reports. |
| **`/admin`** | Super Admins | Telemetry, 12-month rolling revenue bar chart, college vetting, user status. |

---

## 📚 Architecture & Deep Documentation

Detailed documentation is available in the [`docs/`](./docs) directory:

- 🏗️ **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — App Router tree, layout system, and HTTP client interceptor with auto-refresh.
- 🧭 **[docs/ROUTING_AND_ROLES.md](./docs/ROUTING_AND_ROLES.md)** — Dynamic tab routing (`?tab=...`), role switching, and sidebar configuration.
- 🧩 **[docs/COMPONENTS.md](./docs/COMPONENTS.md)** — Design tokens, glassmorphism UI guidelines, and shared widget catalog.
- 🚀 **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** — Production build optimization, caching rules, and deployment guides.

---

## 🚢 Building for Production

To create an optimized production build:
```bash
# Typecheck & Next.js production build
npm run build

# Start production server
npm run start
```

---
*Developed by the Engineers Clinic Core Engineering Team.*
