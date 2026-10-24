import { test, expect } from "@playwright/test";

const payload = '<img src=x onerror="window.xssExecuted=true">';

// Podaj tutaj pełny adres opublikowanej strony testowej.
const testUrl = "http://nauka.local/o-mnie/";

test("API Greeting prevents stored XSS", async ({ page }) => {
  const dialogs = [];

  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });

  await page.addInitScript(() => {
    window.xssExecuted = false;
  });

  await page.goto(testUrl);

  const block = page.locator(".wp-block-fse-theme-api-greeting").first();

  await expect(block).toBeVisible();

  const greeting = block.locator("p");

  // Niebezpieczny HTML pozostaje zwykłym tekstem.
  await expect(greeting).toContainText(payload);

  // Nie powstaje rzeczywisty element img.
  await expect(block.locator("img")).toHaveCount(0);

  // JavaScript nie został uruchomiony.
  const executed = await page.evaluate(() => window.xssExecuted);

  expect(executed).toBe(false);

  // Nie pojawiło się nieoczekiwane okno alert.
  expect(dialogs).toHaveLength(0);
});
