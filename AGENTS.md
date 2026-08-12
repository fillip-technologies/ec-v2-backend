ENGINEERS CLINIC

Platform Technical Architecture & Product Specification

Version 2.1  ·  Office of the CTO

An AI-evaluated, NEP-2020 aligned internship delivery platform for engineering, management, and law students — with a first-party academy model and a college (B2B) distribution channel.



| Field | Detail |
| --- | --- |
| Product | Engineers Clinic — Internship & Skilling Platform |
| Owner | Technosys IT Management Pvt. Ltd. |
| Document type | Architecture & specification (living document) |
| Prepared as | Chief Technology Officer |
| Status | Draft for engineering sign-off |
| Supersedes | v1.0 flow diagrams; updates v2.0 stack section + adds flowcharts |


Field

Detail

Product

Engineers Clinic — Internship & Skilling Platform

Owner

Technosys IT Management Pvt. Ltd.

Document type

Architecture & specification (living document)

Prepared as

Chief Technology Officer

Status

Draft for engineering sign-off

Supersedes

v1.0 flow diagrams; updates v2.0 stack section + adds flowcharts


# Contents

TOC \h \o "1-2"Contents PAGEREF _Toc236392376 \h 2

1. Executive summary PAGEREF _Toc236392377 \h 3

2. System architecture PAGEREF _Toc236392378 \h 3

3. Domain model PAGEREF _Toc236392379 \h 5

4. Roles & access control PAGEREF _Toc236392380 \h 7

5. Core flows PAGEREF _Toc236392381 \h 8

5.1 Admin — content authoring PAGEREF _Toc236392382 \h 8

5.2 Student — registration to enrolment PAGEREF _Toc236392383 \h 8

5.3 Student — workspace & step progression PAGEREF _Toc236392384 \h 9

5.4 College — B2B distribution PAGEREF _Toc236392385 \h 10

5.5 Payment PAGEREF _Toc236392386 \h 11

5.6 Referral PAGEREF _Toc236392387 \h 12

5.7 Certificate PAGEREF _Toc236392388 \h 12

6. AI evaluation subsystem PAGEREF _Toc236392389 \h 14

7. External integrations PAGEREF _Toc236392390 \h 16

8. Non-functional requirements PAGEREF _Toc236392391 \h 16

9. Technology stack (confirmed) PAGEREF _Toc236392392 \h 17

10. What changed from v1 (and why) PAGEREF _Toc236392393 \h 18

11. Phased build order PAGEREF _Toc236392394 \h 20

12. Open decisions & risks PAGEREF _Toc236392395 \h 20


# 1. Executive summary

Engineers Clinic is a project-based internship platform. A student picks a stream, enrols in an internship programme, selects three projects, and works through a guided, step-by-step workspace. Each submission is graded by an AI evaluation engine against a fixed rubric; passing a step unlocks the next, and completing all three projects generates a verifiable certificate.

The platform is sold two ways. Students can self-register and pay directly, and colleges can buy internship seats in bulk and distribute zero-cost coupons to their own students. Both routes converge on the same enrolment, workspace, evaluation, and certificate pipeline, which keeps the delivery engine single and the go-to-market flexible.

This version rewrites the v1 flow diagrams into a system that engineering can build against. It defines the domain model, role-based access, the state machines behind each flow, the asynchronous AI-evaluation subsystem, non-functional requirements, and a phased build order. Section 11 lists exactly what changed from v1 and why.


# 2. System architecture

The platform is a modular monolith with one asynchronous worker tier for AI evaluation. A monolith keeps the domain (enrolment, workspace, evaluation, certificates) transactional and easy to reason about at our current scale; evaluation is pulled out into a queue because it is slow, bursty, and dependent on a third-party LLM.


### 2.1 Logical tiers

Client tier — student dashboard, college dashboard, and admin console. Single web app, role-aware rendering.

Application tier — HTTP API and server-rendered admin. Owns authentication, catalogue, enrolment, payments, workspace progression, referrals, and certificate issuance.

