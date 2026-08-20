# Database Architecture & Seeding Guide

This document details the MariaDB database schema, multi-file Prisma ORM configuration, entity relationships, and the automated 7-stage seeding sequence.

---

## 🗄️ 1. Multi-File Prisma Schema Architecture

To prevent a monolithic 3,000-line schema file, schemas are divided into domain-specific `.prisma` files inside `prisma/schema/`:

```
prisma/
├── schema/
│   ├── base.prisma                      # Datasource (MariaDB), client generator & global enums
│   ├── user.prisma                      # Users, Roles, Permissions, Students, CollegeMembers
│   ├── catalog.prisma                   # Clusters, Topics, Technologies, Programs, Pricings
│   ├── project.prisma                   # Capstone Projects, TemplateTasks, Rubrics
│   ├── enrollment.prisma                # Enrollments, EnrollmentProjects, StudentWorkspaces, Tasks
│   └── payment.prisma                   # Orders, SeatOrders, CouponBatches, Coupons, Invoices
└── seed/            
    ├── main.seed.ts                     # Master orchestrator for full seed
    ├── countries.seed.ts                # [1/7] ISO countries, currencies, and locales
    ├── roles-permissions.seed.ts        # [2/7] 5 system roles and 19 granular permissions
    ├── users.seed.ts                    # [3/7] Super admins, partner colleges, and students
    ├── catalog.seed.ts                  # [4/7] Academic clusters, topics, programs & capstones
    ├── b2b-seats-coupons.seed.ts        # [5/7] Institutional seat orders and coupon batches
    └── enrollments-deliverables.seed.ts # [6/7] Workspaces, tasks, and deliverables
```

---

## 📊 2. Core Entity-Relationship (ER) Model

```
┌──────────────┐         ┌────────────────┐         ┌────────────────────┐
│   Cluster    │1       N│    Topic       │1       N│      Program       │
│  (Domain)    ├────────►│(specialization)├────────►│  (120-Hr Capstone) │
└──────────────┘         └────────────────┘         └───────┬────────────┘
                                                            │1
                                                            │
                                                            │N
┌──────────────┐         ┌──────────────┐         ┌─────────▼──────────┐
│   Student    │1       N│  Enrollment  │1       N│ EnrollmentProject  │
│ (User/Profile├────────►│ (Enrol State)├────────►│  (Capstone 1,2,3)  │
└──────────────┘         └──────────────┘         └─────────┬──────────┘
                                                            │1
                                                            │
                                                            │1
┌──────────────┐         ┌──────────────┐         ┌─────────▼──────────┐
│ TaskProgress │1       N│WorkspaceTask │N       1│  StudentWorkspace  │
│(OPEN/PASSED) ◄─────────┤ (Milestone)  │◄────────┤   (GitHub Repo)    │
└──────────────┘         └──────┬───────┘         └────────────────────┘
                                │1
                                │
                                │N
                         ┌──────▼────────┐         ┌────────────────────┐
                         │  Submission   │1       1│      AiReview      │
                         │(GitHub PR/Url)├────────►│ (Rubric Score 0-100│
                         └───────────────┘         └────────────────────┘
```

---

## 🔑 3. Entity Relationships Summary

### A. Academic Hierarchy
- **`Cluster`** (e.g., *Software Engineering & Full Stack*) has many **`Topic`** records (e.g., *Full Stack Web Development*).
- **`Topic`** has many sellable **`Program`** tracks (e.g., *Full Stack Web Engineering & Cloud Architecture*).
- **`Program`** has many **`ProgramPricing`** rows (multi-currency INR, USD, GBP, AED) and **`ProgramProject`** links.

### B. Student Workspaces & Deliverables
- **`Student`** registers and creates **`Enrollment`** in a **`Program`**.
- Each **`Enrollment`** contains 3 **`EnrollmentProject`** capstone milestones:
  - *Project 1*: `ACTIVE`
  - *Project 2*: `LOCKED` (Unlocks when Project 1 passes)
  - *Project 3*: `LOCKED` (Unlocks when Project 2 passes)
- Each **`EnrollmentProject`** has a dedicated **`StudentWorkspace`** with structured **`WorkspaceTask`** items.
- Student submits work creating a **`Submission`**, which triggers automated **`AiReview`** evaluation.

### C. B2B Institutional Model
- **`College`** (e.g., *Vellore Institute of Technology*) has assigned **`CollegeMember`** coordinators.
- Colleges purchase bulk seats generating a **`SeatOrder`**.
- Paid seat orders generate a **`CouponBatch`** containing individual single-use zero-cost **`Coupon`** codes (e.g., `VIT-FSW-2026-1001`).
- Enrolling with a valid coupon marks it as `REDEEMED` and assigns the student directly into that college's cohort.

---

## 🌱 4. Multi-Stage Automated Database Seeding

To seed a complete, fully populated staging/production database from scratch:

```bash
# Push schema structure to database
npx prisma db push

# Run the 7-stage master seed
npm run seed
```

### 7-Stage Seed Execution Breakdown:
1. **`countries.seed.ts`**: Seeds supported countries (`India`, `United States`, `United Kingdom`, `UAE`) with currency ISOs and locales.
2. **`roles-permissions.seed.ts`**: Seeds 5 system roles (`super_admin`, `admin`, `college`, `student`, `support`) and 19 granular RBAC permissions.
3. **`users.seed.ts`**: Seeds administrators, 6 institutional college profiles, and campus learners.
4. **`catalog.seed.ts`**: Seeds 5 academic clusters, 7 topics, 14 technologies, 5 programs, multi-currency pricings, and capstone rubrics.
5. **`b2b-seats-coupons.seed.ts`**: Seeds institutional seat purchase orders, invoice references, and zero-cost coupon batches.
6. **`enrollments-deliverables.seed.ts`**: Seeds real student enrollments, capstone workspaces, milestone tasks, and AI review evaluations.

---

## ⚡ 5. Indexing & Query Optimization
- **`enrollments`**: Compound index on `(program_id, status)` and `student_id` for fast dashboard lookups.
- **`coupons`**: Unique index on `code`, index on `status` and `batch_id` to prevent concurrency collisions.
- **`submissions`**: Index on `(student_id, status)` and `workspace_task_id` for instant review queues.
