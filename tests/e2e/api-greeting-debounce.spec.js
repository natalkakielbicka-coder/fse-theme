import { test, expect } from "@playwright/test";

const baseURL = "http://nauka.local";

test("API Greeting debounces REST requests", async ({ page }) => {
  const username = process.env.WP_TEST_USER;
  const password = process.env.WP_TEST_PASSWORD;

  if (!username || !password) {
    throw new Error("Set WP_TEST_USER and WP_TEST_PASSWORD");
  }

  // 1. Logowanie do WordPressa.
  await page.goto(`${baseURL}/wp-login.php`, {
    waitUntil: "domcontentloaded",
  });

  await page.locator("#user_login").fill(username);
  await page.locator("#user_pass").fill(password);
  await page.locator("#wp-submit").click();

  await expect(page).toHaveURL(/wp-admin/);

  // 2. Otwieramy edytor.
  await page.goto(`${baseURL}/wp-admin/post-new.php?post_type=page`, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForFunction(() =>
    Boolean(
      window.wp?.blocks?.getBlockType("fse-theme/api-greeting") &&
      window.wp?.data?.dispatch("core/editor"),
    ),
  );

  // 3. Dodajemy blok z pustym imieniem.
  await page.evaluate(() => {
    const block = window.wp.blocks.createBlock("fse-theme/api-greeting", {
      name: "",
    });

    window.wp.data.dispatch("core/editor").editPost({
      content: window.wp.blocks.serialize([block]),
    });
  });

  // 4. Znajdujemy pole imienia.
  const iframe = page.locator('iframe[name="editor-canvas"]');

  const editor = (await iframe.count())
    ? page.frameLocator('iframe[name="editor-canvas"]')
    : page;

  const input = editor.getByRole("textbox", {
    name: "Twoje imię",
  });

  await expect(input).toBeVisible();

  // 5. Nasłuchujemy zapytań do endpointu.
  const requests = [];

  page.on("request", (request) => {
    const url = new URL(request.url());

    if (
      request.method() === "GET" &&
      url.pathname === "/wp-json/fse-theme/v1/status"
    ) {
      requests.push(url.searchParams.get("name"));
    }
  });

  // 6. Wpisujemy imię z krótkimi odstępami.
  await input.pressSequentially("Anna", { delay: 50 });

  // Czekamy na odpowiedź z REST API.
  await expect(editor.getByText("Cześć, Anna!", { exact: true })).toBeVisible();

  // 7. Sprawdzamy liczbę żądań.
  expect(requests).toEqual(["Anna"]);
});