Async worker tier — a queue plus workers that call the LLM, score against the rubric, persist the review, and emit the "step passed" event.

Data tier — primary relational database, Redis for queue and cache, and object storage for submissions, generated PDFs, and resources.

External services — payment gateway, transactional email, and the LLM provider.


### 2.2 High-level flow

Client (Next.js)  →  API (NestJS)  →  MySQL  →  Queue (Redis)  →  AI Worker (BullMQ)  →  OpenAI

Read and write paths are synchronous through the API. Only evaluation crosses into the worker tier; the client polls or receives a notification when a review lands. This isolates LLM latency and outages from the rest of the product — a slow model never blocks a login, a payment, or a dashboard load.

Figure 1 — System architecture: clients, API tier, data stores, the BullMQ worker tier, and external services.


# 3. Domain model

Two clean layers. Catalogue entities are authored once by admins and reused; delivery entities are created per student at enrolment. Keeping them separate means editing a template never mutates a student's in-progress work.


### 3.1 Catalogue (authored by admin)



| Entity | Purpose | Key relationships |
| --- | --- | --- |
| Country | Top-level catalogue partition | has many Streams |
| Stream | Discipline (e.g. Engineering, Management, Law) | has many Internship Programs |
| Internship Program | A sellable 120-hour programme | has a Project Pool; has a price/coupon policy |
| Project | A unit of work a student can select | has one Workspace Template |
| Workspace Template | Blueprint of steps for a project | has many Steps |
| Step | An ordered stage within a project | has many Tasks; has one Rubric |
| Task | A concrete deliverable inside a step | belongs to a Step |
| Resource | Reference material (files, links) | attached to Step or Project |
| Rubric | AI scoring criteria for a step | used by the evaluation engine |
| Coupon Batch | Set of redeemable codes | belongs to College or Campaign |


Entity

Purpose

Key relationships

Country

Top-level catalogue partition

has many Streams

Stream

Discipline (e.g. Engineering, Management, Law)

has many Internship Programs

Internship Program

A sellable 120-hour programme

has a Project Pool; has a price/coupon policy

Project

A unit of work a student can select

has one Workspace Template

Workspace Template

Blueprint of steps for a project

has many Steps

Step

An ordered stage within a project

has many Tasks; has one Rubric

Task

A concrete deliverable inside a step

belongs to a Step

Resource

Reference material (files, links)

attached to Step or Project

Rubric

AI scoring criteria for a step

used by the evaluation engine

Coupon Batch

Set of redeemable codes

belongs to College or Campaign


### 3.2 Delivery (created per student)



| Entity | Purpose | Key relationships |
| --- | --- | --- |
| Student | The learner account | has many Enrollments; has a Referral code |
| College | B2B account | buys Seats; owns Coupon Batches |
| Enrollment | A student in one programme | has 3 selected Projects; has a Workspace |
| Student Workspace | The student's live copy of templates | has many Step Progress rows |
| Step Progress | State of one step for one student | has many Submissions |
| Submission | A student's uploaded/attempted work | has one AI Review |
| AI Review | Score, grade, feedback, improvements | belongs to a Submission |
| Certificate | Issued on completion | has QR + verification record |
| Referral / Commission | Referral tracking and payout | credits a Wallet |
| Wallet | Student referral balance | belongs to a Student |


Entity

Purpose

Key relationships

Student

The learner account

has many Enrollments; has a Referral code

College

B2B account

buys Seats; owns Coupon Batches

Enrollment

A student in one programme

has 3 selected Projects; has a Workspace

Student Workspace

The student's live copy of templates

has many Step Progress rows

Step Progress

State of one step for one student

has many Submissions

Submission

A student's uploaded/attempted work

has one AI Review

AI Review

Score, grade, feedback, improvements

belongs to a Submission

Certificate

Issued on completion

has QR + verification record

Referral / Commission

Referral tracking and payout

credits a Wallet

Wallet

Student referral balance

belongs to a Student

