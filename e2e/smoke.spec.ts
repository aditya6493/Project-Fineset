import { test, expect } from "@playwright/test";

test.describe("Public routes", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("staff login page loads", async ({ page }) => {
    await page.goto("/staff/login");
    await expect(page.getByRole("button")).toBeVisible();
  });

  test("store login page loads", async ({ page }) => {
    await page.goto("/store/login");
    await expect(page.getByRole("button")).toBeVisible();
  });

  test("admin login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("button")).toBeVisible();
  });
});

test.describe("Protected dashboard routes", () => {
  test("store visits redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/store/dashboard/visits");
    await expect(page).toHaveURL(/\/?callbackUrl=.*store%2Fdashboard%2Fvisits/);
  });

  test("admin overview redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/?callbackUrl=.*admin%2Fdashboard/);
  });

  test("staff calls redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/staff/dashboard/calls");
    await expect(page).toHaveURL(/\/?callbackUrl=.*staff%2Fdashboard%2Fcalls/);
  });

  test("staff visit form redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/staff/dashboard/visits");
    await expect(page).toHaveURL(/\/?callbackUrl=.*staff%2Fdashboard%2Fvisits/);
  });
});
