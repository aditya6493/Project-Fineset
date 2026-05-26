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
  test("store visits redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/store/dashboard/visits");
    await expect(page).toHaveURL(/\/store\/login/);
  });

  test("admin overview redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("staff calls redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/staff/dashboard/calls");
    await expect(page).toHaveURL(/\/staff\/login/);
  });

  test("staff visit form redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/staff/dashboard/visit");
    await expect(page).toHaveURL(/\/staff\/login/);
  });
});
