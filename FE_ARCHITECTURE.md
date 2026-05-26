# Frontend Architecture

FineSet uses Next.js App Router with a **hybrid RSC + client island** pattern for multi-portal dashboards (staff, store, admin).

## Layering

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Pages | `app/**/page.tsx` | RSC route shells; auth is enforced by middleware |
| Server data | `lib/data/*` | Session-aware `fetchInitial*` wrappers |
| Business logic | `lib/services/*` | Prisma queries; shared by API routes and RSC |
| Client API | `lib/api/*` | Browser `fetch()` to `/api/*` for mutations and refetch |
| Hooks | `hooks/*` | TanStack Query; accept `initialData` when SSR params match |
| Param matching | `lib/query/initial-data.ts` | Decides when SSR cache applies |
| Live sync | `lib/sync/*` | SSE via `/api/sync/events` + targeted React Query invalidation |

## RSC vs client boundaries

**Keep as Server Components (default):**

- Route pages that only compose children and fetch data
- Presentational components with no hooks or event handlers (`KPICard`, `EmptyState`, `StaffPortal`)

**Must be client (`"use client"`):**

- Forms, dialogs, charts (Recharts), tables with local sort/filter state
- `PortalShell` (nav, sign-out, `useRealtimeSync`)
- `Providers` (`SessionProvider`, `QueryClientProvider`)

## Hybrid fetch pattern

1. **Server page** calls `lib/data/*` → `lib/services/*` directly (no HTTP hop).
2. Page passes `initialData` + `initialParams` to a client component.
3. Client hook uses `initialData` only when current params match `initialParams` (see `lib/query/initial-data.ts`).
4. `useRealtimeSync` (SSE) invalidates targeted query namespaces when another portal changes data.

### Adding a new list page

1. Add or reuse a service function in `lib/services/*`.
2. Add `fetchInitial*` in `lib/data/*` with session role checks.
3. Add param matcher in `lib/query/initial-data.ts`.
4. Extend the hook with optional `{ initialData, initialParams }`.
5. Make the page `async` and pass SSR props to the client log component.

## UI conventions

- Primitives live in `components/ui/*` (shadcn-style, project tokens).
- Copy strings live in `content/en` — no hardcoded user-facing text in components.
- Loading: prefer `Skeleton` + `DashboardLoading` over raw `animate-pulse` divs.
- Errors: segment `error.tsx` + shared `RouteError` + `QueryLoadState` for data views

## Testing

- Unit tests: `lib/**` (Vitest, node environment)
- Component tests: `components/shared/**` (jsdom + Testing Library)
- E2E: Playwright golden paths per portal

Run `npm test`, `npm run lint`, `npm run build` before opening a PR.
