import { describe, expect, it } from "vitest";
import { hashPhone } from "@/lib/crypto/pii";
import {
  maskCustomerDisplayName,
  maskCustomerPhone,
} from "@/lib/utils/pii-display";
import { resolveSchemeEnrollmentFlags } from "@/lib/services/scheme-enrollment";

describe("PII display utilities", () => {
  it("masks customer display names", () => {
    expect(maskCustomerDisplayName("Anita Reddy")).toBe("Anita R.");
    expect(maskCustomerDisplayName("Karan")).toMatch(/^Ka\*\*\*$/);
  });

  it("masks phone numbers", () => {
    expect(maskCustomerPhone("9810001001")).toBe("***-***-1001");
  });
});

describe("phone hashing", () => {
  it("normalizes and hashes consistently", () => {
    expect(hashPhone("981-000-1001")).toBe(hashPhone("9810001001"));
  });
});

describe("scheme enrollment flags", () => {
  it("resolves GHS enrollment", () => {
    expect(resolveSchemeEnrollmentFlags("ENROLLED_GHS")).toEqual({
      schemeEnrolled: true,
      ghsPolicy: true,
      activeScheme: "GHS",
    });
  });
});