Design rule: a Student Workspace is a snapshot copy of the Workspace Template taken at enrolment. Admins can revise templates freely without disturbing anyone mid-internship. New enrolments pick up the new version.


# 4. Roles & access control

Four roles. Access is enforced server-side on every request — the client hides what a role can't do, but the API is the real boundary.



| Capability | Super Admin | Admin | College | Student | Support |
| --- | --- | --- | --- | --- | --- |
| Manage catalogue | ✓ | ✓ | — | — | — |
| Configure AI rubrics | ✓ | ✓ | — | — | — |
| Manage colleges / seats | ✓ | ✓ | own | — | view |
| Generate coupons | ✓ | ✓ | own batch | — | — |
| View all reports | ✓ | ✓ | own | own | read |
| Enrol & do projects | — | — | — | ✓ | — |
| Issue / revoke certificate | ✓ | ✓ | — | — | — |
| Impersonate for support | ✓ | — | — | — | limited |


Capability

Super Admin

Admin

College

Student

Support

Manage catalogue

✓

✓

—

—

—

Configure AI rubrics

✓

✓

—

—

—

Manage colleges / seats

✓

✓

own

—

view

Generate coupons

✓

✓

own batch

—

—

View all reports

✓

✓

own

own

read

Enrol & do projects

—

—

—

✓

—

Issue / revoke certificate

✓

✓

—

—

—

Impersonate for support

✓

—

—

—

limited

Note: a College role is scoped to its own seats, coupons, students, and reports only — never global data. Support gets read access plus a limited, audited impersonation path so it can reproduce a student issue without holding write power.


# 5. Core flows

Each flow below is written as an ordered sequence with the decisions and failure branches an engineer needs. The happy path is the numbered list; branches and edge cases follow.


## 5.1 Admin — content authoring

Country  →  Stream  →  Program  →  Project Pool  →  Workspace Template  →  Steps / Tasks  →  Rubric  →  Resources  →  Publish

Admins build the catalogue top-down. A programme cannot be published until every project in its pool has a workspace template with at least one step, each step has a rubric, and pricing/coupon policy is set. Publishing is an explicit gate, not an auto-state, so half-built programmes never reach students.


## 5.2 Student — registration to enrolment

Land on programme page, register, verify via email OTP, log in.

Select country → browse streams → choose an internship programme.

View the project pool and select exactly three projects.

At checkout, choose to pay or apply a coupon.

On payment success or valid coupon, an Enrollment is created and the Student Workspace is generated from the three templates.

Branches: OTP expiry re-issues a code (rate-limited). Fewer or more than three projects blocks checkout. A failed payment leaves the order PENDING and is retryable; no workspace is generated until the order is PAID. An invalid or exhausted coupon is rejected before order creation.

Figure 2 — Onboarding to enrollment, including the coupon branch.


## 5.3 Student — workspace & step progression

Open Project  →  Step N  →  Complete Tasks  →  Submit  →  AI Review  →  Pass?

Steps are strictly ordered and gated. A student works the tasks in a step, submits, and waits for the asynchronous AI review. A pass unlocks the next step; a fail returns actionable feedback and keeps the step open for another attempt. Projects run in parallel — a student can progress Project 2 while Project 1's review is queued — but steps within a project are sequential.

Guardrail: resubmissions per step are capped (configurable) to control LLM cost and discourage brute-forcing the grader. Hitting the cap routes the step to manual review rather than hard-blocking the student.

Figure 3 — Workspace progression: step gating, the AI pass/fail loop, and completion through all three projects.


## 5.4 College — B2B distribution

College registers; admin approves the account.

College purchases internship seats; an invoice is raised and paid.

A coupon batch equal to the seat count is generated and shared with students.

Students register and apply a coupon; their payable amount is ₹0.

Enrolment, workspace, evaluation, and certificates run identically to the direct path.

The college dashboard reports progress, completion, and certificates for its cohort.

