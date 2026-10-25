import { test, expect } from "@playwright/test";

const baseURL = "http://nauka.local";

test("FSE Latest Posts displays correct category posts", async ({
  page,
  request,
}) => {
  const pageUrl = process.env.LATEST_POSTS_PAGE_URL;
  const categoryId = Number(process.env.LATEST_POSTS_CATEGORY_ID);

  if (!pageUrl) {
    throw new Error("Set LATEST_POSTS_PAGE_URL");
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("Set a valid LATEST_POSTS_CATEGORY_ID");
  }

  // Pobieramy 5 wpisów z wybranej kategorii.
  const response = await request.get(`${baseURL}/wp-json/wp/v2/posts`, {
    params: {
      categories: categoryId,
      per_page: 5,
      orderby: "date",
      order: "desc",
    },
  });

  expect(response.ok()).toBeTruthy();

  const apiPosts = await response.json();

  expect(apiPosts.length).toBeGreaterThan(0);

  // Otwieramy stronę z blokiem.
  await page.goto(pageUrl);

  const block = page.locator(".wp-block-fse-theme-latest-posts");

  await expect(block).toBeVisible();

  const links = block.locator("ul > li > a");

  // Liczba wpisów powinna zgadzać się z API.
  await expect(links).toHaveCount(apiPosts.length);

  // Pobieramy rzeczywiste adresy.
  const displayedUrls = await links.evaluateAll((elements) =>
    elements.map((link) => link.href),
  );

  const expectedUrls = apiPosts.map((post) => post.link);

  // Sprawdzamy również kolejność wpisów.
  expect(displayedUrls).toEqual(expectedUrls);
});
