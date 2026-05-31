import { describe, expect, it } from "vitest";
import {
  calculateAverageDataEntryScore,
  calculateVisitDataEntryScore,
  type VisitDataEntryInput,
} from "@/lib/utils/visit-data-entry-score";

function baseVisit(
  overrides: Partial<VisitDataEntryInput> = {},
): VisitDataEntryInput {
  return {
    purchaseStatus: "PURCHASED",
    outTime: null,
    area: null,
    gender: null,
    ageGroup: null,
    productsPurchased: [],
    productsExplored: [],
    transactionAmount: null,
    intentTier: null,
    reasonNoPurchase: null,
    competitorMention: null,
    purchaseOccasion: null,
    metalKtPref: null,
    budgetStated: null,
    schemesPitched: [],
    enrollmentOutcome: null,
    monthlyCommitment: null,
    reasonNoEnrollment: null,
    schemeCompetitorMention: null,
    followUpNeeded: false,
    followUpDate: null,
    staffNotes: null,
    ...overrides,
  };
}

describe("calculateVisitDataEntryScore", () => {
  it("returns 0 when no optional fields are filled for a purchase visit", () => {
    expect(calculateVisitDataEntryScore(baseVisit())).toBe(0);
  });

  it("scores purchased visits against purchase-specific fields", () => {
    const score = calculateVisitDataEntryScore(
      baseVisit({
        productsPurchased: ["RINGS"],
        transactionAmount: 25000,
        area: "Koramangala",
        gender: "FEMALE",
      }),
    );

    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("includes no-purchase fields when purchase was not made", () => {
    const emptyScore = calculateVisitDataEntryScore(
      baseVisit({ purchaseStatus: "NOT_PURCHASED" }),
    );
    const filledScore = calculateVisitDataEntryScore(
      baseVisit({
        purchaseStatus: "NOT_PURCHASED",
        productsExplored: ["EARRINGS"],
        reasonNoPurchase: "BUDGET",
        competitorMention: "Tanishq",
      }),
    );

    expect(filledScore).toBeGreaterThan(emptyScore);
  });

  it("requires follow-up date when follow-up is needed", () => {
    const withoutDate = calculateVisitDataEntryScore(
      baseVisit({ followUpNeeded: true }),
    );
    const withDate = calculateVisitDataEntryScore(
      baseVisit({
        followUpNeeded: true,
        followUpDate: new Date("2026-05-31"),
      }),
    );

    expect(withDate).toBeGreaterThan(withoutDate);
  });

  it("includes scheme decline fields when enrollment was declined", () => {
    const score = calculateVisitDataEntryScore(
      baseVisit({
        enrollmentOutcome: "DECLINED",
        reasonNoEnrollment: "NOT_INTERESTED",
        schemeCompetitorMention: "Malabar",
      }),
    );

    expect(score).toBeGreaterThan(0);
  });
});

describe("calculateAverageDataEntryScore", () => {
  it("returns 0 for an empty visit list", () => {
    expect(calculateAverageDataEntryScore([])).toBe(0);
  });

  it("averages visit scores across a staff member's visits", () => {
    const average = calculateAverageDataEntryScore([
      baseVisit({ area: "Indiranagar" }),
      baseVisit({
        area: "Indiranagar",
        gender: "MALE",
        ageGroup: "26-35",
        productsPurchased: ["CHAINS"],
        transactionAmount: 40000,
      }),
    ]);

    expect(average).toBeGreaterThan(0);
    expect(average).toBeLessThanOrEqual(100);
  });
});