Control: coupons are single-use and bound to the batch's programme, so a batch bought for one programme cannot be spent on another. Seat count and redeemed count are reconciled on every redemption.


## 5.5 Payment

Select Program  →  Create Order  →  Coupon?  →  Gateway / Discount  →  Success  →  Enrollment

Orders are created server-side and confirmed by a gateway webhook, never by a client callback alone — the webhook is the source of truth for PAID. Coupons are validated and locked at order creation to prevent double-spend under concurrency. Every order carries a reconciliation record so finance can match gateway settlements to enrolments.

Figure 4 — Payment flow: coupon branch, webhook-confirmed PAID state, and reconciliation.


## 5.6 Referral

Student registers  →  Referral code issued  →  Friend pays  →  Commission accrued  →  Wallet credited

Commission is credited only after the referred payment clears and passes a refund-hold window, so refunds don't create negative balances. Coupon-based (₹0) enrolments do not generate commission — referral rewards attach to real revenue only. Payout thresholds and terms live in configuration.


## 5.7 Certificate

3 Projects complete  →  Min score verified  →  Certificate + QR  →  PDF  →  Email + verify page

A certificate is issued only when all three projects are complete and each meets the configured minimum score. Every certificate gets a unique ID and a QR that resolves to a public verification page showing name, programme, issue date, and status. Certificates can be revoked (e.g. on proven misconduct); the verification page then reads REVOKED rather than disappearing, which keeps outstanding QR codes honest.


# 6. AI evaluation subsystem

This is the highest-risk, highest-cost part of the platform, so it gets its own design. Evaluation is asynchronous, idempotent, and bounded on cost.

Submission  →  Enqueue  →  Worker  →  LLM call  →  Rubric scoring  →  Persist review  →  Notify + unlock

Figure 5 — AI evaluation pipeline with schema validation, retry/backoff, dead-letter, and threshold branches.


### 6.1 Pipeline

A submission enqueues an evaluation job keyed by submission ID (idempotent — a duplicate enqueue is a no-op).

A worker pulls the job, loads the step's rubric, and builds a structured prompt from the submission and rubric.

The LLM returns a structured result; the worker validates it against the expected schema (score, grade, feedback, improvements).

The review is persisted; the submission moves to PASSED or NEEDS_WORK; on pass, the next step unlocks and the student is emailed.


### 6.2 Reliability & cost controls

Retries with backoff on transient LLM errors; a dead-letter queue captures repeated failures for manual review instead of silently dropping a student's work.

Schema validation on every model response; a malformed result is retried, then escalated — a student never sees a broken or empty review.

Resubmission caps and rate limits bound per-student LLM spend and blunt prompt-injection or grader-gaming attempts embedded in submissions.

Prompt hardening — submission content is treated as untrusted data, never as instructions, so a student can't tell the grader to award full marks.

Model abstraction — the provider sits behind an interface so we can switch or route models without touching the rubric or the pipeline.

Human-in-the-loop — borderline scores and cap-exceeded steps route to an admin queue for manual grading, so automation degrades gracefully.


### 6.3 Submission state machine



| State | Meaning | Transitions to |
| --- | --- | --- |
| QUEUED | Awaiting a worker | EVALUATING |
| EVALUATING | Worker is calling the LLM | PASSED / NEEDS_WORK / FAILED |
| PASSED | Met the rubric threshold | — (step unlocks) |
| NEEDS_WORK | Below threshold, feedback given | QUEUED (on resubmit) |
| FAILED | System error after retries | MANUAL_REVIEW |
| MANUAL_REVIEW | Escalated to an admin | PASSED / NEEDS_WORK |


State

Meaning

Transitions to

QUEUED

Awaiting a worker

EVALUATING

EVALUATING

Worker is calling the LLM

PASSED / NEEDS_WORK / FAILED

PASSED

Met the rubric threshold

— (step unlocks)

NEEDS_WORK

Below threshold, feedback given

QUEUED (on resubmit)

FAILED

System error after retries

MANUAL_REVIEW

MANUAL_REVIEW

