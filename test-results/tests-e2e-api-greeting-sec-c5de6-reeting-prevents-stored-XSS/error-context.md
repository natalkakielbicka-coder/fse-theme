# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\api-greeting-security.spec.js >> API Greeting prevents stored XSS
- Location: tests\e2e\api-greeting-security.spec.js:8:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.wp-block-fse-theme-api-greeting').first().locator('p')
Expected substring: "<img src=x onerror=\"window.xssExecuted=true\">"
Received string:    "Cześć, Asia!"

Call log:
  - Expect "toContainText" locator('.wp-block-fse-theme-api-greeting').first().locator('p') with timeout 5000ms
  - waiting for locator('.wp-block-fse-theme-api-greeting').first().locator('p')
    8 × locator resolved to <p>Cześć, Asia!</p>
      - unexpected value "Cześć, Asia!"
  - Target page, context or browser has been closed

```

```yaml
- paragraph: Cześć, Asia!
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | const payload = '<img src=x onerror="window.xssExecuted=true">';
  4  | 
  5  | // Podaj tutaj pełny adres opublikowanej strony testowej.
  6  | const testUrl = "http://nauka.local/o-mnie/";
  7  | 
  8  | test("API Greeting prevents stored XSS", async ({ page }) => {
  9  |   const dialogs = [];
  10 | 
  11 |   page.on("dialog", async (dialog) => {
  12 |     dialogs.push(dialog.message());
  13 |     await dialog.dismiss();
  14 |   });
  15 | 
  16 |   await page.addInitScript(() => {
  17 |     window.xssExecuted = false;
  18 |   });
  19 | 
  20 |   await page.goto(testUrl);
  21 | 
  22 |   const block = page.locator(".wp-block-fse-theme-api-greeting").first();
  23 | 
  24 |   await expect(block).toBeVisible();
  25 | 
  26 |   const greeting = block.locator("p");
  27 | 
  28 |   // Niebezpieczny HTML pozostaje zwykłym tekstem.
> 29 |   await expect(greeting).toContainText(payload);
     |                          ^ Error: expect(locator).toContainText(expected) failed
  30 | 
  31 |   // Nie powstaje rzeczywisty element img.
  32 |   await expect(block.locator("img")).toHaveCount(0);
  33 | 
  34 |   // JavaScript nie został uruchomiony.
  35 |   const executed = await page.evaluate(() => window.xssExecuted);
  36 | 
  37 |   expect(executed).toBe(false);
  38 | 
  39 |   // Nie pojawiło się nieoczekiwane okno alert.
  40 |   expect(dialogs).toHaveLength(0);
  41 | });
  42 | 
```