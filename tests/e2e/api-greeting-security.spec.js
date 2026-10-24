import { test, expect } from "@playwright/test";

test("API Greeting escapes unsafe HTML", async ({ page }) => {
  await page.goto("http://nauka.local/o-mnie");

  const block = page.locator(".wp-block-fse-theme-api-greeting").first();

  await expect(block).toBeVisible();

  const images = block.locator("img");
  await expect(images).toHaveCount(0);

  const greeting = block.locator("p");
  await expect(greeting).toContainText("Cześć,");
});
