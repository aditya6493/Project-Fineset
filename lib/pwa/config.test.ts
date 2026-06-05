import { describe, expect, it } from "vitest";
import { PWA_ASSET_VERSION, PWA_CONFIG, PWA_ICONS } from "@/lib/pwa/config";

describe("PWA_CONFIG", () => {
  it("defines standalone launch paths", () => {
    expect(PWA_CONFIG.startUrl).toBe("/");
    expect(PWA_CONFIG.scope).toBe("/");
    expect(PWA_CONFIG.themeColor).toBe("#b8972e");
    expect(PWA_CONFIG.backgroundColor).toBe("#faf7f2");
  });
});

describe("PWA_ICONS", () => {
  it("cache-busts every icon URL with PWA_ASSET_VERSION", () => {
    for (const icon of PWA_ICONS) {
      expect(icon.src).toContain(`v=${PWA_ASSET_VERSION}`);
    }
  });

  it("includes installability sizes 192 and 512", () => {
    const sizes = PWA_ICONS.map((icon) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });
});
