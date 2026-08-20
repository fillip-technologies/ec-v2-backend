# Backend Architecture & System Design

This document details the internal design, module dependency graph, request lifecycle, authentication mechanisms, and security model of the **Engineers Clinic Backend**.

---

##  1. High-Level Architectural Diagram

```
                              ┌────────────────────────────────────────┐
                              │           Next.js Frontend             │
                              │     (Admin, College, Student UI)       │
                              └───────────────────┬────────────────────┘
                                                  │ HTTPS / REST (JWT)
                                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                  NestJS 11 Application                                   │
│                                                                                          │
│  ┌────────────────────────────────── Global Middleware ───────────────────────────────┐  │
│  │   CORS Interceptor  •  Helmet Security  •  Rate Limiting  •  ValidationPipe (DTOs) │  │
│  └──────────────────────────────────────────────┬─────────────────────────────────────┘  │
│                                                 ▼                                        │
│  ┌────────────────────────────────────── Guard Layer ─────────────────────────────────┐  │
│  │   JwtAuthGuard (Passport)  ──►  RolesGuard (@Roles)  ──►  PermissionsGuard (@Perm) │  │
│  └──────────────────────────────────────────────┬─────────────────────────────────────┘  │
│                                                 ▼                                        │
│  ┌────────────────────────────────── Modular Business Layer ──────────────────────────┐  │
│  │                                                                                    │  │
│  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │  │
│  │  │ AuthModule   │   │CatalogModule │   │StudentModule │   │CollegeModule │         │  │
│  │  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘         │  │
│  │         │                  │                  │                  │                 │  │
│  │  ┌──────┴───────┐   ┌──────┴───────┐   ┌──────┴───────┐   ┌──────┴───────┐         │  │
│  │  │ AdminModule  │   │PaymentModule │   │AnalyticsMod. │   │CountryModule │         │  │
│  │  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘         │  │
│  │         │                  │                  │                  │                 │  │
│  │         └──────────────────┼──────────────────┼──────────────────┘                 │  │
│  │                            ▼                  ▼                                    │  │
│  │                 ┌────────────────────┐ ┌───────────────┐                           │  │
│  │                 │ Prisma ORM Service │ │ BullMQ Engine │                           │  │
│  │                 └─────────┬──────────┘ └───────┬───────┘                           │  │
│  └───────────────────────────┼────────────────────┼───────────────────────────────────┘  │
└──────────────────────────────┼────────────────────┼──────────────────────────────────────┘
                               │                    │
                               ▼                    ▼
                    ┌──────────────────┐ ┌────────────────────┐
                    │ MariaDB Database │ │ Redis Queue Broker │
                    └──────────────────┘ └────────────────────┘
```

---

##  2. Module Dependency Graph

The backend is built as a strictly modular NestJS system located under `src/modules/`:

| Module | Core Responsibility | Key Services & Dependencies |
| :--- | :--- | :--- |
| **`AuthModule`** | Authentication, password hashing, JWT issue/refresh, role permission resolution, user profile. | `AuthService`, `JwtStrategy`, `RefreshTokenStrategy`, `PrismaService` |
| **`CatalogModule`** | Academic clusters, topics, technologies, programs, multi-currency pricing, rubrics, capstones. | `CatalogService`, `PrismaService` |
| **`StudentModule`** | Student workspace, milestone task board, deliverable submissions, certificate eligibility. | `StudentService`, `PrismaService` |
| **`CollegeModule`** | Institutional campus cohort telemetry, B2B coupon batches, seat allocation, completion reports. | `CollegeService`, `PrismaService` |
| **`AdminModule`** | Super admin platform intelligence, college application vetting, user RBAC, coupon governance, telemetry. | `AdminService`, `PrismaService` |
| **`PaymentsModule`**| Multi-gateway order capture (Razorpay / Stripe), Webhook signature verification, idempotent invoice creation. | `PaymentsService`, `PrismaService` |
| **`AnalyticsModule`**| Aggregate statistics, real-time KPI computation, retention and completion telemetry. | `AnalyticsService`, `PrismaService` |
| **`CountriesModule`**| Supported operational regions, localized currencies (INR, USD, GBP, AED), tax & locale configs. | `CountriesService`, `PrismaService` |

---

##  3. Enterprise RBAC & Security Guard Chain

Every incoming request passes through a 3-stage security gate before reaching the controller handler:

```
Incoming Request
      │
      ▼
1. [JwtAuthGuard] ─────► Verifies Bearer JWT signature & checks token expiry.
      │                  Attaches authenticated User payload to `req.user`.
      ▼
2. [RolesGuard] ───────► Checks `@Roles('super_admin', 'college', 'student')`
      │                  Validates user role against allowed list.
      ▼
3. [PermissionsGuard] ─► Checks `@Permissions('college:vet', 'report:view')`
      │                  Verifies exact granular capability in `roles_permissions`.
      ▼
Controller Handler Execution
```

### Decorator Examples:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('super_admin', 'admin')
@Permissions('college:vet')
@Patch('colleges/:id/status')
async updateCollegeStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
  return this.adminService.updateCollegeStatus(id, dto.status);
}
```

---

##  4. Dual-Token JWT Lifecycle

1. **Access Token**: Short-lived (`15 minutes`), containing `{ sub: userId, email: userEmail, role: roleName }`. Sent in the `Authorization: Bearer <token>` header.
2. **Refresh Token**: Long-lived (`7 days`), securely stored or sent via `POST /auth/refresh`.
3. **Auto-Refresh Handshake**:
   - When the frontend receives a `401 Unauthorized`, the client interceptor automatically halts pending requests, calls `/auth/refresh`, updates the token, and replays the original request seamlessly.

---

##  5. Error Handling & Data Validation

- **Global Validation Pipe**: Strips unknown properties (`whitelist: true`) and transforms payloads to typed DTO classes with `class-validator` (`transform: true`).
- **Standardized HTTP Responses**: All exceptions throw native NestJS HTTP exceptions (`NotFoundException`, `ForbiddenException`, `BadRequestException`, `ConflictException`) with structured JSON error bodies:
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password is too short"],
  "error": "Bad Request"
}
```
