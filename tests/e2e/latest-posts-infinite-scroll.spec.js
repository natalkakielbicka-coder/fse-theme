import { test, expect } from "@playwright/test";

test("FSE Latest Posts loads posts with infinite scroll", async ({ page }) => {
  test.setTimeout(90000);

  const pageUrl = process.env.LATEST_POSTS_PAGE_URL;

  if (!pageUrl) {
    throw new Error("Set LATEST_POSTS_PAGE_URL");
  }

  const requestsByPage = new Map();

  // Liczymy żądania REST API.
  await page.route("**/wp-json/wp/v2/posts?**", async (route) => {
    const url = new URL(route.request().url());
    const pageNumber = Number(url.searchParams.get("page"));

    if (pageNumber >= 2) {
      requestsByPage.set(pageNumber, (requestsByPage.get(pageNumber) || 0) + 1);
    }

    await route.continue();
  });

  await page.goto(pageUrl, {
    waitUntil: "domcontentloaded",
  });

  // Znajdź blok działający w trybie auto.
  const block = page
    .locator(".wp-block-fse-theme-latest-posts")
    .filter({
      has: page.locator('.fse-latest-posts__pagination[data-load-mode="auto"]'),
    })
    .first();

  await expect(block).toBeVisible();

  const grid = block.locator(".fse-latest-posts__grid");
  const cards = grid.locator(".fse-latest-posts__card");
  const pagination = block.locator(".fse-latest-posts__pagination");
  const sentinel = pagination.locator(".fse-latest-posts__sentinel");
  const button = pagination.locator(".fse-latest-posts__load-more");
  const skeletons = grid.locator(".fse-latest-posts__skeleton-item");

  const perPage = Number(await pagination.getAttribute("data-per-page"));

  const totalPages = Number(await pagination.getAttribute("data-total-pages"));

  const initialCount = await cards.count();

  expect(perPage).toBeGreaterThan(0);
  expect(totalPages).toBeGreaterThan(1);
  expect(initialCount).toBeGreaterThan(0);

  // Sprawdź każdą kolejną stronę wyników.

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
    const currentPage = Number(await pagination.getAttribute("data-page"));

    // Jeśli Infinite Scroll już załadował tę stronę,
    // nie czekamy ponownie.
    if (currentPage < pageNumber) {
      await sentinel.scrollIntoViewIfNeeded();

      await expect
        .poll(async () => Number(await pagination.getAttribute("data-page")), {
          timeout: 15000,
        })
        .toBeGreaterThanOrEqual(pageNumber);
    }
  }

  // Czekamy na całkowite zakończenie paginacji.
  await expect
    .poll(async () => Number(await pagination.getAttribute("data-page")), {
      timeout: 15000,
    })
    .toBe(totalPages);

  // Sprawdzamy, czy skeletony zniknęły.
  await expect(skeletons).toHaveCount(0);

  // Sprawdzamy zakończenie ładowania.
  await expect(pagination).not.toHaveAttribute("aria-busy", "true");

  // Wszystkie wpisy zostały załadowane.
  const finalCount = await cards.count();

  expect(finalCount).toBeGreaterThan(initialCount);

  // Przycisk znika po ostatniej stronie.
  await expect(button).toHaveCount(0);

  // Sprawdzamy brak duplikatów wpisów.
  const urls = await grid
    .locator(".fse-latest-posts__title a")
    .evaluateAll((links) => links.map((link) => link.href));

  expect(new Set(urls).size).toBe(urls.length);

  // Każda strona powinna być pobrana tylko raz.
  for (let number = 2; number <= totalPages; number++) {
    expect(
      requestsByPage.get(number),
      `Duplicate request for page ${number}`,
    ).toBe(1);
  }

  // Sprawdzamy, że nie było żądań poza zakresem.
  for (const number of requestsByPage.keys()) {
    expect(number).toBeLessThanOrEqual(totalPages);
  }

  console.log("Infinite Scroll results:", {
    initialCount,
    finalCount,
    totalPages,
    requests: Object.fromEntries(requestsByPage),
  });
});
