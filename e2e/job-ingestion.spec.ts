import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { runIngestion } from "../lib/ingestion/run";

// Runs against a single real, small source (Ashby/Linear, ~25 postings) --
// not the full SEED_COMPANIES list -- to keep this fast and cheap (each
// posting costs one live Gemini embedding call) while still exercising the
// real fetch -> normalize -> embed -> dedup -> upsert pipeline end to end,
// against live Supabase. The other 3 connectors' parsing logic is covered
// by unit tests instead (lib/ingestion/sources/*.test.ts); this test is
// about proving the orchestration, not re-testing each source's shape.
//
// job_postings rows this creates are real, current job listings, not fake
// test fixtures -- intentionally not cleaned up afterward, unlike the
// throwaway user in ai-features.spec.ts. They're exactly what the real cron
// would put there anyway.
const TEST_COMPANY = [{ source: "ashby" as const, token: "linear", companyName: "Linear" }];

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

test("ingestion pipeline fetches, embeds, and upserts real postings idempotently", async () => {
  // Two real embedding batches back-to-back can trigger this project's
  // current Gemini rate limit (free tier: 100 embed requests/minute); on a
  // 429, retryOnRateLimit waits out Google's own stated retryDelay (seen
  // up to ~60s) or a ~66s fallback, up to 2 retries -- so this needs real
  // headroom for a worst case, not just the common case.
  test.setTimeout(220000);

  const firstRun = await runIngestion(TEST_COMPANY);
  expect(firstRun).toHaveLength(1);
  expect(firstRun[0].errors).toEqual([]);
  expect(firstRun[0].fetched).toBeGreaterThan(0);
  expect(firstRun[0].upserted).toBe(firstRun[0].fetched);

  const { count: countAfterFirstRun } = await admin
    .from("job_postings")
    .select("id", { count: "exact", head: true })
    .eq("company", "Linear");

  // Re-running against the same source must not create duplicate rows --
  // source_id + external_id upsert should update in place.
  const secondRun = await runIngestion(TEST_COMPANY);
  expect(secondRun[0].errors).toEqual([]);
  expect(secondRun[0].upserted).toBe(secondRun[0].fetched);

  const { count: countAfterSecondRun } = await admin
    .from("job_postings")
    .select("id", { count: "exact", head: true })
    .eq("company", "Linear");

  expect(countAfterSecondRun).toBe(countAfterFirstRun);

  // Every ingested posting should have gotten a dedup_group_id (its own id,
  // since nothing else in the seed set matches it). Scoped to status =
  // 'active': Linear postings from every past test run accumulate in this
  // table (never cleaned up, see the file comment above), and Linear's
  // real live listings do close for real between runs over time -- an
  // unscoped `.limit(1)` here has genuinely picked a stale, legitimately-
  // closed row before (not a regression, the closure detection was
  // correct) and asserted the wrong thing about it. This test proves "an
  // actively-fetched posting has proper fields set," not "no posting from
  // this company is ever closed" -- that's covered separately by the
  // closure test below.
  const { data: sample } = await admin
    .from("job_postings")
    .select("id, dedup_group_id, embedding, status")
    .eq("company", "Linear")
    .eq("status", "active")
    .limit(1)
    .single();
  expect(sample?.dedup_group_id).toBeTruthy();
  expect(sample?.embedding).toBeTruthy();
  expect(sample?.status).toBe("active");

  // categorizeJobPosting runs for real here, not mocked -- proves the
  // wiring in run.ts actually persists a category, not just that the pure
  // classifier (covered by lib/ingestion/categorize.test.ts) works in
  // isolation. Every row defaults to 'non_technical' at the column level
  // (0008_job_category.sql), so asserting *at least one* row ended up
  // something else is the real proof classification engaged -- Linear is
  // a software company, so a batch of ~25 postings with zero software/
  // data_ml/etc. roles would indicate the wiring silently no-opped.
  const { data: categorized } = await admin
    .from("job_postings")
    .select("category")
    .eq("company", "Linear")
    .limit(30);
  expect(categorized!.length).toBeGreaterThan(0);
  expect(categorized!.some((row) => row.category !== "non_technical")).toBe(true);
});

test("a posting no longer returned by the source gets marked closed", async () => {
  test.setTimeout(220000);

  // A real posting for a real company, upserted directly rather than
  // through a live ATS fetch, specifically so this test controls whether
  // it "disappears" on the next fetch -- real Linear postings can't be
  // reliably made to vanish on demand for a test.
  const { data: source } = await admin
    .from("job_sources")
    .select("id")
    .eq("name", "ashby")
    .single();

  const fakeExternalId = `e2e-closure-test-${Date.now()}`;
  await admin.from("job_postings").insert({
    source_id: source!.id,
    external_id: fakeExternalId,
    company: "Linear",
    title: "E2E Closure Test Posting",
    url: "https://example.com/closure-test",
    status: "active",
  });

  await runIngestion(TEST_COMPANY);

  const { data: after } = await admin
    .from("job_postings")
    .select("status")
    .eq("source_id", source!.id)
    .eq("external_id", fakeExternalId)
    .single();
  expect(after?.status).toBe("closed");

  await admin.from("job_postings").delete().eq("source_id", source!.id).eq("external_id", fakeExternalId);
});

test("ingested jobs are visible and searchable in the dashboard", async ({ page }) => {
  // Real signup/login isn't needed here since /dashboard/jobs only reads
  // public data -- but the dashboard layout gates all of /dashboard behind
  // auth, so a session is still required to reach the page at all.
  const email = `e2e-jobs-${Date.now()}@example.com`;
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

    await page.goto("/dashboard/jobs?q=Linear");
    const results = page.getByTestId("job-results");
    await expect(results.getByRole("link")).not.toHaveCount(0);
    await expect(results.getByText("Linear").first()).toBeVisible();
  } finally {
    await admin.auth.admin.deleteUser(data.user.id);
  }
});

test("the category filter narrows results to the selected category", async ({ page }) => {
  const email = `e2e-category-filter-${Date.now()}@example.com`;
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

    // Real, previously-ingested Linear postings (see the test above) are
    // spread across whatever categories their titles actually classified
    // into -- filtering to just "Software" must not show anything tagged
    // with a different category badge.
    await page.goto("/dashboard/jobs?category=software");
    const results = page.getByTestId("job-results");
    await expect(results.getByRole("link")).not.toHaveCount(0);

    const badgeTexts = await results.getByText("Software", { exact: true }).allTextContents();
    const resultCount = await results.getByRole("link").count();
    expect(badgeTexts.length).toBe(resultCount);
  } finally {
    await admin.auth.admin.deleteUser(data.user.id);
  }
});
