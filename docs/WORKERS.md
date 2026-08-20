# Background Workers & AI Grading Engine

This document explains the asynchronous queue architecture powered by **Redis** and **BullMQ** that automates the evaluation of student capstone code submissions.

---

## 🤖 1. Automated AI Evaluation Pipeline

When a student submits code for a milestone task on their dashboard, the backend triggers an asynchronous processing pipeline to evaluate their work against strict academic rubrics without blocking HTTP response times.

```
Student Dashboard
       │
       │ POST /student/tasks/:id/submit
       ▼
[StudentController]
       │
       ▼
[StudentService] ──► Creates Submission Record (Status: PENDING)
       │
       ▼
[BullMQ Queue Producer]
       │
       ▼ (Redis Queue: `submission-evaluation-queue`)
┌──────────────────────────────────────────────────────────┐
│                   BullMQ Worker Engine                   │
│                                                          │
│  1. Dequeues submission payload                          │
│  2. Resolves linked `TemplateTask` & `RubricCriteria`    │
│  3. Fetches GitHub repository / code artifacts           │
│  4. Calls AI Grading Engine with rubric context          │
│  5. Calculates weighted score (0 - 100)                  │
│  6. Generates constructive feedback breakdown            │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
              [Prisma Transactional Update]
   ┌─────────────────────────┴────────────────────────────┐
   │ 1. Upsert `AiReview` (Score, Feedback, Metrics)      │
   │ 2. Update `Submission` status (PASSED / FAILED)      │
   │ 3. Update `TaskProgress` status (PASSED / NEEDS_WORK)│
   │ 4. If all tasks passed: Unlock next Capstone Project │
   └──────────────────────────────────────────────────────┘
```

---

## ⚙️ 2. Redis & Queue Configuration

The queue configuration uses environment variables to connect to Redis:

```env
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
```

### BullMQ Queue Definition:
- **Queue Name**: `submission-evaluation-queue`
- **Concurrency**: 5 parallel jobs per worker instance
- **Retry Strategy**: Exponential backoff (3 attempts on network timeout)
- **Job Retention**: Completed jobs kept for 24 hours, failed jobs kept for 7 days for audit telemetry.

---

## 🎯 3. Rubric Evaluation Scoring Model

Each task is evaluated on a 100-point scale across weighted criteria:

| Criterion | Weight | Description |
| :--- | :---: | :--- |
| **Code Architecture & Patterns** | 30% | Proper folder structure, separation of concerns, clean interfaces |
| **Functional Completeness** | 40% | All requirements for the milestone task implemented |
| **Security & Error Handling** | 15% | Input validation, exception guards, secure credential management |
| **Documentation & Quality** | 15% | Clean comments, TypeScript typing, reproducible execution |

### Pass Threshold:
- Default pass threshold: **70 / 100**.
- **Score $\ge$ 70**: `TaskProgress` marked as `PASSED`. Next sequential milestone task unlocked.
- **Score < 70**: `TaskProgress` marked as `NEEDS_WORK`. Student receives actionable critique and can re-submit without penalty.

---

## 🛠️ 4. Monitoring & Telemetry

- **Super Admin Overview**: Submissions in queue appear under **"SUBMISSIONS AWAITING REVIEW"**.
- **Student Dashboard**: Real-time progress updates appear instantly under **"Latest AI Evaluation"** and the **Submissions** tab.
