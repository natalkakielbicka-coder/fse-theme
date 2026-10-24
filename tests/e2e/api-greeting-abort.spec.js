import { test, expect } from "@playwright/test";

const baseURL = "http://nauka.local";

test("API Greeting cancels stale REST requests", async ({ page }) => {
  const username = process.env.WP_TEST_USER;
  const password = process.env.WP_TEST_PASSWORD;

  if (!username || !password) {
    throw new Error("Set WP_TEST_USER and WP_TEST_PASSWORD");
  }

  // 1. Obserwujemy anulowanie żądania dla Anny.
  // Kod zostanie uruchomiony przed skryptami strony.
  await page.addInitScript(() => {
    window.__greetingAbortCount = 0;

    const originalFetch = window.fetch;

    window.fetch = function (input, init) {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input?.url || "";

      const signal = init?.signal || input?.signal;

      if (
        url.includes("/fse-theme/v1/status") &&
        new URL(url, window.location.origin).searchParams.get("name") ===
          "Anna" &&
        signal
      ) {
        if (signal.aborted) {
          window.__greetingAbortCount++;
        } else {
          signal.addEventListener(
            "abort",
            () => {
              window.__greetingAbortCount++;
            },
            { once: true },
          );
        }
      }

      return originalFetch.apply(this, arguments);
    };
  });

  // 2. Logowanie do WordPressa.
  await page.goto(`${baseURL}/wp-login.php`, {
    waitUntil: "domcontentloaded",
  });

  await page.locator("#user_login").fill(username);
  await page.locator("#user_pass").fill(password);
  await page.locator("#wp-submit").click();

  await expect(page).toHaveURL(/wp-admin/);

  // 3. Otwieramy edytor Gutenberga.
  await page.goto(`${baseURL}/wp-admin/post-new.php?post_type=page`, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForFunction(() =>
    Boolean(
      window.wp?.blocks?.getBlockType("fse-theme/api-greeting") &&
      window.wp?.data?.dispatch("core/editor"),
    ),
  );

  // 4. Wstawiamy blok do treści strony.
  // Nie zapisujemy strony w bazie danych.
  await page.evaluate(() => {
    const block = window.wp.blocks.createBlock("fse-theme/api-greeting", {
      name: "",
    });

    window.wp.data.dispatch("core/editor").editPost({
      content: window.wp.blocks.serialize([block]),
    });
  });

  // 5. Znajdujemy pole w edytorze Gutenberga.
  const iframe = page.locator('iframe[name="editor-canvas"]');

  const editor = (await iframe.count())
    ? page.frameLocator('iframe[name="editor-canvas"]')
    : page;

  const input = editor.getByRole("textbox", {
    name: "Twoje imię",
  });

  await expect(input).toBeVisible();

  // 6. Symulujemy powolną odpowiedź dla Anny.
  let annaRouteCompleted = false;

  await page.route("**/fse-theme/v1/status?*", async (route) => {
    const name = new URL(route.request().url()).searchParams.get("name");

    if (name === "Anna") {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      try {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            hello: "Cześć, Anna!",
          }),
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

  // 7. Czekamy na wysłanie zapytania dla Anny.
  const annaRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());

    return (
      url.pathname.endsWith("/fse-theme/v1/status") &&
      url.searchParams.get("name") === "Anna"
    );
  });

  await input.fill("Anna");
  await annaRequest;

  // 8. Zmieniamy imię, gdy zapytanie dla Anny trwa.
  await input.fill("Maria");

  // 9. Oczekujemy aktualnego powitania.
  await expect(
    editor.getByText("Cześć, Maria!", { exact: true }),
  ).toBeVisible();

  // 10. Czekamy na zakończenie obsługi starego żądania.
  await expect.poll(() => annaRouteCompleted).toBe(true);

  // 11. Stara odpowiedź nie może zastąpić nowej.
  await expect(editor.getByText("Cześć, Anna!", { exact: true })).toHaveCount(
    0,
  );

  await expect(
    editor.getByText("Cześć, Maria!", { exact: true }),
  ).toBeVisible();

  // Nie powinien pojawić się żaden błąd.
  await expect(editor.getByRole("alert")).toHaveCount(0);

  // 12. Sprawdzamy, czy sygnał Anny został anulowany.
  await expect
    .poll(async () => {
      const counts = await Promise.all(
        page.frames().map(async (frame) => {
          try {
            return await frame.evaluate(() => window.__greetingAbortCount || 0);
          } catch {
            return 0;
          }
        }),
      );

      return counts.reduce((sum, count) => sum + count, 0);
    })
    .toBeGreaterThan(0);
});
