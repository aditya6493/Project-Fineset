import { describe, expect, it } from "vitest";
import {
  maskCustomerDisplayName,
  maskCustomerPhone,
} from "@/lib/utils/pii-display";

describe("pii-display", () => {
  it("masks names and phones for portal lists", () => {
    expect(maskCustomerDisplayName("Priya Sharma")).toBe("Priya S.");
    expect(maskCustomerPhone("9876543210")).toBe("***-***-3210");
  });
});
