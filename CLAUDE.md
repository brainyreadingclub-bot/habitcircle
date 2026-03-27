# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm start            # Start production server
npm run lint         # ESLint (flat config, ESLint 9)
```

No test framework is configured. No seed script — use the app's signup/onboarding flow to create data.

## CRITICAL: Data Safety Rules

- **NEVER delete or modify `habitcircle.db` directly.** Use API routes and migrations only.
- Schema changes go in `db/index.ts` migrations (use `migrateAddColumn`), not by recreating the DB.

## Architecture

**HabitCircle** is a mobile-first habit tracking and social sharing app. All UI text is in Korean.

**Stack:** Next.js 16.2.1 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · SQLite (better-sqlite3) · JWT auth (jose) · bcryptjs

### Route Groups

- `src/app/(auth)/` — Login and signup pages (public)
- `src/app/(main)/` — Protected pages: dashboard, habits, circles, profile, friends, onboarding. Shares a layout with bottom navigation bar.
- `src/app/api/` — REST API: auth, habits, circles, friends, feed, stats

### Key Modules

- `src/proxy.ts` — Auth middleware. Validates JWT, redirects unauthenticated web requests to `/login`, returns 401 for API requests. This is NOT `middleware.ts`.
- `src/lib/auth.ts` — JWT creation/verification, password hashing (bcryptjs, 12 rounds), session cookie management (HTTP-only, 7-day expiry)
- `src/lib/db/index.ts` — SQLite connection singleton with WAL mode and foreign keys enabled. Auto-initializes schema on first connection.
- `src/lib/db/schema.sql` — Full database schema (users, habits, habit_logs, friendships, circles, circle_members, circle_habits)
- `src/lib/streaks.ts` — Streak calculation (current + longest) from habit logs
- `src/lib/utils.ts` — Date formatting, JSON response helpers, invite code generation

### Data Flow

API routes use raw SQL with better-sqlite3 (no ORM). Database file is `habitcircle.db` at project root (gitignored). Habit logging enforces unique constraint on (habit_id, date). Social feed aggregates shared habits from accepted friends only.

### Auth Flow

Signup/login → bcrypt verify → JWT (HS256) → `session` HTTP-only cookie. `src/proxy.ts` validates on every request. Public paths: `/`, `/login`, `/signup` and their API equivalents.

## Environment Variables

```bash
JWT_SECRET=...       # Required in production. Falls back to a default in dev (with console warning).
```

## Conventions

- Path alias: `@/*` maps to `src/*`
- `next.config.ts` declares `better-sqlite3` as a server external package
- Tailwind v4 via `@tailwindcss/postcss` — theme defined in `src/app/globals.css` (custom colors: cream, charcoal, teal, coral, lavender; micro-interaction animations)
- Mobile-first layout (max-w-lg centered)
