import { test, expect } from "@playwright/test";

test("FSE Latest Posts loads multiple pages efficiently", async ({ page }) => {
  const pageUrl = process.env.LATEST_POSTS_PAGE_URL;

  if (!pageUrl) {
    throw new Error("Set LATEST_POSTS_PAGE_URL");
  }

  const apiDurations = [];
  const pendingRequests = new Map();

  page.on("request", (request) => {
    if (
      request.url().includes("/wp-json/wp/v2/posts?") &&
      request.method() === "GET"
    ) {
      pendingRequests.set(request, performance.now());
    }
  });

  page.on("requestfinished", (request) => {
    const start = pendingRequests.get(request);

    if (start !== undefined) {
      apiDurations.push(Math.round(performance.now() - start));

      pendingRequests.delete(request);
    }
  });

  page.on("requestfailed", (request) => {
    pendingRequests.delete(request);
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
  const button = block.locator(".fse-latest-posts__load-more");
  const status = block.locator(".fse-latest-posts__status");

  const initialCount = await cards.count();

  let clicks = 0;
  const maxClicks = 10;

  while ((await button.count()) > 0 && clicks < maxClicks) {
    await expect(button).toBeEnabled();

    const previousCount = await cards.count();

    await button.click();

    await expect
      .poll(() => cards.count(), {
        timeout: 15000,
      })
      .toBeGreaterThan(previousCount);

    await expect(status).toContainText(/Pobrano \d+/);

    await expect(block.locator(".fse-latest-posts__skeleton-item")).toHaveCount(
      0,
    );

    clicks++;
  }

  const finalCount = await cards.count();

  expect(finalCount).toBeGreaterThan(initialCount);
  expect(clicks).toBeGreaterThan(0);

  // Sprawdzamy brak duplikatów.
  const urls = await block
    .locator(".fse-latest-posts__title a")
    .evaluateAll((links) => links.map((link) => link.href));

  expect(new Set(urls).size).toBe(urls.length);

  // Sprawdzamy miniatury dodanych kart.
  const images = block.locator(".fse-latest-posts__item--enter img");

  const imageData = await images.evaluateAll((elements) =>
    elements.map((img) => ({
      loading: img.loading,
      src: img.currentSrc || img.src,
    })),
  );

  for (const image of imageData) {
    expect(image.loading).toBe("lazy");
    expect(image.src).toBeTruthy();
  }

  console.log("Performance results:", {
    initialCount,
    finalCount,
    clicks,
    apiDurations,
  });
});
