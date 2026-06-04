import { describe, expect, it } from "vitest";
import { normalizeManagerEmail } from "@/lib/services/manager-stores";

describe("normalizeManagerEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeManagerEmail("  Manager@Store.EXAMPLE  ")).toBe(
      "manager@store.example",
    );
  });
});
