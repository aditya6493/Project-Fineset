# FineSet — Jewelry Store SaaS

Multi-tenant SaaS platform for jewelry store chains with Staff, Store, and Master Admin portals.

## Tech Stack

- Next.js 16 (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui design system
- Prisma + PostgreSQL (versioned migrations)
- NextAuth.js v5 (three credential providers)
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

Required for local development:

- `DATABASE_URL`
- `AUTH_SECRET` or `NEXTAUTH_SECRET`
- `ENCRYPTION_KEY` — generate with `openssl rand -hex 32`

Required for production:

- All of the above, plus `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (rate limiting)
- `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` for admin login

Generate admin password hash (store as base64 in `.env.local`):

```bash
node -e "const b=require('bcryptjs'); b.hash('your-password', 12).then(h=>console.log(Buffer.from(h).toString('base64')))"
```

### 3. Set up database

Start PostgreSQL (Docker):

```bash
docker compose up -d
```

Apply migrations and seed data:

```bash
npm run db:migrate
npm run db:seed
```

For local prototyping only (no migration history):

```bash
npm run db:push
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

- `app/` — Routes and API handlers
- `components/` — UI, forms, charts, layouts
- `lib/` — API clients, auth, db, validations, sync
- `content/en.ts` — All UI strings
- `prisma/` — Schema, migrations, and seed data

## Scripts

| Script | Description |
|--------|-------------|
| `npm run db:migrate` | Apply migrations (production/CI) |
| `npm run db:migrate:dev` | Create and apply migrations (development) |
| `npm run test:integration` | Run integration tests (requires Postgres) |
| `npm run test:e2e` | Playwright smoke and auth flows |
