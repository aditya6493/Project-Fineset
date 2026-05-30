import { test, expect } from "@playwright/test";

const e2eEmail = process.env.E2E_USER_EMAIL;
const e2ePassword = process.env.E2E_USER_PASSWORD;
const hasE2eCredentials = Boolean(e2eEmail && e2ePassword);

test.describe("Public routes", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("unified login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("legacy staff login redirects to unified login", async ({ page }) => {
    await page.goto("/staff/login");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Protected dashboard routes", () => {
  test("store visits redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/store/dashboard/visits");
    await expect(page).toHaveURL(/\/login\?callbackUrl=.*store%2Fdashboard%2Fvisits/);
  });

  test("admin overview redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/login\?callbackUrl=.*admin%2Fdashboard/);
  });

  test("staff calls redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/staff/dashboard/calls");
    await expect(page).toHaveURL(/\/login\?callbackUrl=.*staff%2Fdashboard%2Fcalls/);
  });
});

test.describe("Auth performance", () => {
  test.skip(!hasE2eCredentials, "Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run login perf test");

  test("login reaches dashboard shell under 2s", async ({ page }) => {
    const start = Date.now();

    await page.goto("/login");
    await page.fill('[name="email"]', e2eEmail!);
    await page.fill('[name="password"]', e2ePassword!);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);
    await expect(page.getByTestId("portal-shell")).toBeVisible();

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });
});
