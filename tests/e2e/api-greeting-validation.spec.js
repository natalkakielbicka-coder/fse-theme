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

  const button = editor.getByRole("button", {
    name: "Pobierz powitanie",
  });

  console.log(
    "Zarejestrowany blok:",
    await page.evaluate(() =>
      Boolean(window.wp?.blocks?.getBlockType("fse-theme/api-greeting")),
    ),
  );

  console.log(
    "Bloki w edytorze:",
    await page.evaluate(() =>
      window.wp.data
        .select("core/block-editor")
        .getBlocks()
        .map((block) => block.name),
    ),
  );

  console.log(
    "Pola w głównym dokumencie:",
    await page.getByRole("textbox").allTextContents(),
  );

  console.log(
    "Liczba pól w iframe:",
    await page
      .frameLocator('iframe[name="editor-canvas"]')
      .getByRole("textbox")
      .count(),
  );

  console.log(
    "Tekst API Greeting w iframe:",
    await page
      .frameLocator('iframe[name="editor-canvas"]')
      .getByText("API Greeting")
      .count(),
  );

  await expect(input).toBeVisible();

  // Test 1: puste imię.
  await input.fill("");
  await expect(button).toBeDisabled();

  // Test 2: jedna litera.
  await input.fill("A");
  await expect(button).toBeDisabled();

  // Test 3: prawidłowe imię.
  await input.fill("Anna");
  await expect(button).toBeEnabled();

  // Test 4: ponad 30 znaków.
  await input.fill("A".repeat(31));
  await expect(button).toBeDisabled();

  // Test 5: REST API.
  await input.fill("Anna");
  await button.click();

  await expect(editor.getByText("Cześć, Anna!")).toBeVisible();

  // Nie zapisujemy strony testowej.
});
