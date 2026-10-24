import { test, expect } from "@playwright/test";

const baseURL = "http://nauka.local";

test("API Greeting debounces REST requests", async ({ page }) => {
  const username = process.env.WP_TEST_USER;
  const password = process.env.WP_TEST_PASSWORD;

  if (!username || !password) {
    throw new Error("Set WP_TEST_USER and WP_TEST_PASSWORD");
  }

  // Logowanie do WordPressa.
  await page.goto(`${baseURL}/wp-login.php`);

  await page.locator("#user_login").fill(username);
  await page.locator("#user_pass").fill(password);
  await page.locator("#wp-submit").click();

  await expect(page).toHaveURL(/wp-admin/);

  // Otwieramy nową stronę.
  await page.goto(`${baseURL}/wp-admin/post-new.php?post_type=page`);

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

  // Gutenberg może renderować zawartość w iframe.
  const iframe = page.locator('iframe[name="editor-canvas"]');

  const editor = (await iframe.count())
    ? page.frameLocator('iframe[name="editor-canvas"]')
    : page;

  const input = editor.getByRole("textbox", {
    name: "Twoje imię",
  });

  await expect(input).toBeVisible();

  // Liczymy wyłącznie żądania naszego endpointu.
  const requests = [];

  page.on("request", (request) => {
    if (
      request.method() === "GET" &&
      request.url().includes("/fse-theme/v1/status")
    ) {
      requests.push(request.url());
    }
  });

  // Wpisujemy imię szybko, znak po znaku.
  await input.pressSequentially("Anna", { delay: 50 });

  await expect(editor.getByText("Cześć, Anna!", { exact: true })).toBeVisible();

  expect(requests).toHaveLength(1);
  expect(new URL(requests[0]).searchParams.get("name")).toBe("Anna");
});