Escalated to an admin

PASSED / NEEDS_WORK

Figure 6 — Submission state machine.


# 7. External integrations



| Concern | Integration | Design note |
| --- | --- | --- |
| Payments | Razorpay (or equivalent India gateway) | Webhook-confirmed; reconciliation record per order |
| Email / OTP | Transactional email provider | Verification, reviews, certificates; sender aligned to one domain |
| LLM | Provider behind an abstraction | Swappable; structured output; cost + latency logged |
| Object storage | S3-compatible bucket | Submissions, generated PDFs, resources; signed URLs |
| Queue / cache | Redis | Evaluation queue, rate limits, session cache |


Concern

Integration

Design note

Payments

Razorpay (or equivalent India gateway)

Webhook-confirmed; reconciliation record per order

Email / OTP

Transactional email provider

Verification, reviews, certificates; sender aligned to one domain

LLM

Provider behind an abstraction

Swappable; structured output; cost + latency logged

Object storage

S3-compatible bucket

Submissions, generated PDFs, resources; signed URLs

Queue / cache

Redis

Evaluation queue, rate limits, session cache

Domain hygiene: all outbound mail, links, and certificate verification URLs must resolve to a single canonical domain. Mismatched sending and signature domains read as a credibility risk to colleges and hurt deliverability — this is a hard requirement, not a nicety.


# 8. Non-functional requirements



| Area | Requirement |
| --- | --- |
| Scalability | Evaluation must absorb bursts (batch cohorts submitting near a deadline) by scaling workers horizontally without affecting web latency. |
| Availability | Web/API and payments target high availability; evaluation may lag under load but must never lose a submission. |
| Security | Server-side RBAC, encrypted secrets at rest, signed URLs for files, audit log for admin and impersonation actions. |
| Data privacy | Handle student PII under India's DPDP Act 2023 — consent, purpose limitation, deletion path, and college-scoped data isolation. |
| Compliance | Programme structure and hours align to NEP-2020; certificates carry verifiable, revocable records. |
| Observability | Trace every submission end-to-end; alert on queue depth, LLM error rate, and payment webhook failures. |
| Cost control | Per-student and per-cohort LLM spend is bounded and reported; resubmission caps enforced. |


Area

Requirement

Scalability

Evaluation must absorb bursts (batch cohorts submitting near a deadline) by scaling workers horizontally without affecting web latency.

Availability

Web/API and payments target high availability; evaluation may lag under load but must never lose a submission.

Security

Server-side RBAC, encrypted secrets at rest, signed URLs for files, audit log for admin and impersonation actions.

Data privacy

Handle student PII under India's DPDP Act 2023 — consent, purpose limitation, deletion path, and college-scoped data isolation.

Compliance

Programme structure and hours align to NEP-2020; certificates carry verifiable, revocable records.

Observability

Trace every submission end-to-end; alert on queue depth, LLM error rate, and payment webhook failures.

Cost control

Per-student and per-cohort LLM spend is bounded and reported; resubmission caps enforced.


# 9. Technology stack (confirmed)

The stack is confirmed and coherent: TypeScript end-to-end, one hiring profile, and shared types across web and API. The decision that was open in v1 is now settled — the AI evaluation worker runs natively as a NestJS/BullMQ consumer, so there is no second runtime and no language boundary between the API and the worker. This is the right shape for the team's size.


### 9.1 Confirmed stack



