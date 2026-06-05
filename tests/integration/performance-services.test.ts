import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { disconnectPerfSeed, seedPerfFixtures } from "@/tests/fixtures/perf-seed";
import { listVisits } from "@/lib/services/visits";
import { listStaff } from "@/lib/services/staff";
import { buildPortalVisitsWhere, listPortalCalls } from "@/lib/services/portal-calls";
import { getManagerStorePerformanceRows, getStorePerformanceRows } from "@/lib/services/stores";
import { getStoreOverviewBundle } from "@/lib/services/store-overview-bundle";
import { listFieldSales } from "@/lib/services/field-sales";
import { assertWithinBudget, PERF_BUDGETS } from "@/tests/helpers/perf-budgets";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("performance services", () => {
  let fixtures: Awaited<ReturnType<typeof seedPerfFixtures>>;

  beforeAll(async () => {
    fixtures = await seedPerfFixtures();
  }, 60_000);

  afterAll(async () => {
    await disconnectPerfSeed();
  });

  it("B1.1 scopes manager portfolio queries to allowed stores", async () => {
    const rows = await getManagerStorePerformanceRows(
      fixtures.managerEmail,
      fixtures.storeId,
      "week",
    );

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.storeId === fixtures.storeId)).toBe(true);
  });

  it("B1.2 listVisits respects page size", async () => {
    const pageSize = 10;
    const { data, total } = await listVisits({
      storeId: fixtures.storeId,
      page: 1,
      pageSize,
      sortBy: "visitDate",
      sortOrder: "desc",
    });

    expect(data.length).toBeLessThanOrEqual(pageSize);
    expect(total).toBeGreaterThan(pageSize);
  });

  it("B1.3 portal calls where clause is bounded to requested month", () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const where = buildPortalVisitsWhere({
      year,
      month,
      page: 1,
      pageSize: 15,
      segment: "ALL",
      valueTier: "ALL",
      queue: "ALL",
      storeId: fixtures.storeId,
    });

    expect(where.visitDate).toBeDefined();
    const range = where.visitDate as { gte: Date; lte: Date };
    expect(range.gte.getMonth()).toBe(month - 1);
    expect(range.lte.getMonth()).toBe(month - 1);
    expect(where.storeId).toBe(fixtures.storeId);
  });

  it("B1.4 listStaff does not include nested visits relation", async () => {
    const staff = await listStaff(fixtures.storeId);

    expect(staff.length).toBeGreaterThan(0);
    for (const member of staff) {
      expect(member).not.toHaveProperty("visits");
    }
  });

  it("B1.6 store overview bundle completes within budget", async () => {
    const started = Date.now();
    await getStoreOverviewBundle(
      fixtures.managerEmail,
      fixtures.storeId,
      fixtures.storeId,
      "week",
    );
    assertWithinBudget(Date.now() - started, PERF_BUDGETS.api.storeOverview);
  });

  it("B1.7 getStorePerformanceRows returns only requested stores when scoped", async () => {
    const rows = await getStorePerformanceRows("week", [fixtures.storeId]);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.storeId).toBe(fixtures.storeId);
  });

  it("B1.8 listPortalCalls listFieldSales scoped queries run without error", async () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const calls = await listPortalCalls({
      year,
      month,
      page: 1,
      pageSize: 15,
      segment: "ALL",
      valueTier: "ALL",
      queue: "ALL",
      storeId: fixtures.storeId,
    });
    expect(calls.total).toBeGreaterThan(0);

    const fieldSales = await listFieldSales({
      storeId: fixtures.storeId,
      page: 1,
      pageSize: 15,
      year,
      month,
    });
    expect(fieldSales.data.length).toBeGreaterThan(0);
  });
});
