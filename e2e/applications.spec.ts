import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { runIngestion } from "../lib/ingestion/run";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

// Same real, small source as job-ingestion.spec.ts/match-scoring.spec.ts
// (Ashby/Linear) -- used here only as a vehicle to make a *fake* posting
// disappear on a real ingestion run, not to test ingestion itself.
const TEST_COMPANY = [{ source: "ashby" as const, token: "linear", companyName: "Linear" }];

test("saving a job, tracking its status, and losing it when the posting closes", async ({ page }) => {
  // One real ingestion run (to trigger the fake posting's closure) plus
  // normal UI navigation -- no Gemini calls in this flow.
  test.setTimeout(180000);

  const email = `e2e-applications-${Date.now()}@example.com`;
  const password = "e2e-Test-Password-123!";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  const userId = data.user.id;

  const { data: source } = await admin.from("job_sources").select("id").eq("name", "ashby").single();
  const fakeExternalId = `e2e-applications-test-${Date.now()}`;
  const { data: posting } = await admin
    .from("job_postings")
    .insert({
      source_id: source!.id,
      external_id: fakeExternalId,
      company: "Linear",
      title: "E2E Applications Test Posting",
      url: "https://example.com/applications-test",
      status: "active",
    })
    .select("id")
    .single();

  const { data: resume } = await admin
    .from("resumes")
    .insert({ user_id: userId, title: "E2E Applications Test Resume", is_base: true })
    .select("id")
    .single();

  try {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/\/dashboard$/);

    // --- Save the posting from job search ---
    await page.goto("/dashboard/jobs?q=E2E+Applications+Test+Posting");
    await expect(page.getByText("E2E Applications Test Posting")).toBeVisible();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();

    // --- It shows up on the applications board as "saved" ---
    await page.goto("/dashboard/applications");
    const summary = page.locator("summary").filter({ hasText: "E2E Applications Test Posting" });
    await expect(summary).toBeVisible();
    await expect(summary).toContainText("saved");

    // --- Update status to applied and link the resume used ---
    await summary.click();
    await page.getByLabel("Status").selectOption("applied");
    await page.getByLabel("Resume used").selectOption({ label: "E2E Applications Test Resume" });
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(1000);

    await page.goto("/dashboard/applications");
    const updatedSummary = page.locator("summary").filter({ hasText: "E2E Applications Test Posting" });
    await expect(updatedSummary).toContainText("applied");

    // --- Close the posting via a real ingestion run (the fake external_id
    //     won't come back from a real Linear fetch) and confirm it moves
    //     out of the active board, into "Closed postings", with a
    //     notification created ---
    await runIngestion(TEST_COMPANY);

    await page.goto("/dashboard/applications");
    await expect(page.getByRole("heading", { name: "Closed postings" })).toBeVisible();
    const closedSummary = page.locator("summary").filter({ hasText: "E2E Applications Test Posting" });
    await expect(closedSummary).toContainText("Posting closed");

    const { data: notifications } = await admin
      .from("notifications")
      .select("message, read")
      .eq("user_id", userId);
    expect(notifications).toHaveLength(1);
    expect(notifications![0].message).toContain("E2E Applications Test Posting");
    expect(notifications![0].read).toBe(false);

    await page.reload();
    await page.getByText("Notifications (1)").click();
    await page.getByRole("button", { name: "Dismiss" }).click();
    await page.waitForTimeout(1000);
    await page.reload();
    await expect(page.getByText("Notifications (1)")).not.toBeVisible();
  } finally {
    await admin.from("job_postings").delete().eq("id", posting!.id);
    await admin.from("resumes").delete().eq("id", resume!.id);
    await admin.auth.admin.deleteUser(userId);
  }
});
