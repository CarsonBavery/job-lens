import { defineConfig, devices } from "@playwright/test";

// e2e tests that talk to Supabase directly (test-user setup/teardown) need
// these in the test runner's own process, not just the dev server's.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local -- tests that need it will fail with a clear error
  // instead of a silent missing-env-var one.
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
