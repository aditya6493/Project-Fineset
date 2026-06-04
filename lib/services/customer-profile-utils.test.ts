import { describe, expect, it } from "vitest";
import {
  customerTypesDiffer,
  deriveProfileCustomerType,
} from "@/lib/services/customer-profile-utils";

describe("deriveProfileCustomerType", () => {
  it("returns NEW for a single visit on record", () => {
    expect(deriveProfileCustomerType([{ customerType: "REPEAT" }])).toBe("NEW");
  });

  it("returns REPEAT for two or more visits", () => {
    expect(
      deriveProfileCustomerType([
        { customerType: "NEW" },
        { customerType: "NEW" },
      ]),
    ).toBe("REPEAT");
  });

  it("returns VIP when any visit is VIP", () => {
    expect(
      deriveProfileCustomerType([
        { customerType: "REPEAT" },
        { customerType: "VIP" },
      ]),
    ).toBe("VIP");
  });
});

describe("customerTypesDiffer", () => {
  it("detects mismatch between profile and latest visit tag", () => {
    expect(customerTypesDiffer("NEW", "REPEAT")).toBe(true);
    expect(customerTypesDiffer("REPEAT", "REPEAT")).toBe(false);
  });
});
