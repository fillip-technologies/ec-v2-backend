# Engineers Clinic — Backend API & Microservices Engine

> High-throughput, multi-tenant academic internship operating system powered by **NestJS 11**, **Prisma ORM**, **MariaDB**, **Redis**, and **BullMQ**.

---

## 📑 Table of Contents
- [System Overview](#-system-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Local Quick Start](#-local-quick-start)
- [Pre-Seeded Test Credentials](#-pre-seeded-test-credentials)
- [Architecture & Deep Documentation](#-architecture--deep-documentation)
- [Running Tests](#-running-tests)
- [Production Deployment](#-production-deployment)

---

## 🌟 System Overview
The **Engineers Clinic Backend** delivers an enterprise-grade academic curriculum and internship management engine. It orchestrates:
1. **Academic Catalog & Taxonomy**: 5 engineering clusters, specialization topics, 120-hour industry capstone programs, and rubric-driven milestone deliverables.
2. **Student Workspace & Delivery**: GitHub repository tracking, milestone task boards, deliverable submission pipelines, and automated certificate generation.
3. **Automated AI Grading Pipeline**: Asynchronous BullMQ worker queues evaluating code submissions against structured rubrics.
4. **B2B Institutional Campus Portal**: Bulk seat procurement, zero-cost coupon generation, campus cohort telemetry, and verification reporting.
5. **Super Admin Telemetry & Commerce**: Revenue metrics, college vetting approvals, catalog management, and payment gateway integration.

---

## 🚀 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [NestJS 11](https://nestjs.com/) (TypeScript, Modular Architecture) |
| **Database ORM** | [Prisma ORM 6](https://www.prisma.io/) with Multi-File Schemas (`prisma/schema/*.prisma`) |
| **Relational Database** | [MariaDB](https://mariadb.org/) / MySQL 8+ |
| **Cache & Queue Broker** | [Redis](https://redis.io/) (BullMQ Queue Processing) |
| **Authentication & Security**| JWT (Access & Refresh Tokens), Argon2/Bcrypt, RBAC Guards |
| **API Documentation** | Swagger / OpenAPI 3.0 (`/api/docs`) |

---

## ⚡ Local Quick Start

### 1. Prerequisites
Ensure you have the following installed on your development machine:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **MariaDB / MySQL**: Running locally or via Docker
- **Redis**: Running locally or via Docker (Default: `redis://localhost:6379`)

### 2. Clone & Install Dependencies
```bash
cd engineers-clinic-backend
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and configure your database and Redis credentials:
```bash
cp .env.example .env
```
Example `.env`:
```env
# Database Connection (MariaDB / MySQL)
DATABASE_URL="mysql://root:password@localhost:3306/engineers_clinic"

# Server Port
PORT=5000

# Security & JWT Secrets
JWT_SECRET="super-secure-jwt-access-secret-2026"
JWT_REFRESH_SECRET="super-secure-jwt-refresh-secret-2026"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Redis Queue Connection
REDIS_HOST="localhost"
REDIS_PORT=6379

# AI Review Engine Provider (Optional / Mocked in Dev)
AI_EVALUATION_MODEL="gemini-1.5-pro"
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Database Push & Multi-Stage Seed
Push the Prisma schema to your MariaDB database and execute the comprehensive multi-stage seed script:
```bash
# Push schema tables
npx prisma db push

# Run full 7-stage academic & enterprise seed
npm run seed
```

### 5. Start Development Server
```bash
npm run start:dev
```
The server will boot on `http://localhost:5000`.
- **API Base URL**: `http://localhost:5000/api`
- **Swagger Interactive API Documentation**: `http://localhost:5000/api/docs`

---

## 🔑 Pre-Seeded Test Credentials

All accounts are created with password: **`Password@123!`**

| Role | Email | Campus / Name | Description |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@engineersclinic.com` | Engineers Clinic HQ | Global platform admin with all 19 permissions |
| **Super Admin** | `alex.admin@engineersclinic.com` | Engineers Clinic HQ | Operations & telemetry administrator |
| **College Admin** | `admin@vit.ac.in` | Vellore Institute of Technology (VIT) | Institutional partner with coupon batches & student cohort |
| **College Admin** | `dean.placements@iitm.ac.in`| IIT Madras | Partner college coordinator |
| **Student** | `priya.patel@vit.ac.in` | Priya Patel (VIT) | Multi-project enrolled student with active milestone tasks |
| **Student** | `rahul.sharma@iitm.ac.in` | Rahul Sharma (IITM) | Enrolled in AI/ML Track |

---

## 📚 Architecture & Deep Documentation

Detailed documentation is available in the [`docs/`](./docs) directory:

- 🏗️ **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — Modular design, security decorators, JWT authentication cycle, and request pipelines.
- 🗄️ **[docs/DATABASE.md](./docs/DATABASE.md)** — Multi-file Prisma schema breakdown, table relationships, and the 7-stage seed sequence.
- 📡 **[docs/API_REFERENCE.md](./docs/API_REFERENCE.md)** — REST API endpoint specification across all 8 backend modules.
- 🤖 **[docs/WORKERS.md](./docs/WORKERS.md)** — BullMQ background queue architecture and automated AI rubric grading engine.

---

## 🧪 Running Tests & Quality Checks

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Code formatting & linter
npm run lint

# Production build compilation
npm run build
```

---

## 🚢 Production Deployment

1. Set `NODE_ENV=production`.
2. Ensure database migrations are applied:
   ```bash
   npx prisma migrate deploy
   ```
3. Build and run production bundle:
   ```bash
   npm run build
   node dist/src/main.js
   ```

---
*Developed by the Engineers Clinic Core Engineering Team.*
