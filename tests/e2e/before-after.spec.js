import { test, expect } from "@playwright/test";

test("Before / After slider works on frontend", async ({ page }) => {
  const errors = [];

  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  // Podmień na adres strony zawierającej blok
  await page.goto("http://nauka.local/fse/");

  const block = page.locator(".wp-block-fse-theme-before-after").first();

  await expect(block).toBeVisible();

  const range = block.locator(".fse-before-after__range");
  const before = block.locator(".fse-before-after__before");
  const divider = block.locator(".fse-before-after__divider");

  await expect(range).toBeAttached();
  await expect(before).toBeVisible();
  await expect(divider).toBeVisible();

  // Pozycja 25%
  await range.fill("25");

  await expect(before).toHaveCSS("clip-path", "inset(0px 75% 0px 0px)");

  await expect
    .poll(() => divider.evaluate((element) => element.style.left))
    .toBe("25%");

  // Pozycja 75%
  await range.fill("75");

  await expect(before).toHaveCSS("clip-path", "inset(0px 25% 0px 0px)");

  await expect
    .poll(() => divider.evaluate((element) => element.style.left))
    .toBe("75%");

  // Kontrola błędów JavaScript
  expect(errors).toEqual([]);
});
