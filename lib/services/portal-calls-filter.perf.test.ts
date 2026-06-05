import { describe, expect, it } from "vitest";
import { matchesCallSegment } from "@/lib/services/call-list-utils";
import type { CustomerType, PurchaseStatus } from "@prisma/client";
import { PERF_BUDGETS } from "@/tests/helpers/perf-budgets";

function syntheticVisit(index: number) {
  return {
    customerType: (index % 2 === 0 ? "NEW" : "REPEAT") as CustomerType,
    purchaseStatus: (index % 3 === 0 ? "PURCHASED" : "NOT_PURCHASED") as PurchaseStatus,
  };
}

describe("portal call filter CPU", () => {
  it("filters 10k synthetic rows under budget", () => {
    const rows = Array.from({ length: 10_000 }, (_, index) => syntheticVisit(index));
    const started = performance.now();

    let matched = 0;
    for (const row of rows) {
      if (matchesCallSegment(row, "PURCHASED")) matched += 1;
    }

    const elapsed = performance.now() - started;
    expect(matched).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(PERF_BUDGETS.cpu.portalCallFilter10k);
  });
});
