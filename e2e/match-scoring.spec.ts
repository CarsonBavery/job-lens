import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { runIngestion } from "../lib/ingestion/run";

// Reuses the same real, small source as job-ingestion.spec.ts (Ashby/Linear,
// ~25 postings) so this test has real, embedded job_postings rows to match
// against without paying for a full 7-company ingestion run just to verify
// scoring logic. Idempotent (upsert), so running this alongside
// job-ingestion.spec.ts in the same suite doesn't create duplicates.
const TEST_COMPANY = [{ source: "ashby" as const, token: "linear", companyName: "Linear" }];

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

test("finding matching jobs embeds a resume and ranks real postings against it", async ({
  page,
}) => {
  // Worst case: one ingestion run (batch embed, up to ~66s retry wait) plus
  // one single-text embed call for the resume (same retry budget) plus real
  // browser navigation/autosave -- see playwright.config.ts for why the
  // per-action timeouts are already generous.
  test.setTimeout(240000);

  await runIngestion(TEST_COMPANY);

  const email = `e2e-match-${Date.now()}@example.com`;
  const password = "e2e-Test-Password-123!";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;

  try {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/\/dashboard\/jobs$/);

    await page.goto("/dashboard/resumes");
    await page.getByPlaceholder("e.g. Frontend Engineer").fill("E2E Match Test Resume");
    await page.getByRole("button", { name: "New Resume" }).click();
    await page.waitForURL(/\/dashboard\/resumes\/[0-9a-f-]{36}$/);

    // Content deliberately overlaps with real software-engineering job
    // postings (Linear is a software company) so the embedding similarity
    // comfortably clears match_jobs_for_resume's 0.3 threshold.
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type(
      "Senior Software Engineer with 6 years building backend services in Go and TypeScript, distributed systems, and product engineering at fast-growing startups.",
    );
    await expect(page.getByText("Saved", { exact: true })).toBeVisible({ timeout: 10000 });

    await page.getByText("Matching jobs", { exact: true }).click();
    await page.getByRole("button", { name: "Find matching jobs" }).click();

    const results = page.getByTestId("matching-jobs-results");
    await expect(results).toBeVisible({ timeout: 180000 });
    await expect(results.getByRole("link")).not.toHaveCount(0);
    await expect(results.getByText(/% match/).first()).toBeVisible();
  } finally {
    await admin.auth.admin.deleteUser(data.user.id);
  }
});
