# FineSet — Jewelry Store SaaS

Multi-tenant SaaS platform for jewelry store chains with Staff, Store, and Master Admin portals.

## Tech Stack

- Next.js 16 (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui design system
- Prisma + PostgreSQL (Supabase)
- Supabase Auth (email/password, invite onboarding)
- React Query + Server-Sent Events for live sync

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in:

- `DATABASE_URL` — Supabase Postgres connection string (use **transaction pooler** URL in production: `*.pooler.supabase.com:6543?pgbouncer=true`)
- `DIRECT_URL` — Direct Postgres URL for Prisma migrations only (`db.*.supabase.co:5432`; locally can match `DATABASE_URL`)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — server-only (invites, bootstrap)
- `ENCRYPTION_KEY` — `openssl rand -hex 32`
- `MASTER_ADMIN_EMAIL` / `MASTER_ADMIN_PASSWORD` — first admin bootstrap

In Supabase Dashboard → Authentication → URL configuration, add:

- Site URL: `http://localhost:3000` (use your production URL on Vercel)
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://project-fineset.vercel.app/auth/callback` (production)

**Production (Vercel → Settings → Environment Variables)** — required:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` — e.g. `https://project-fineset.vercel.app`
- `ENCRYPTION_KEY` — `openssl rand -hex 32`

Recommended:

- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — rate limiting ([Upstash Console](https://console.upstash.com/))

### Production DB credential runbook

- `DATABASE_URL` must use the Supabase pooler host (`*.pooler.supabase.com:6543`) and include `pgbouncer=true&connection_limit=5` (or higher).
- `DIRECT_URL` must use direct Postgres host (`db.*.supabase.co:5432`) for migrations.
- Keep both URLs on the same Supabase project and same active database password.
- If you rotate DB password in Supabase:
  - update both `DATABASE_URL` and `DIRECT_URL` in Vercel immediately,
  - redeploy once so serverless instances use the new credentials,
  - verify no `PrismaClientInitializationError` or `ECIRCUITBREAKER` appears in Vercel runtime logs.

### 3. Set up database

```bash
npm run db:migrate
npm run db:seed
npm run auth:bootstrap
npm run auth:bootstrap-dev
```

`auth:bootstrap` creates the production admin from `MASTER_ADMIN_*` env vars.

`auth:bootstrap-dev` creates dev accounts (after seed) with password `FineSet#1dev`:

| Email | Role |
|-------|------|
| admin@fineset.local | MASTER_ADMIN |
| manager@store-alpha.local | STORE_MANAGER |
| staff-a@store-alpha.local | STAFF |

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

## Auth model

- **Supabase Auth** stores passwords and sessions only.
- **Prisma `AppUser`** stores role, store assignment, and active status.
- **Staff** table remains for visit attribution (`employeeId`, metrics).
- Admins invite users by email; users set their own password via invite link.
- Login uses a **server action** (`signInAction`) — one server round trip, cookies set before redirect.
- Dashboard session resolution is **metadata-first** (JWT `app_metadata`) with Prisma fallback.
- Target: **Sign In → dashboard shell visible in under 2s p95** (measure with `npm run auth:latency` or Playwright when `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` are set).
- Align Vercel region (`vercel.json`), Supabase project, Upstash, and DB pooler in the same region.

## Project Structure

- `app/` — Routes and API handlers
- `components/` — UI, forms, charts, layouts
- `lib/` — API clients, auth, db, validations, sync
- `lib/supabase/` — Supabase SSR clients
- `lib/auth/` — Session, invites, audit, RBAC helpers
- `content/en.ts` — All UI strings
- `prisma/` — Schema, migrations, and seed data

## Scripts

| Script | Description |
|--------|-------------|
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed demo stores, staff, visits |
| `npm run auth:bootstrap` | Create MASTER_ADMIN (Supabase + AppUser) |
| `npm run auth:bootstrap-dev` | Dev login accounts for seeded data |
| `npm run test:e2e` | Playwright smoke tests |
