import { describe, expect, it } from "vitest";
import {
  buildCustomerSearchFields,
  buildVisitSearchWhere,
  extractPhoneLast4,
  normalizeCustomerNameSearch,
} from "@/lib/services/customer-search";

describe("customer-search", () => {
  it("normalizes customer names", () => {
    expect(normalizeCustomerNameSearch("  Jane   Doe ")).toBe("jane doe");
  });

  it("extracts phone last four", () => {
    expect(extractPhoneLast4("+91 98765 43210")).toBe("3210");
    expect(extractPhoneLast4("123")).toBeNull();
  });

  it("builds search fields", () => {
    expect(buildCustomerSearchFields("Ravi Kumar", "9876543210")).toEqual({
      customerNameSearch: "ravi kumar",
      phoneLast4: "3210",
    });
  });

  it("builds visit search with name and phone branches", () => {
    const byName = buildVisitSearchWhere("ravi");
    expect(byName?.OR).toEqual(
      expect.arrayContaining([
        { customerNameSearch: { contains: "ravi", mode: "insensitive" } },
        { staff: { name: { contains: "ravi", mode: "insensitive" } } },
      ]),
    );

    const byPhone = buildVisitSearchWhere("9876543210");
    expect(byPhone?.OR?.length).toBeGreaterThanOrEqual(2);
  });
});
