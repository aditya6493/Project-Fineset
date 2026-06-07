import { describe, expect, it } from "vitest";
import { createFieldSaleSchema } from "@/lib/validations/field-sale.schema";

const baseFieldSale = {
  customerName: "Jane Doe",
  customerPhone: "9876543210",
  customerType: "NEW" as const,
  activityType: "DOOR_TO_DOOR" as const,
  followUpNeeded: false,
};

describe("createFieldSaleSchema", () => {
  it("accepts a field sale without scheme pitch data", () => {
    const result = createFieldSaleSchema.safeParse({
      ...baseFieldSale,
      schemesPitched: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a field sale with explicit none selection", () => {
    const result = createFieldSaleSchema.safeParse({
      ...baseFieldSale,
      schemesPitched: ["NONE"],
    });
    expect(result.success).toBe(true);
  });

  it("still requires outcome when schemes are pitched", () => {
    const result = createFieldSaleSchema.safeParse({
      ...baseFieldSale,
      schemesPitched: ["GHS"],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a complete scheme pitch", () => {
    const result = createFieldSaleSchema.safeParse({
      ...baseFieldSale,
      schemesPitched: ["GHS"],
      enrollmentOutcome: "ENROLLED_GHS",
      monthlyCommitment: 5000,
    });
    expect(result.success).toBe(true);
  });
});