| Layer | Technology | Why it fits |
| --- | --- | --- |
| Frontend | Next.js + TypeScript | SSR for the enrolment funnel; role-aware dashboards; shared types with the API |
| Backend | NestJS + TypeScript | Modules/DI map cleanly onto our domain (catalogue, enrolment, billing, evaluation) |
| ORM | Prisma | Type-safe queries and migrations; models the catalogue/delivery split quickly |
| Database | MySQL 8 | Relational fit for enrolment and step-progress; JSON + CTE support is sufficient |
| Cache | Redis | Also backs rate limiting, sessions, and the refresh-token denylist |
| Queue | BullMQ | Native Node queue with built-in rate limiting — use it to respect OpenAI limits |
| Storage | Cloudflare R2 / S3 | Submissions, certificate PDFs, resources; R2 avoids egress fees on public certs |
| Auth | JWT + refresh tokens | Short-lived access + rotating refresh; keep the rotation/denylist in Redis |
| AI | OpenAI | Kept behind an interface (see §6) so models can be routed or swapped |
| Payments | Razorpay + Stripe | Razorpay for India (UPI/INR), Stripe for international — behind one interface |
| Deployment | Docker + Nginx + PM2 | Containers behind Nginx; see the PM2 note below |
| Monitoring | Grafana + Prometheus + Sentry | Prometheus/Grafana for infra + queue metrics; Sentry for app errors |


Layer

Technology

Why it fits

Frontend

Next.js + TypeScript

SSR for the enrolment funnel; role-aware dashboards; shared types with the API

Backend

NestJS + TypeScript

Modules/DI map cleanly onto our domain (catalogue, enrolment, billing, evaluation)

ORM

Prisma

Type-safe queries and migrations; models the catalogue/delivery split quickly

Database

MySQL 8

Relational fit for enrolment and step-progress; JSON + CTE support is sufficient

Cache

Redis

Also backs rate limiting, sessions, and the refresh-token denylist

Queue

BullMQ

Native Node queue with built-in rate limiting — use it to respect OpenAI limits

Storage

Cloudflare R2 / S3

Submissions, certificate PDFs, resources; R2 avoids egress fees on public certs

Auth

JWT + refresh tokens

Short-lived access + rotating refresh; keep the rotation/denylist in Redis

AI

OpenAI

Kept behind an interface (see §6) so models can be routed or swapped

Payments

Razorpay + Stripe

Razorpay for India (UPI/INR), Stripe for international — behind one interface

Deployment

Docker + Nginx + PM2

Containers behind Nginx; see the PM2 note below

Monitoring

Grafana + Prometheus + Sentry

Prometheus/Grafana for infra + queue metrics; Sentry for app errors


### 9.2 Engineering notes & hardening

PM2 + Docker — one restart layer, not two. Either PM2 cluster mode inside the container (to use all cores) or multiple stateless container replicas behind Nginx — not both supervising each other. Run workers as their own containers, scaled separately from the API.

Prisma + MySQL pooling. The API and worker tiers need separate, bounded connection pools. A burst of BullMQ workers can exhaust MySQL connections and starve the API — cap worker concurrency and pool size deliberately.

BullMQ rate limiting. Use BullMQ's limiter to stay under OpenAI's request/token ceilings. Without it, a cohort-deadline burst trips provider limits and cascades into retries.

Auth handling. Short-lived access tokens, rotating refresh tokens with a Redis-backed denylist, refresh token in an httpOnly cookie. This is student PII under DPDP — get it right on day one.

Payment abstraction. Keep Razorpay and Stripe behind a single provider interface so order creation, webhooks, and reconciliation never fork per gateway.

Secrets. OpenAI/Razorpay/Stripe keys live in a secret store, encrypted at rest — never in the repo or the client bundle.

Not in the list, needed early: a transactional email provider (SES / Resend / Postmark) — OTP, reviews, and certificates all depend on it; a CI/CD pipeline (build image → migrate → deploy); and automated MySQL backups with R2 versioning.


### 9.3 Deployment topology

Start on a single Docker host: Nginx terminates TLS and routes to the web and API containers, workers run as their own scalable containers, and the stateful services (MySQL, Redis, R2) plus observability sit alongside. When one host is no longer enough, the same container layout lifts onto a managed orchestrator without redesign.

Figure 7 — Deployment topology on the confirmed stack.


# 10. What changed from v1 (and why)



