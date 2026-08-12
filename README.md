# 🚀 Engineers Clinic Backend API

An enterprise-grade, scalable REST API for the **Engineers Clinic Platform**, built using **NestJS**, **Prisma 7** (with `@prisma/adapter-mariadb`), **MariaDB / MySQL**, **Passport JWT Authentication**, and **Swagger OpenAPI**.

---

## 🛠️ Technology Stack & Architecture

- **Core Framework**: NestJS 11 (TypeScript)
- **ORM / Database Adapter**: Prisma 7 (Multi-File Schema) with MariaDB Driver Adapter
- **Database**: MariaDB / MySQL
- **Authentication**: Passport.js with JWT Strategy (`@nestjs/jwt`, `bcrypt`)
- **API Documentation**: NestJS Swagger UI (Interactive docs at `/api/docs`)
- **Architecture**: Domain-Driven Modular Monolith (`src/modules/auth/`, `src/modules/catalog/`)
- **Testing**: Jest with Mirrored E2E Route Test Suites (`test/modules/`)

---

## 📂 Project Directory Structure

```text
engineers-clinic-backend/
├── src/
│   ├── main.ts                        # Entry point, CORS, ValidationPipe, Swagger
│   ├── app.module.ts                  # Root NestJS Application Module
│   ├── prisma/                        # Global Database Adapter Module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── modules/                       # 🧱 DOMAIN FEATURE MODULES
│       ├── auth/                      # Student & College Registration, Login, JWT
│       └── catalog/                   # Clusters, Topics, Technologies, Programs & Pricing
│           ├── clusters/
│           ├── topics/
│           ├── technologies/
│           └── programs/
│
├── prisma/
│   ├── schema/                        # 📂 MULTI-FILE PRISMA SCHEMA
│   │   ├── user.prisma                # User, Role, Country, Student, college, collegeMember
│   │   └── program.prisma             # Cluster, Topic, Technology, Program, ProgramPricing
│   └── seed.ts                        # Seeding script for Roles, Country, Clusters, Topics & Tech
│
└── test/                              # 🪞 MIRRORED E2E TEST SUITES
    ├── app.e2e-spec.ts
    └── modules/
        ├── auth/
        │   └── auth.controller.e2e-spec.ts
        └── catalog/
            ├── clusters/clusters.controller.e2e-spec.ts
            ├── topics/topics.controller.e2e-spec.ts
            ├── technologies/technologies.controller.e2e-spec.ts
            └── programs/programs.controller.e2e-spec.ts
```

---

## ⚙️ Environment Configuration (`.env`)

Create a `.env` file in the root directory:

```env
# Database Credentials
DATABASE_HOST="localhost"
DATABASE_PORT=3306
DATABASE_USER="engineers_user"
DATABASE_PASSWORD="password123"
DATABASE_NAME="engineers_clinic"
DATABASE_URL="mysql://engineers_user:password123@localhost:3306/engineers_clinic"

# JWT Authentication Secret
JWT_SECRET="engineers_clinic_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="7d"

# Server Port
PORT=4000
```

---

## 🛢️ Database & Prisma Commands

### 1. Generate Prisma Client
Generates the Prisma 7 client from all schema files inside `prisma/schema/`:
```bash
npx prisma generate
```

### 2. Synchronize Schema with Database (Push to MariaDB)
Pushes all multi-file table schemas directly to MariaDB without manual SQL migrations:
```bash
npx prisma db push
```

### 3. Seed Database (Roles, Country, Clusters, Topics & Technologies)
Populates default roles (`super_admin`, `admin`, `college`, `student`, `support`), default country (`India`), course clusters, topics, and technologies:
```bash
npx ts-node prisma/seed.ts
```

### 4. Launch Prisma Studio (GUI Database Manager)
Inspect and manage your MariaDB records via a web UI at `http://localhost:5555`:
```bash
npx prisma studio
```

---

## 🚀 Running the Server

### Development Mode (with Hot Reload / Watch Mode)
```bash
npm run start:dev
```

### Production Build
```bash
npm run build
```

### Production Server Run
```bash
npm run start:prod
```

---

## 🧪 Testing Commands

### 1. Run All End-to-End (E2E) Route Tests (Mirrored Routes)
Executes all 26+ route test cases covering Auth, Clusters, Topics, Technologies, Programs, and Pricing:
```bash
npm run test:e2e
```

### 2. Run Unit Tests
```bash
npm run test
```

### 3. Run Test Coverage Report
```bash
npm run test:cov
```

---

## 📚 API Documentation (Swagger UI)

When the backend server is running, interactive Swagger OpenAPI documentation is available at:

👉 **[http://localhost:4000/api/docs](http://localhost:4000/api/docs)**

---

## 🔑 Default Seeded Roles Hierarchy

| Role ID | Role Name | Access Level |
| :---: | :--- | :--- |
| **1** | `super_admin` | Platform Super Administrator |
| **2** | `admin` | Content & Operations Administrator |
| **3** | `college` | College Institution Partner |
| **4** | `student` | Student Enrolled Learner |
| **5** | `support` | Helpdesk & Support Staff |
