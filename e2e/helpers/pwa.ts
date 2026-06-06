import { expect, type Page } from "@playwright/test";

/** Wait until the active worker controls the page (needed for offline precache/fallback). */
export async function waitForServiceWorkerControl(
  page: Page,
  timeoutMs = 15_000,
): Promise<void> {
  await waitForServiceWorker(page, timeoutMs);

  const hasController = await page.evaluate(
    () => Boolean(navigator.serviceWorker.controller),
  );
  if (!hasController) {
    await page.reload({ waitUntil: "domcontentloaded" });
  }

  await page.waitForFunction(
    () => Boolean(navigator.serviceWorker.controller),
    { timeout: timeoutMs },
  );
}

export async function waitForServiceWorker(page: Page, timeoutMs = 10_000): Promise<void> {
  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return;
    const existing = await navigator.serviceWorker.getRegistration();
    if (!existing) {
      try {
        await navigator.serviceWorker.register("/serwist/sw.js", { scope: "/" });
      } catch {
        // SerwistProvider may register concurrently in the page.
      }
    }
  });

  await page.waitForFunction(
    async () => {
      if (!("serviceWorker" in navigator)) return false;
      if (navigator.serviceWorker.controller) return true;
      const registration = await navigator.serviceWorker.getRegistration();
      return Boolean(registration?.active);
    },
    { timeout: timeoutMs },
  );
}

export async function emulateStandalone(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const originalMatchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query: string) => {
      if (query.includes("display-mode: standalone")) {
        return {
          ...originalMatchMedia(query),
          matches: true,
        } as MediaQueryList;
      }
      return originalMatchMedia(query);
    };
    Object.defineProperty(window.navigator, "standalone", {
      configurable: true,
      value: true,
    });
  });
}

export async function assertNonBlankBody(page: Page): Promise<void> {
  const text = await page.locator("body").innerText();
  expect(text.trim().length).toBeGreaterThan(0);

  const html = await page.locator("body").innerHTML();
  expect(html.trim().length).toBeGreaterThan(50);
}

export async function getServiceWorkerRegistrationCount(page: Page): Promise<number> {
  return page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return 0;
    const registrations = await navigator.serviceWorker.getRegistrations();
    return registrations.length;
  });
}