| Change | Reason |
| --- | --- |
| Separated catalogue vs. delivery entities; workspace is a snapshot | Editing a template no longer corrupts in-progress student work |
| Added explicit state machines for submissions and orders | v1 flows had branches but no defined states; engineers need states to build |
| Made evaluation idempotent with retries + dead-letter + manual fallback | v1 assumed the AI path always succeeds; it won't — this fails safe |
| Added resubmission caps, rate limits, prompt hardening | Controls LLM cost and closes grader-gaming / injection gaps |
| Webhook-confirmed payments + reconciliation records | v1 marked success client-side; that under-counts and over-counts revenue |
| Referral commission gated on cleared payment; ₹0 coupons excluded | Prevents refund-driven negative balances and reward farming |
| Revocable certificates with a public verify page | v1 issued and emailed only; verification and revocation add trust |
| Single canonical domain requirement | Removes the deliverability and credibility risk from mismatched domains |
| Explicit RBAC matrix with college data scoping | v1 listed admin actions but not the permission boundaries |


Change

Reason

Separated catalogue vs. delivery entities; workspace is a snapshot

Editing a template no longer corrupts in-progress student work

Added explicit state machines for submissions and orders

v1 flows had branches but no defined states; engineers need states to build

Made evaluation idempotent with retries + dead-letter + manual fallback

v1 assumed the AI path always succeeds; it won't — this fails safe

Added resubmission caps, rate limits, prompt hardening

Controls LLM cost and closes grader-gaming / injection gaps

Webhook-confirmed payments + reconciliation records

v1 marked success client-side; that under-counts and over-counts revenue

Referral commission gated on cleared payment; ₹0 coupons excluded

Prevents refund-driven negative balances and reward farming

Revocable certificates with a public verify page

v1 issued and emailed only; verification and revocation add trust

Single canonical domain requirement

Removes the deliverability and credibility risk from mismatched domains

Explicit RBAC matrix with college data scoping

v1 listed admin actions but not the permission boundaries


# 11. Phased build order

Ship the spine first, then the AI, then growth features. Each phase is independently useful and de-risks the next.



| Phase | Scope | Definition of done |
| --- | --- | --- |
| 1 | Catalogue + auth + enrolment | Admin authors a programme; a student registers, selects 3 projects, and gets a workspace (payment stubbed) |
| 2 | Payments + coupons + college seats | Direct pay and college coupon paths both create enrolments; webhooks + reconciliation live |
| 3 | Workspace progression + AI evaluation | Steps gate correctly; async grading with retries, caps, and manual fallback |
| 4 | Certificates + verification | Completion issues a QR certificate with a working public verify + revoke page |
| 5 | Referrals + reporting + observability | Wallet/commission with refund holds; dashboards; end-to-end tracing and alerts |


Phase

Scope

Definition of done

1

Catalogue + auth + enrolment

Admin authors a programme; a student registers, selects 3 projects, and gets a workspace (payment stubbed)

2

Payments + coupons + college seats

Direct pay and college coupon paths both create enrolments; webhooks + reconciliation live

3

Workspace progression + AI evaluation

Steps gate correctly; async grading with retries, caps, and manual fallback

4

Certificates + verification

Completion issues a QR certificate with a working public verify + revoke page

5

Referrals + reporting + observability

Wallet/commission with refund holds; dashboards; end-to-end tracing and alerts


# 12. Open decisions & risks

Worker concurrency vs. OpenAI limits — BullMQ concurrency and the OpenAI rate limit must be tuned together; a cohort-deadline burst is the stress case. Load-test this before selling large college batches.

Grading fairness — LLM scoring drifts. We need periodic human calibration against a sample and a rubric-versioning policy.

LLM cost at scale — model cost profile changes with cohort size and resubmissions has to be modelled before we sell large college batches.

Certificate credibility — any partner/institution claims on the platform or its marketing must be verifiable before they face academic decision-makers.

Data residency — confirm DPDP obligations on where student PII and submissions are stored, especially if the LLM provider is offshore.

Prepared as CTO, Engineers Clinic. This is a living document — flows, states, and stack decisions should be revised as the build informs them.
