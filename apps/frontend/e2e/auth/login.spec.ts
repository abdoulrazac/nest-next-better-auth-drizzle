import { expect, test } from "@playwright/test";

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/sign-in");
  });

  test("shows login form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("shows validation errors for empty submit", async ({ page }) => {
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.getByLabel("Email").fill("notauser@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/invalid|failed|incorrect/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("has link to register page", async ({ page }) => {
    await page.getByRole("link", { name: /create one/i }).click();
    await expect(page).toHaveURL("/auth/register");
  });

  test("has link to forgot password page", async ({ page }) => {
    await page.getByRole("link", { name: /forgot password/i }).click();
    await expect(page).toHaveURL("/auth/forgot-password");
  });
});
