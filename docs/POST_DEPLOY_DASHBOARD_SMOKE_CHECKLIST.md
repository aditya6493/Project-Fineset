## Post-deploy dashboard smoke checklist

Run this checklist after every production deploy.

### 0) DB auth sanity check (before dashboard QA)

1. In Vercel Environment Variables, verify:
   - `DATABASE_URL` uses Supabase pooler host with port `6543`.
   - `DATABASE_URL` contains `pgbouncer=true&connection_limit=5` (or higher).
   - `DIRECT_URL` uses direct Supabase host with port `5432`.
2. Ensure both URLs use the current active DB password from the same Supabase project.
3. If password was rotated in Supabase, update both URLs in Vercel and redeploy.
4. In Vercel Runtime logs, confirm there is no:
   - `PrismaClientInitializationError: Authentication failed against database server`
   - `FATAL: (ECIRCUITBREAKER) too many authentication failures`

1. Open `/admin/dashboard` and switch `Today`, `This Week`, `This Month`.
2. Open `/admin/dashboard/stores` and one `/admin/dashboard/stores/[storeId]` page.
3. Open `/business-owner/dashboard` and switch `Today`, `This Week`, `This Month`.
4. Open store sub-pages:
   - `/business-owner/dashboard/visits`
   - `/business-owner/dashboard/calls`
   - `/business-owner/dashboard/field-sales`
   - `/business-owner/dashboard/staff`
   - `/store-manager/dashboard` (store manager portal)
5. Confirm browser network has no repeated 500 bursts for:
   - `/api/analytics/admin`
   - `/api/analytics/store`
   - `/api/calls`
   - `/api/field-sales`
   - `/api/staff`
   - `/api/visits`
   - `/api/sync/state`
   - `/api/sync/events`
6. On one store tab (e.g. Call Users), total API calls on first load should be roughly:
   - 1x `/api/calls`
   - 1x `/api/staff` (shared cache across tabs)
   - 1x `/api/sync/state` + 1x `/api/sync/events`
   - not dozens of duplicate `/api/staff` or `/api/calls` retries
7. Confirm no route boundary UI (`Something went wrong`) appears during normal navigation.
8. In Vercel logs, confirm there are no repeated `[api.analytics.*]` or `[api.sync.*]` failures for the tested session window.
