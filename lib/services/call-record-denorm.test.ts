import { describe, expect, it } from "vitest";
import {
  computeAnniversaryMonth,
  computeBirthMonth,
  computeCallValueTierFromFieldSale,
  computeCallValueTierFromVisit,
  fieldSaleDenormFields,
  visitDenormFields,
} from "@/lib/services/call-record-denorm";

describe("call-record-denorm", () => {
  it("computes visit value tier from transaction amount", () => {
    expect(
      computeCallValueTierFromVisit({
        transactionAmount: 60_000,
        budgetStated: null,
        purchaseStatus: "PURCHASED",
      }),
    ).toBe("HIGH");
  });

  it("computes field sale value tier from monthly commitment", () => {
    expect(computeCallValueTierFromFieldSale(20_000)).toBe("MID");
  });

  it("computes UTC calendar months", () => {
    expect(computeBirthMonth(new Date("2024-06-15T12:00:00.000Z"))).toBe(6);
    expect(computeAnniversaryMonth(new Date("2024-12-01T00:00:00.000Z"))).toBe(12);
  });

  it("bundles visit denorm fields", () => {
    expect(
      visitDenormFields({
        transactionAmount: null,
        budgetStated: "ABOVE_1L",
        purchaseStatus: "NOT_PURCHASED",
        dateOfBirth: new Date("2024-03-10T00:00:00.000Z"),
        anniversary: null,
      }),
    ).toEqual({
      callValueTier: "HIGH",
      birthMonth: 3,
      anniversaryMonth: null,
    });
  });

  it("bundles field sale denorm fields", () => {
    expect(
      fieldSaleDenormFields({
        monthlyCommitment: 5_000,
        dateOfBirth: null,
        anniversary: new Date("2024-08-20T00:00:00.000Z"),
      }),
    ).toEqual({
      callValueTier: "LOW",
      birthMonth: null,
      anniversaryMonth: 8,
    });
  });
});
