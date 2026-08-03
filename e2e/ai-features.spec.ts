import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and
// GEMINI_API_KEY (loaded from .env.local by playwright.config.ts). Creates
// and deletes its own throwaway user via the Supabase admin API so runs are
// isolated and don't depend on -- or pollute -- any real account.
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const TEST_EMAIL = `e2e-ai-features-${Date.now()}@example.com`;
const TEST_PASSWORD = "e2e-Test-Password-123!";
let testUserId: string | undefined;

test.beforeAll(async () => {
  const { data, error } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  testUserId = data.user.id;
});

test.afterAll(async () => {
  if (testUserId) {
    await admin.auth.admin.deleteUser(testUserId);
  }
});

test("resume tailoring and cover letter generation work end-to-end", async ({ page }) => {
  // This makes 3 real Gemini calls (tailor + 2 cover letter generations);
  // retryOnRateLimit can wait out a real ~60s retryDelay, or up to 2
  // ~66s fallback retries, per call on a 429 (see
  // lib/gemini/retryOnRateLimit.ts) -- worst case across 3 calls is real,
  // not padding for its own sake.
  test.setTimeout(480000);

  await page.goto("/login");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/dashboard\/jobs$/);

  // --- Create a base resume ---
  await page.goto("/dashboard/resumes");
  await page.getByPlaceholder("e.g. Frontend Engineer").fill("E2E Test Resume");
  await page.getByRole("button", { name: "New Resume" }).click();
  await page.waitForURL(/\/dashboard\/resumes\/[0-9a-f-]{36}$/);
  const baseResumeUrl = page.url();

  // --- Type real content so tailoring has something to work with ---
  const editor = page.locator(".tiptap");
  await editor.click();
  await page.keyboard.type("Jane Doe");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Built a payments API handling 2M requests/day");
  await expect(page.getByText("Saved", { exact: true })).toBeVisible({ timeout: 10000 });

  // --- Tailor for a job ---
  await page.getByText("Tailor for a job (AI)").click();
  await page
    .getByPlaceholder("Paste the job description here…")
    .fill("Senior Backend Engineer at Acme Corp, scaling high-throughput APIs.");
  await page.getByRole("button", { name: "Generate tailored resume" }).click();

  // No explicit timeout: inherits use.navigationTimeout from playwright.config.ts,
  // which accounts for a real Gemini retry wait.
  await page.waitForURL(
    (url) => url.pathname !== new URL(baseResumeUrl).pathname && /\/dashboard\/resumes\//.test(url.pathname),
  );
  await expect(page.getByTestId("document-title")).toHaveValue(/tailored/i);
  const tailoredResumeUrl = page.url();

  // --- The tailored copy must be discoverable again from the base resume,
  //     not just reachable via the redirect that created it ---
  await page.goto(baseResumeUrl);
  await expect(page.getByText("Tailored versions")).toBeVisible();
  const tailoredResumeLink = page.getByRole("link", { name: /tailored/i });
  await expect(tailoredResumeLink).toHaveAttribute(
    "href",
    new URL(tailoredResumeUrl).pathname,
  );

  // --- Generate a cover letter from the base resume (first one: becomes
  //     the base cover letter, since the test user has none yet) ---
  await page.goto("/dashboard/cover-letters");
  await page.getByText("Generate with AI").click();
  await page.getByLabel("Based on resume").selectOption({ label: "E2E Test Resume" });
  await page
    .getByPlaceholder("Paste the job description here…")
    .fill("Senior Backend Engineer at Acme Corp, scaling high-throughput APIs.");
  await page.getByRole("button", { name: "Generate cover letter" }).click();

  await page.waitForURL(/\/dashboard\/cover-letters\/[0-9a-f-]{36}$/);
  await expect(page.getByTestId("document-title")).toHaveValue(/Cover Letter/i);
  const baseCoverLetterUrl = page.url();

  // --- Generate a second cover letter for a different job: the user
  //     already has a base cover letter, so this one must be a tailored,
  //     non-counting variant linked back to it ---
  await page.goto("/dashboard/cover-letters");
  await page.getByText("Generate with AI").click();
  await page.getByLabel("Based on resume").selectOption({ label: "E2E Test Resume" });
  await page
    .getByPlaceholder("Paste the job description here…")
    .fill("Staff Backend Engineer at Globex, leading platform reliability.");
  await page.getByRole("button", { name: "Generate cover letter" }).click();

  await page.waitForURL(
    (url) =>
      url.pathname !== new URL(baseCoverLetterUrl).pathname &&
      /\/dashboard\/cover-letters\/[0-9a-f-]{36}$/.test(url.pathname),
  );

  // --- That second one must be discoverable from the base cover letter ---
  await page.goto(baseCoverLetterUrl);
  await expect(page.getByText("Tailored versions")).toBeVisible();
});

