import { describe, expect, it } from "vitest";
import {
  calculateDurationMins,
  formatCurrency,
  formatDate,
  formatDurationMins,
  formatGrowthLabel,
  formatPercent,
  maskPhone,
} from "@/lib/utils/formatters";
import { boolLabel, formatProducts, labelFor } from "@/lib/utils/visit-display";

describe("maskPhone", () => {
  it("masks a 10-digit phone number", () => {
    expect(maskPhone("9876543210")).toBe("98****3210");
  });

  it("returns placeholder for short numbers", () => {
    expect(maskPhone("123")).toBe("****");
  });

  it("strips non-digit characters before masking", () => {
    expect(maskPhone("98765-43210")).toBe("98****3210");
  });
});

describe("formatCurrency", () => {
  it("formats INR without decimals", () => {
    expect(formatCurrency(50000)).toBe("₹50,000");
  });
});

describe("formatDate", () => {
  it("formats dates in en-IN locale", () => {
    expect(formatDate("2024-06-15")).toMatch(/15/);
    expect(formatDate("2024-06-15")).toMatch(/2024/);
  });
});

describe("calculateDurationMins", () => {
  it("computes minutes between two times on the same day", () => {
    const inTime = new Date("2024-01-01T10:00:00");
    const outTime = new Date("2024-01-01T10:45:00");
    expect(calculateDurationMins(inTime, outTime)).toBe(45);
  });

  it("rolls to the next day when out time is before in time", () => {
    const inTime = new Date("2024-01-01T22:00:00");
    const outTime = new Date("2024-01-01T01:00:00");
    expect(calculateDurationMins(inTime, outTime)).toBe(180);
  });
});

describe("formatDurationMins", () => {
  it("formats sub-hour durations", () => {
    expect(formatDurationMins(30)).toBe("30 min");
  });

  it("formats hour durations", () => {
    expect(formatDurationMins(90)).toBe("1h 30m");
  });

  it("formats exact hours", () => {
    expect(formatDurationMins(120)).toBe("2h");
  });
});

describe("formatPercent", () => {
  it("includes one decimal by default", () => {
    expect(formatPercent(12.345)).toBe("12.3%");
  });
});

describe("formatGrowthLabel", () => {
  it("prefixes positive values with plus", () => {
    expect(formatGrowthLabel(5)).toBe("+5%");
  });

  it("keeps negative sign for negative values", () => {
    expect(formatGrowthLabel(-3)).toBe("-3%");
  });
});

describe("visit display helpers", () => {
  it("labelFor returns em dash for empty values", () => {
    expect(labelFor({ A: "Alpha" }, null)).toBe("—");
  });

  it("labelFor maps option keys to labels", () => {
    expect(labelFor({ HOT: "Hot lead" }, "HOT")).toBe("Hot lead");
  });

  it("formatProducts joins mapped labels", () => {
    expect(formatProducts(["RINGS", "CHAINS"], { RINGS: "Rings", CHAINS: "Chains" })).toBe(
      "Rings, Chains",
    );
  });

  it("boolLabel returns yes/no labels", () => {
    expect(boolLabel(true, "Yes", "No")).toBe("Yes");
    expect(boolLabel(false, "Yes", "No")).toBe("No");
  });
});
