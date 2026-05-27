import { test, expect } from "@playwright/test";

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
