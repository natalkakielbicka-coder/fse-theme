import { test, expect } from "@playwright/test";

const baseURL = "http://nauka.local";

test("API Greeting cancels stale REST requests", async ({ page }) => {
  const username = process.env.WP_TEST_USER;
  const password = process.env.WP_TEST_PASSWORD;

  if (!username || !password) {
    throw new Error("Set WP_TEST_USER and WP_TEST_PASSWORD");
  }

  // Logowanie.
  await page.goto(`${baseURL}/wp-login.php`);
  await page.locator("#user_login").fill(username);
  await page.locator("#user_pass").fill(password);
  await page.locator("#wp-submit").click();

  await expect(page).toHaveURL(/wp-admin/);

  await page.goto(`${baseURL}/wp-admin/post-new.php?post_type=page`);

  await page.waitForFunction(() =>
    Boolean(
      window.wp?.blocks?.getBlockType("fse-theme/api-greeting") &&
      window.wp?.data?.dispatch("core/editor"),
    ),
  );

  // Wstawienie bloku bez zapisywania strony.
  await page.evaluate(() => {
    const block = window.wp.blocks.createBlock("fse-theme/api-greeting", {
      name: "",
    });

    window.wp.data.dispatch("core/editor").editPost({
      content: window.wp.blocks.serialize([block]),
    });
  });

  const iframe = page.locator('iframe[name="editor-canvas"]');

  const editor = (await iframe.count())
    ? page.frameLocator('iframe[name="editor-canvas"]')
    : page;

  const input = editor.getByRole("textbox", {
    name: "Twoje imię",
  });

  await expect(input).toBeVisible();

  const failures = [];

  page.on("requestfailed", (request) => {
    const name = new URL(request.url()).searchParams.get("name");

    if (request.url().includes("/fse-theme/v1/status") && name === "Anna") {
      failures.push(request.failure()?.errorText || "");
    }
  });

  // Kontrolujemy wyłącznie nasz endpoint REST API.
  await page.route("**/fse-theme/v1/status?*", async (route) => {
    const name = new URL(route.request().url()).searchParams.get("name");

    if (name === "Anna") {
      // Symulujemy wolny serwer.
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    try {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          hello: `Cześć, ${name}!`,
        }),
      });
    } catch {
      // Żądanie mogło zostać anulowane przez przeglądarkę.
    }
  });

  // Czekamy, aż zapytanie dla Anny naprawdę wystartuje.
  const annaRequest = page.waitForRequest(
    (request) =>
      request.url().includes("/fse-theme/v1/status") &&
      new URL(request.url()).searchParams.get("name") === "Anna",
  );

  await input.fill("Anna");
  await annaRequest;

  // Zmieniamy imię, gdy pierwsze żądanie jest w toku.
  await input.fill("Maria");

  await expect(
    editor.getByText("Cześć, Maria!", { exact: true }),
  ).toBeVisible();

  await expect(editor.getByText("Cześć, Anna!", { exact: true })).toHaveCount(
    0,
  );

  await expect(editor.getByRole("alert")).toHaveCount(0);

  // Sprawdzamy, czy przeglądarka zgłosiła anulowanie.
  await expect
    .poll(() => failures.some((error) => error.includes("ERR_ABORTED")), {
      timeout: 5000,
    })
    .toBe(true);
});
