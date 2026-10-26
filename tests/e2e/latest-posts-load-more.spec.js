import { test, expect } from "@playwright/test";

test("FSE Latest Posts loads more posts without page reload", async ({
  page,
}) => {
  const pageUrl = process.env.LATEST_POSTS_PAGE_URL;

  if (!pageUrl) {
    throw new Error("Set LATEST_POSTS_PAGE_URL");
  }

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
  const button = block.locator(".fse-latest-posts__load-more");
  const status = block.locator(".fse-latest-posts__status");

  const initialCount = await cards.count();

  expect(initialCount).toBeGreaterThan(0);

  // Znacznik do wykrywania przeładowania dokumentu.
  await page.evaluate(() => {
    window.__loadMoreTestMarker = true;
  });

  // Oczekujemy na odpowiedź REST API.
  const responsePromise = page.waitForResponse((response) => {
    const url = new URL(response.url());

    return (
      url.pathname.includes("/wp-json/wp/v2/posts") &&
      url.searchParams.get("page") === "2" &&
      response.request().method() === "GET"
    );
  });

  await button.click();

  const response = await responsePromise;

  expect(response.ok()).toBeTruthy();

  const loadedPosts = await response.json();

  expect(loadedPosts.length).toBeGreaterThan(0);

  // Nowe karty pojawiły się na stronie.
  await expect(cards).toHaveCount(initialCount + loadedPosts.length);

  // Wszystkie karty mają linki do wpisów.
  const links = cards.locator(".fse-latest-posts__title a[href]");

  await expect(links).toHaveCount(initialCount + loadedPosts.length);

  // Sprawdzamy, czy dokument nie został przeładowany.
  const marker = await page.evaluate(() => window.__loadMoreTestMarker);

  expect(marker).toBe(true);

  // Sprawdzamy komunikat dostępności.
  await expect(status).toContainText(`Pobrano ${loadedPosts.length}`);
});
