import { test, expect } from "@playwright/test";

test("FSE Latest Posts prevents duplicate AJAX requests", async ({ page }) => {
  const pageUrl = process.env.LATEST_POSTS_PAGE_URL;

  if (!pageUrl) {
    throw new Error("Set LATEST_POSTS_PAGE_URL");
  }

  let requestCount = 0;

  // Zatrzymujemy odpowiedź API, aby zasymulować wolny serwer.
  let releaseResponse;

  const responseGate = new Promise((resolve) => {
    releaseResponse = resolve;
  });

  await page.route("**/wp-json/wp/v2/posts?**", async (route) => {
    const url = new URL(route.request().url());

    if (url.searchParams.get("page") !== "2") {
      await route.continue();
      return;
    }

    requestCount++;

    await responseGate;

    await route.continue();
  });

  await page.goto(pageUrl, {
    waitUntil: "domcontentloaded",
  });

  const block = page
    .locator(".wp-block-fse-theme-latest-posts")
    .filter({
      has: page.locator(".fse-latest-posts__load-more"),
    })
    .first();

  await expect(block).toBeVisible();

  const button = block.locator(".fse-latest-posts__load-more");

  const cards = block.locator(".fse-latest-posts__card");

  const initialCount = await cards.count();

  try {
    // Pierwsze kliknięcie rozpoczyna pobieranie.
    await button.click();

    await expect(button).toBeDisabled();

    // Próba ponownego kliknięcia przez JavaScript.
    // Zwykły click Playwright nie kliknie disabled button.
    await button.evaluate((element) => {
      element.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
        }),
      );
    });

    // Dajemy obsłudze zdarzeń możliwość wykonania się.
    await expect.poll(() => requestCount).toBe(1);

    // Nadal tylko jedno zapytanie.
    expect(requestCount).toBe(1);
  } finally {
    // Zawsze zwalniamy odpowiedź, nawet gdy asercja zawiedzie.
    releaseResponse();
  }

  // Czekamy, aż karty zostaną dodane.
  await expect
    .poll(async () => cards.count(), {
      timeout: 15000,
    })
    .toBeGreaterThan(initialCount);

  expect(requestCount).toBe(1);

  await expect(block.locator(".fse-latest-posts__skeleton-item")).toHaveCount(
    0,
  );
});
