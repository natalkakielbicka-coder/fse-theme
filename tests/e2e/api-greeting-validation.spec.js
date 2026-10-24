import { test, expect } from "@playwright/test";

const baseURL = "http://nauka.local";

test("API Greeting validates name in Gutenberg", async ({ page }) => {
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

  // Nowa, niezapisana strona.
  await page.goto(`${baseURL}/wp-admin/post-new.php?post_type=page`);

  // Czekamy na uruchomienie edytora.
  await page.waitForFunction(() => {
    return Boolean(
      window.wp?.blocks?.getBlockType("fse-theme/api-greeting") &&
      window.wp?.data?.dispatch("core/block-editor"),
    );
  });

  // Dodanie prawdziwego bloku przez Gutenberg Data API.
  await page.evaluate(() => {
    const editor = window.wp.data.dispatch("core/editor");

    const block = window.wp.blocks.createBlock("fse-theme/api-greeting");

    editor.editPost({
      content: window.wp.blocks.serialize([block]),
    });
  });

  // Sprawdzamy, czy blok został dodany do treści wpisu.
  await page.waitForFunction(() => {
    const content = window.wp.data.select("core/editor").getEditedPostContent();

    return content.includes("fse-theme/api-greeting");
  });

  // Gutenberg może renderować bloki w iframe.
  const iframe = page.locator('iframe[name="editor-canvas"]');

  const editor = (await iframe.count())
    ? page.frameLocator('iframe[name="editor-canvas"]')
    : page;

  const input = editor.getByRole("textbox", {
    name: "Twoje imię",
  });

  // Test 1: automatyczne pobieranie powitania.
  await input.fill("Anna");

  await expect(editor.getByText("Cześć, Anna!", { exact: true })).toBeVisible();

  // Test 2: zmiana imienia uruchamia kolejne zapytanie.
  await input.fill("Marek");

  await expect(
    editor.getByText("Cześć, Marek!", { exact: true }),
  ).toBeVisible();

  // Test 3: jedna litera jest niepoprawna.
  await input.fill("A");

  await expect(
    editor.getByText("Imię musi mieć co najmniej 2 znaki."),
  ).toBeVisible();

  await expect(editor.getByText("Cześć, Marek!", { exact: true })).toHaveCount(
    0,
  );

  // Test 4: zbyt długie imię.
  await input.fill("A".repeat(31));

  await expect(
    editor.getByText("Imię może mieć maksymalnie 30 znaków."),
  ).toBeVisible();

  // Test 5: puste pole.
  await input.fill("");

  await expect(
    editor.getByText("Imię musi mieć co najmniej 2 znaki."),
  ).toBeVisible();

  // Nie zapisujemy strony testowej.
});
