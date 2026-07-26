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
  // These tests hit real external services (Supabase, Gemini) rather than
  // mocks, and this project's current Gemini API tier has a low enough rate
  // limit that running tests in parallel makes them compete for the same
  // quota -- confirmed during Phase 3: every spec passed individually, but
  // running the suite with fullyParallel workers reliably 429'd. Retrying
  // harder doesn't fix concurrent contention over a shared limit; running
  // serially does.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    // Default (30s) isn't enough headroom for a navigation that's waiting
    // on a Server Action retrying a rate-limited Gemini call underneath it
    // -- retryOnRateLimit can wait out a real ~60s Google-stated retryDelay
    // (see the fullyParallel comment above). Separate from, and smaller
    // than, the test-level test.setTimeout() those specs also set.
    // Covers the worst case inside retryOnRateLimit: 2 retries at up to
    // ~66s each (a full per-minute quota window plus margin) can all
    // happen inside a single server-side request the browser is waiting on.
    navigationTimeout: 180000,
    actionTimeout: 180000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
