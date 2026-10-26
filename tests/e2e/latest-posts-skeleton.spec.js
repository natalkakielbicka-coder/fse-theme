import { test, expect } from "@playwright/test";

test("FSE Latest Posts shows skeletons while loading", async ({ page }) => {
  const pageUrl = process.env.LATEST_POSTS_PAGE_URL;

  if (!pageUrl) {
    throw new Error("Set LATEST_POSTS_PAGE_URL");
  }

  // Testujemy również prefers-reduced-motion.
  await page.emulateMedia({
    reducedMotion: "reduce",
  });

  // Kontrolowane opóźnienie odpowiedzi REST API.
  let intercepted = false;

  await page.route("**/wp-json/wp/v2/posts?**", async (route) => {
    const url = new URL(route.request().url());

    if (url.searchParams.get("page") !== "2") {
      await route.continue();
      return;
    }

    intercepted = true;

    // Pobieramy rzeczywistą odpowiedź WordPressa.
    const response = await route.fetch();

    // Dajemy czas na sprawdzenie skeletonów.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    await route.fulfill({ response });
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

  const grid = block.locator(".fse-latest-posts__grid");
  const cards = grid.locator(".fse-latest-posts__card");
  const skeletons = grid.locator(".fse-latest-posts__skeleton-item");

  const button = block.locator(".fse-latest-posts__load-more");

  const status = block.locator(".fse-latest-posts__status");

  const initialCount = await cards.count();

  expect(initialCount).toBeGreaterThan(0);

  // Klikamy Załaduj więcej.
  await button.click();

  // Skeletony muszą pojawić się podczas ładowania.
  await expect(skeletons.first()).toBeVisible();

  // Przycisk musi być zablokowany.
  await expect(button).toBeDisabled();

  await expect(button).toContainText("Ładowanie");

  // Sprawdzamy dostępność.
  await expect(block.locator(".fse-latest-posts__pagination")).toHaveAttribute(
    "aria-busy",
    "true",
  );

  // Animacje muszą być wyłączone przy reduced motion.
  await expect(
    skeletons.first().locator(".fse-latest-posts__skeleton-line").first(),
  ).toHaveCSS("animation-name", "none");

  // Czekamy na prawdziwe karty.
  await expect
    .poll(async () => cards.count(), {
      timeout: 15000,
    })
    .toBeGreaterThan(initialCount);

  expect(intercepted).toBe(true);

  // Skeletony powinny zniknąć.
  await expect(skeletons).toHaveCount(0);

  // aria-busy powinno zostać usunięte.
  await expect(
    block.locator(".fse-latest-posts__pagination"),
  ).not.toHaveAttribute("aria-busy", "true");

  // Komunikat informuje o pobranych wpisach.
  await expect(status).toContainText(/Pobrano \d+/);

  // Nowe karty nie powinny być animowane.
  const newCard = grid.locator(".fse-latest-posts__item--enter").first();

  await expect(newCard).toHaveCSS("animation-name", "none");
});
