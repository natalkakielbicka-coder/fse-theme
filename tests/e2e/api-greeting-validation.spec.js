import { test, expect } from "@playwright/test";

const baseURL = "http://nauka.local";

test("API Greeting validates name in Gutenberg", async ({ page }) => {
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

  // 2. Otwieramy edytor nowej strony.
  await page.goto(`${baseURL}/wp-admin/post-new.php?post_type=page`, {
    waitUntil: "domcontentloaded",
  });

  // 3. Czekamy na rejestrację bloku.
  await page.waitForFunction(() =>
    Boolean(
      window.wp?.blocks?.getBlockType("fse-theme/api-greeting") &&
      window.wp?.data?.dispatch("core/editor"),
    ),
  );

  // 4. Dodajemy blok do treści strony.
  // W FSE używamy core/editor zamiast insertBlocks.
  await page.evaluate(() => {
    const block = window.wp.blocks.createBlock("fse-theme/api-greeting", {
      name: "",
    });

    window.wp.data.dispatch("core/editor").editPost({
      content: window.wp.blocks.serialize([block]),
    });
  });

  // 5. Znajdujemy obszar edycji Gutenberga.
  const iframe = page.locator('iframe[name="editor-canvas"]');

  const editor = (await iframe.count())
    ? page.frameLocator('iframe[name="editor-canvas"]')
    : page;

  const input = editor.getByRole("textbox", {
    name: "Twoje imię",
  });

  await expect(input).toBeVisible();

  // TEST 1: Puste pole.
  await input.fill("");

  await expect(
    editor.getByText("Imię musi mieć co najmniej 2 znaki."),
  ).toBeVisible();

  // TEST 2: Jedna litera.
  await input.fill("A");

  await expect(
    editor.getByText("Imię musi mieć co najmniej 2 znaki."),
  ).toBeVisible();

  // TEST 3: Poprawne imię.
  await input.fill("Anna");

  await expect(editor.getByText("Cześć, Anna!", { exact: true })).toBeVisible();

  // TEST 4: Zmiana imienia.
  await input.fill("Marek");

  await expect(
    editor.getByText("Cześć, Marek!", { exact: true }),
  ).toBeVisible();

  // TEST 5: Imię dłuższe niż 30 znaków.
  await input.fill("A".repeat(31));

  await expect(
    editor.getByText("Imię może mieć maksymalnie 30 znaków."),
  ).toBeVisible();

  await expect(editor.getByText("Cześć, Marek!", { exact: true })).toHaveCount(
    0,
  );

  // TEST 6: Ponownie poprawne imię.
  await input.fill("Maria");

  await expect(
    editor.getByText("Cześć, Maria!", { exact: true }),
  ).toBeVisible();

  // Nie zapisujemy testowej strony.
});
