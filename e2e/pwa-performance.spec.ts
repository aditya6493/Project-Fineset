import { test, expect } from "@playwright/test";
import baselines from "../tests/perf/baselines.json";
import {
  assertNonBlankBody,
  emulateStandalone,
  getServiceWorkerRegistrationCount,
  waitForServiceWorker,
  waitForServiceWorkerControl,
} from "./helpers/pwa";

function pwaBaselineMs(key: keyof typeof baselines.pwa): number | undefined {
  const value = baselines.pwa[key];
  return typeof value === "number" ? value : undefined;
}

function limitMs(key: keyof typeof baselines.pwa, budgetMs: number): number {
  const baseline = pwaBaselineMs(key);
  return baseline !== undefined ? Math.ceil(baseline * 1.2) : budgetMs;
}

test.describe("PWA performance", () => {
  test("C1 cold load shows login under 3s", async ({ page }) => {
    const started = Date.now();
    await page.goto("/");
    await page.getByRole("button", { name: /sign in/i }).waitFor({ state: "visible" });
    expect(Date.now() - started).toBeLessThan(limitMs("coldLoadLogin", 3000));
  });

  test("C2 standalone cold load is non-blank quickly", async ({ page }) => {
    await emulateStandalone(page);
    const started = Date.now();
    await page.goto("/");
    await assertNonBlankBody(page);
    expect(Date.now() - started).toBeLessThan(limitMs("standaloneNonBlank", 3000));

    const shellStarted = Date.now();
    await page
      .getByRole("button", { name: /sign in/i })
      .or(page.getByTestId("portal-shell"))
      .waitFor({ state: "visible" });
    expect(Date.now() - shellStarted).toBeLessThan(limitMs("standaloneShell", 5000));
  });

  test("C3 service worker ready within 8s", async ({ page }) => {
    const started = Date.now();
    await page.goto("/");
    await waitForServiceWorker(
      page,
      Math.max(limitMs("swReady", 8000), process.env.CI ? 25_000 : 8_000),
    );
    expect(Date.now() - started).toBeLessThan(limitMs("swReady", 8000));
  });

  test("C4 warm repeat launch under 2s", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /sign in/i }).waitFor({ state: "visible" });

    const started = Date.now();
    await page.goto("/");
    await page.getByRole("button", { name: /sign in/i }).waitFor({ state: "visible" });
    expect(Date.now() - started).toBeLessThan(limitMs("warmLaunch", 2000));
  });

  test("C5 offline page content within 2s", async ({ page, context }) => {
    await page.goto("/~offline");
    await page.getByText(/offline/i).waitFor({ state: "visible" });
    await waitForServiceWorkerControl(page, process.env.CI ? 25_000 : 15_000);

    await context.setOffline(true);
    const started = Date.now();
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByText(/offline/i).waitFor({ state: "visible" });
    expect(Date.now() - started).toBeLessThan(limitMs("offlinePage", 2000));
  });

  test("C6 manifest fetch under 500ms", async ({ request }) => {
    const started = Date.now();
    const res = await request.get("/manifest.webmanifest");
    expect(res.ok()).toBeTruthy();
    expect(Date.now() - started).toBeLessThan(limitMs("manifestFetch", 500));
  });

  test("C7 sw.js fetch under 1s", async ({ request }) => {
    const started = Date.now();
    const res = await request.get("/serwist/sw.js");
    expect(res.ok()).toBeTruthy();
    expect(Date.now() - started).toBeLessThan(limitMs("swFetch", 1000));
  });

  test("C8 no duplicate service worker registrations", async ({ page }) => {
    await page.goto("/");
    await waitForServiceWorker(page, 15_000);
    await page.goto("/business-owner/dashboard/visits").catch(() => undefined);
    await page.goto("/");
    await page.goto("/login").catch(() => undefined);

    const count = await getServiceWorkerRegistrationCount(page);
    expect(count).toBe(1);
  });
});
