import { test, expect } from "@playwright/test";

test("FSE Latest Posts recovers from REST API error", async ({ page }) => {
  const pageUrl = process.env.LATEST_POSTS_PAGE_URL;

  if (!pageUrl) {
    throw new Error("Set LATEST_POSTS_PAGE_URL");
  }

  let requestCount = 0;

  // Pierwsze żądanie zwróci HTTP 500.
  // Drugie trafi do prawdziwego REST API.
  await page.route("**/wp-json/wp/v2/posts?**", async (route) => {
    const url = new URL(route.request().url());

    if (url.searchParams.get("page") !== "2") {
      await route.continue();
      return;
    }

    requestCount++;

    if (requestCount === 1) {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          code: "test_server_error",
          message: "Simulated server error",
        }),
      });

      return;
    }

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

  const cards = block.locator(".fse-latest-posts__card");
  const skeletons = block.locator(".fse-latest-posts__skeleton-item");
  const button = block.locator(".fse-latest-posts__load-more");
  const status = block.locator(".fse-latest-posts__status");
  const pagination = block.locator(".fse-latest-posts__pagination");

  const initialCount = await cards.count();

  expect(initialCount).toBeGreaterThan(0);

  // 1. Pierwsza próba — błąd HTTP 500.
  await button.click();

  await expect(status).toContainText("Nie udało się pobrać wpisów");

  await expect(button).toHaveText("Spróbuj ponownie");
  await expect(button).toBeEnabled();

  // Skeletony muszą zostać usunięte.
  await expect(skeletons).toHaveCount(0);

  // Stan ładowania musi zostać wyłączony.
  await expect(pagination).not.toHaveAttribute("aria-busy", "true");

  // Liczba wpisów nie powinna się zmienić.
  await expect(cards).toHaveCount(initialCount);

  // Numer strony nie może się zwiększyć po błędzie.
  await expect(pagination).toHaveAttribute("data-page", "1");

  // 2. Ponawiamy żądanie.
  await button.click();

  // Czekamy, aż prawdziwe wpisy zostaną dodane.
  await expect
    .poll(async () => cards.count(), {
      timeout: 15000,
    })
    .toBeGreaterThan(initialCount);

  // Sprawdzamy, czy wysłano dwa żądania.
  expect(requestCount).toBe(2);

  await expect(skeletons).toHaveCount(0);

  await expect(status).toContainText(/Pobrano \d+/);

  await expect(pagination).toHaveAttribute("data-page", "2");

  // Nie powinno być duplikatów adresów wpisów.
  const urls = await block
    .locator(".fse-latest-posts__title a")
    .evaluateAll((links) => links.map((link) => link.href));

  expect(new Set(urls).size).toBe(urls.length);
});
