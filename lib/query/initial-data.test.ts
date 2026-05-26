import { describe, expect, it } from "vitest";
import {
  analyticsParamsMatch,
  defaultFieldSalesParams,
  defaultPortalCallsParams,
  defaultStaffCallsParams,
  fieldSalesParamsMatch,
  portalCallsParamsMatch,
  staffCallsParamsMatch,
  storesParamsMatch,
  visitsParamsMatch,
} from "@/lib/query/initial-data";

describe("visitsParamsMatch", () => {
  it("matches default visit params", () => {
    expect(
      visitsParamsMatch(
        { page: "1", pageSize: "20", sortBy: "visitDate", sortOrder: "desc" },
        { page: "1", pageSize: "20", sortBy: "visitDate", sortOrder: "desc" },
      ),
    ).toBe(true);
  });

  it("returns false when search differs", () => {
    expect(
      visitsParamsMatch({ page: "1", search: "a" }, { page: "1", search: "b" }),
    ).toBe(false);
  });
});

describe("portalCallsParamsMatch", () => {
  it("matches default portal call filters", () => {
    const defaults = defaultPortalCallsParams();
    expect(portalCallsParamsMatch(defaults, defaults)).toBe(true);
  });
});

describe("fieldSalesParamsMatch", () => {
  it("matches default field sales filters", () => {
    const defaults = defaultFieldSalesParams("store-1");
    expect(fieldSalesParamsMatch(defaults, defaults)).toBe(true);
  });
});

describe("staffCallsParamsMatch", () => {
  it("matches default staff call filters", () => {
    const defaults = defaultStaffCallsParams();
    expect(staffCallsParamsMatch(defaults, defaults)).toBe(true);
  });
});

describe("analyticsParamsMatch", () => {
  it("defaults period to week", () => {
    expect(analyticsParamsMatch({}, {})).toBe(true);
    expect(analyticsParamsMatch({ period: "month" }, { period: "week" })).toBe(false);
  });
});

describe("storesParamsMatch", () => {
  it("matches pagination and search", () => {
    expect(storesParamsMatch({ page: 1, pageSize: 50 }, { page: 1, pageSize: 50 })).toBe(
      true,
    );
    expect(storesParamsMatch({ page: 2, pageSize: 50 }, { page: 1, pageSize: 50 })).toBe(
      false,
    );
  });
});
