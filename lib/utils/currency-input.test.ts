import { describe, expect, it } from "vitest";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/utils/currency-input";

describe("currency-input", () => {
  it("parses digits from formatted input", () => {
    expect(parseCurrencyInput("50,000")).toBe(50000);
    expect(parseCurrencyInput("₹1,25,000")).toBe(125000);
    expect(parseCurrencyInput("")).toBeUndefined();
  });

  it("formats amounts with Indian grouping", () => {
    expect(formatCurrencyInput(500)).toBe("500");
    expect(formatCurrencyInput(5000)).toBe("5,000");
    expect(formatCurrencyInput(50000)).toBe("50,000");
    expect(formatCurrencyInput(125000)).toBe("1,25,000");
    expect(formatCurrencyInput(10000000)).toBe("1,00,00,000");
  });
});
