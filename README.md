# FineSet — Jewelry Store SaaS

Multi-tenant SaaS platform for jewelry store chains with Staff, Store, and Master Admin portals.

## Tech Stack

- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui design system
- Prisma + PostgreSQL
- NextAuth.js v5 (three credential providers)
- Google Gemini API (server-side analytics)
- React Query + Zustand

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `DATABASE_URL`, `NEXTAUTH_SECRET`, and optionally `ADMIN_PASSWORD_HASH`.

Generate admin password hash (store as base64 in `.env.local`):

```bash
node -e "const b=require('bcryptjs'); b.hash('your-password', 12).then(h=>console.log(Buffer.from(h).toString('base64')))"
```

### 3. Set up database

Start PostgreSQL (Docker):

```bash
docker compose up -d
```

Then apply schema and seed data:

```bash
npm run db:push
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seed Credentials

| Portal | Username | Password |
|--------|----------|----------|
| Staff | Staff Member A | EMP001 |
| Store | Store Alpha | 500001 |
| Admin | Set via `ADMIN_EMAIL` | Set via env hash |

## Project Structure

See the master prompt for full architecture. Key directories:

- `app/` — Routes and API handlers
- `components/` — UI, forms, charts, layouts
- `lib/` — API clients, auth, db, validations
- `content/en.ts` — All UI strings
- `prisma/` — Schema and seed data

## Build Phases

- [x] Phase 1 — Foundation
- [x] Phase 2 — API Layer
- [x] Phase 3 — Staff Portal
- [x] Phase 4 — Store Portal
- [x] Phase 5 — Admin Portal
- [x] Phase 6 — AI Integration
- [x] Phase 7 — Polish & Hardening
