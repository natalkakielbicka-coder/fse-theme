import { test, expect } from "@playwright/test";

test("API Greeting safely renders untrusted text", async ({ page }) => {
  const payload = '<img src=x onerror="window.xssExecuted=true">';

  await page.goto("http://nauka.local/o-mnie");

  await page.evaluate(() => {
    window.xssExecuted = false;
  });

  await page.setContent(`
    <div class="wp-block-fse-theme-api-greeting">
      <h3>API Greeting</h3>
      <p id="greeting"></p>
    </div>
  `);

  await page.locator("#greeting").evaluate((element, value) => {
    element.textContent = `Cześć, ${value}!`;
  }, payload);

  const greeting = page.locator("#greeting");

  await expect(greeting).toContainText(payload);

  await expect(
    page.locator(".wp-block-fse-theme-api-greeting img"),
  ).toHaveCount(0);

  const xssExecuted = await page.evaluate(() => window.xssExecuted);

  expect(xssExecuted).toBe(false);
});
