import { test, expect } from "@playwright/test";

const baseURL = "http://nauka.local";

test("API Greeting ignores stale REST responses", async ({ page }) => {
  const username = process.env.WP_TEST_USER;
  const password = process.env.WP_TEST_PASSWORD;

  if (!username || !password) {
    throw new Error("Set WP_TEST_USER and WP_TEST_PASSWORD");
  }

  // Logowanie.
  await page.goto(`${baseURL}/wp-login.php`, {
    waitUntil: "domcontentloaded",
  });

  await page.locator("#user_login").fill(username);
  await page.locator("#user_pass").fill(password);
  await page.locator("#wp-submit").click();

  await expect(page).toHaveURL(/wp-admin/);

  // Otwieramy edytor Gutenberga.
  await page.goto(`${baseURL}/wp-admin/post-new.php?post_type=page`, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForFunction(() =>
    Boolean(
      window.wp?.blocks?.getBlockType("fse-theme/api-greeting") &&
      window.wp?.data?.dispatch("core/editor"),
    ),
  );

  // Wstawiamy blok do treści strony.
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

  // Kontrolujemy zakończenie opóźnionego żądania.
  let annaRouteCompleted = false;

  await page.route("**/fse-theme/v1/status?*", async (route) => {
    const name = new URL(route.request().url()).searchParams.get("name");

    if (name === "Anna") {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      try {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ hello: "Cześć, Anna!" }),
        });
      } catch {
        // Żądanie mogło zostać anulowane.
      } finally {
        annaRouteCompleted = true;
      }

      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        hello: `Cześć, ${name}!`,
      }),
    });
  });

  // Czekamy, aż żądanie Anny zostanie wysłane.
  const annaRequest = page.waitForRequest(
    (request) =>
      request.url().includes("/fse-theme/v1/status") &&
      new URL(request.url()).searchParams.get("name") === "Anna",
  );

  await input.fill("Anna");
  await annaRequest;

  // Zmieniamy imię w trakcie starego zapytania.
  await input.fill("Maria");

  await expect(
    editor.getByText("Cześć, Maria!", { exact: true }),
  ).toBeVisible();

  // Czekamy na zakończenie obsługi starego żądania.
  await expect.poll(() => annaRouteCompleted).toBe(true);

  // Stara odpowiedź nie może zastąpić nowej.
  await expect(editor.getByText("Cześć, Anna!", { exact: true })).toHaveCount(
    0,
  );

  await expect(
    editor.getByText("Cześć, Maria!", { exact: true }),
  ).toBeVisible();

  await expect(editor.getByRole("alert")).toHaveCount(0);
});
