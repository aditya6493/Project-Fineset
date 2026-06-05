// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { isStandaloneDisplay } from "@/lib/pwa/standalone";

describe("isStandaloneDisplay", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true for display-mode standalone", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query.includes("display-mode: standalone"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(isStandaloneDisplay()).toBe(true);
  });

  it("returns true for iOS navigator.standalone", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      () =>
        ({
          matches: false,
          media: "",
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList,
    );

    Object.defineProperty(window.navigator, "standalone", {
      configurable: true,
      value: true,
    });

    expect(isStandaloneDisplay()).toBe(true);
  });

  it("returns false in a normal browser tab", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      () =>
        ({
          matches: false,
          media: "",
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList,
    );

    Object.defineProperty(window.navigator, "standalone", {
      configurable: true,
      value: false,
    });

    expect(isStandaloneDisplay()).toBe(false);
  });
});
