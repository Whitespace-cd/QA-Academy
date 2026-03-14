# QA Training Platform

## Overview

A full-stack EdTech platform for Software Testing training that simulates real company QA training environments. Users learn concepts and complete practical exercises that are automatically evaluated.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (artifacts/qa-platform)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: JWT (stored in localStorage as 'qa_token')
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   │   └── src/
│   │       ├── routes/     # Auth, courses, lessons, exercises, submissions, bug reports, test cases, leaderboard, demo apps, admin
│   │       ├── middlewares/ # JWT auth middleware
│   │       └── lib/        # Auto-evaluation engine (evaluator.ts)
│   └── qa-platform/        # React + Vite frontend
│       └── src/
│           ├── pages/      # Landing, Auth, Dashboard, Courses, Lesson, Exercise, BugTracker, TestCases, Leaderboard
│           ├── components/ # Layout, UI components
│           └── hooks/      # use-auth (JWT auth context)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/     # users.ts, courses.ts, submissions.ts
└── scripts/                # Utility scripts
```

## Platform Features

### Core Modules
1. **User Authentication** - JWT-based, roles: student/instructor/admin
2. **Course Management** - 6 courses across 7 categories (foundations, manual-testing, automation-testing, api-testing, performance-testing, mobile-testing, cicd-testing)
3. **Hands-On Exercises** - 5 types: write-test-case, report-bug, write-automation, test-api, create-test-plan
4. **Auto-Evaluation Engine** - Scores submissions by type with feedback and suggestions
5. **Bug Tracker** - Jira-like bug reporting against 4 demo apps
6. **Test Case Writer** - Structured test case creation with evaluation
7. **Leaderboard** - Global ranking with levels and badges
8. **Demo Apps** - 4 intentionally buggy apps: ShopBuggy (e-commerce), SafeBank (banking), HR Plus, BuggyTodo
9. **Gamification** - Points, levels (1-10), badges, certificates

### Database Tables
- users, courses, modules, lessons, exercises, enrollments
- lesson_completions, submissions, bug_reports, test_cases
- demo_apps, known_bugs, badges, user_badges, certificates

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@qaplatform.com | password123 |
| Instructor | instructor@qaplatform.com | password123 |
| Student | student@qaplatform.com | password123 |

## API Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user
- `GET /api/courses` - List all courses
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/lessons/:id` - Get lesson with exercises
- `POST /api/submissions` - Submit exercise (auto-evaluated)
- `GET/POST /api/bug-reports` - Bug report management
- `GET/POST /api/test-cases` - Test case management
- `GET /api/leaderboard` - Global leaderboard
- `GET /api/demo-apps` - List practice apps
- `GET /api/admin/stats` - Admin statistics

## Development

```bash
# Run API server
pnpm --filter @workspace/api-server run dev

# Run frontend
pnpm --filter @workspace/qa-platform run dev

# Push DB schema changes
pnpm --filter @workspace/db run push

# Run OpenAPI codegen
pnpm --filter @workspace/api-spec run codegen
```
