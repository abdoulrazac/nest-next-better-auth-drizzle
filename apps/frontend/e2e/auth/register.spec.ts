import { test, expect } from "@playwright/test";

test.describe("Register page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/register");
  });

  test("shows register form", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Create account" }),
    ).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByLabel("Confirm password")).toBeVisible();
  });

  test("shows validation error for password mismatch", async ({ page }) => {
    await page.getByLabel("Name").fill("Test User");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("Password1!");
    await page.getByLabel("Confirm password").fill("Different1!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText(/passwords? do not match/i)).toBeVisible();
  });

  test("has link to login page", async ({ page }) => {
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/auth/login");
  });
});
