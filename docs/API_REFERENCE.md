# REST API Reference & Endpoint Specification

The backend exposes a fully documented, type-safe REST API. Interactive OpenAPI documentation is accessible at `http://localhost:5000/api/docs`.

---

##  1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register student or college coordinator account |
| `POST` | `/auth/login` | Public | Login with email and password, returns JWT tokens |
| `POST` | `/auth/refresh` | Public | Exchange valid refresh token for a new access token |
| `GET` | `/auth/profile` | Authenticated | Get full profile dossier of logged-in user |
| `PATCH`| `/auth/profile` | Authenticated | Update user personal details and college preferences |
| `POST` | `/auth/change-password` | Authenticated | Update account password with old password validation |

---

##  2. Academic Catalog Endpoints (`/api/catalog`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/catalog/clusters` | Public | List all 5 academic engineering clusters with child topics |
| `GET` | `/catalog/topics` | Public | List all specialization topics |
| `GET` | `/catalog/technologies` | Public | List supported frameworks and tools (`Next.js`, `NestJS`, `PyTorch`) |
| `GET` | `/catalog/programs` | Public | List sellable 120-hr internship programs with filter query params |
| `GET` | `/catalog/programs/:idOrSlug` | Public | Get single program detail with curriculum, pricings, and capstones |
| `POST`| `/catalog/programs` | Admin Only | Create a new academic program |
| `PATCH`| `/catalog/programs/:id` | Admin Only | Update program metadata, status, or curriculum outcomes |

---

##  3. Student Portal Endpoints (`/api/student`)

*Requires `student` role and valid Bearer Token.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/student/overview` | Active program telemetry, hours logged, current active deliverable, AI average score |
| `GET` | `/student/profile` | Academic profile, registered college, and verification status |
| `GET` | `/student/programs` | List enrolled internship programs |
| `GET` | `/student/workspace` | Get student active capstones, linked GitHub repositories, and task progression |
| `GET` | `/student/submissions` | List student submitted deliverables and BullMQ AI review evaluation feedback |
| `GET` | `/student/rubrics` | List evaluation criteria, point breakdowns, and pass thresholds per step |
| `POST`| `/student/tasks/:id/submit` | Submit deliverable (GitHub repo URL, commit hash, notes) to evaluation queue |

---

##  4. College B2B Portal Endpoints (`/api/college`)

*Requires `college` or `admin` role and valid Bearer Token.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/college/overview` | Institutional partner telemetry, allocated seats ratio, active coupon batches, track bars |
| `GET` | `/college/students` | List student cohort enrolled under this college institution with milestone task progress |
| `GET` | `/college/coupons` | List zero-cost B2B coupon batches generated for this college |
| `GET` | `/college/reports` | Comprehensive completion, certification, and average rubric score analytics |

---

##  5. Super Admin Endpoints (`/api/admin`)

*Requires `super_admin` or `admin` role and valid Bearer Token.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/overview` | Platform telemetry, 12-month rolling revenue chart, pending colleges, awaiting review list |
| `GET` | `/admin/colleges` | List all registered college partners with approval statuses (`pending`, `approved`, `rejected`) |
| `PATCH`| `/admin/colleges/:id/status` | Approve or reject a college partner application |
| `GET` | `/admin/users` | List platform users with roles, registration dates, and status toggle |
| `PATCH`| `/admin/users/:id/status` | Update user status (`active`, `suspended`) |
| `GET` | `/admin/programs` | Manage curriculum catalog programs |
| `GET` | `/admin/coupons` | Platform-wide coupon batch governance and issuance |

---

##  6. Commerce & Payments Endpoints (`/api/payments`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/payments/orders` | Authenticated | Create a payment intent order with selected currency and optional coupon discount |
| `POST` | `/payments/verify` | Authenticated | Verify payment gateway signature (Razorpay HMAC-SHA256 / Stripe) and activate enrollment |
| `POST` | `/payments/webhook` | Public (Signed)| Asynchronous payment capture webhook listener |

---

##  7. System Countries Endpoints (`/api/countries`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/countries` | Public | List supported countries with ISO codes, currencies, and locales |
