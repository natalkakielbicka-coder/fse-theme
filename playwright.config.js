import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: process.env.WP_BASE_URL || "http://nauka.local",
  },
});
