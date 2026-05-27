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

- `DATABASE_URL` — Supabase Postgres connection string
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
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` — e.g. `https://project-fineset.vercel.app`
- `ENCRYPTION_KEY` — `openssl rand -hex 32`

Recommended:

- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — rate limiting ([Upstash Console](https://console.upstash.com/))

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