test("tailoring for a job listing auto-saves it and links the tailored resume", async ({
  page,
}) => {
  // 1 real Gemini call (tailor), same rate-limit headroom as the test above.
  test.setTimeout(240000);

  // A synthetic posting, inserted directly rather than via a real ingestion
  // run -- this test is about proving the job-detail-page -> tailor ->
  // applications bridge (lib/resumes/actions.ts's tailorResume extension),
  // not re-proving ingestion correctness (covered by job-ingestion.spec.ts).
  const { data: source } = await admin.from("job_sources").select("id").eq("name", "greenhouse").single();
  const { data: posting, error: postingError } = await admin
    .from("job_postings")
    .insert({
      source_id: source!.id,
      external_id: `e2e-tailor-bridge-${Date.now()}`,
      company: "Acme Corp",
      title: "Senior Backend Engineer",
      description: "Scale our high-throughput payments API and mentor junior engineers.",
      url: "https://example.com/e2e-tailor-bridge",
      category: "software",
      status: "active",
    })
    .select("id")
    .single();
  if (postingError) throw postingError;

  try {
    await page.goto("/login");
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/\/dashboard\/jobs$/);

    // --- A dedicated resume for this test, not the shared one from the
    //     test above -- avoids coupling to another test's setup ---
    await page.goto("/dashboard/resumes");
    await page.getByPlaceholder("e.g. Frontend Engineer").fill("E2E Job Bridge Resume");
    await page.getByRole("button", { name: "New Resume" }).click();
    await page.waitForURL(/\/dashboard\/resumes\/[0-9a-f-]{36}$/);
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("Built and scaled backend payment systems.");
    await expect(page.getByText("Saved", { exact: true })).toBeVisible({ timeout: 10000 });

    // --- Tailor straight from the job detail page -- no paste required,
    //     since this posting has a real description ---
    await page.goto(`/dashboard/jobs/${posting!.id}`);
    await page.getByLabel("Resume to tailor").selectOption({ label: "E2E Job Bridge Resume" });
    await page.getByRole("button", { name: "Tailor a resume for this job" }).click();

    await page.waitForURL(/\/dashboard\/resumes\/[0-9a-f-]{36}$/);
    await expect(page.getByTestId("document-title")).toHaveValue(/tailored/i);
    const tailoredResumeId = page.url().split("/").pop();

    // --- The bridge should have auto-saved the posting as an application
    //     and linked the freshly tailored resume to it ---
    await page.goto("/dashboard/applications");
    const summary = page.locator("summary").filter({ hasText: "Senior Backend Engineer" });
    await expect(summary).toBeVisible();
    await summary.click();
    const resumeSelect = page
      .locator("details")
      .filter({ hasText: "Senior Backend Engineer" })
      .getByLabel("Resume used");
    await expect(resumeSelect).toHaveValue(tailoredResumeId!);
  } finally {
    await admin.from("job_postings").delete().eq("id", posting!.id);
  }
});
