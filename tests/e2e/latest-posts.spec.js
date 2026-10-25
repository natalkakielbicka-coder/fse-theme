import { test, expect } from "@playwright/test";

test("FSE Latest Posts renders posts on frontend", async ({
  page,
  request,
}) => {
  // Podaj adres strony zawierającej blok.
  const pageUrl = process.env.LATEST_POSTS_PAGE_URL;

  if (!pageUrl) {
    throw new Error(
      "Set LATEST_POSTS_PAGE_URL to the page containing the block.",
    );
  }

  await page.goto(pageUrl);

  // Znajdź blok.
  const block = page.locator(".wp-block-fse-theme-latest-posts");

  await expect(block).toBeVisible();

  // Sprawdź liczbę wpisów.
  const posts = block.locator("ul > li");

  await expect(posts).toHaveCount(5);

  // Sprawdź linki wszystkich wpisów.
  const links = posts.locator("a[href]");

  await expect(links).toHaveCount(5);

  for (const link of await links.all()) {
    const title = await link.textContent();
    const href = await link.getAttribute("href");

    expect(title?.trim()).toBeTruthy();
    expect(href).toBeTruthy();

    const targetUrl = new URL(href, pageUrl);

    expect(targetUrl.protocol).toMatch(/^https?:$/);

    // Sprawdź, czy wpis jest dostępny.
    const response = await request.get(targetUrl.href);

    expect(response.ok()).toBeTruthy();
  }
});
