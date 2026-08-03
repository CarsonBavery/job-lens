import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

// Postings inserted directly via the admin client, not through a real
// ingestion run -- these tests are about the search page's pagination and
// salary display, not the ingestion pipeline (already covered by
// job-ingestion.spec.ts and lib/ingestion/extractSalary.test.ts).
test("pagination shows a Next/Previous control once results exceed one page", async ({
  page,
}) => {
  const { data: source } = await admin.from("job_sources").select("id").eq("name", "greenhouse").single();
  const marker = `ZzzPaginationTest${Date.now()}`;
  const rows = Array.from({ length: 26 }, (_, i) => ({
    source_id: source!.id,
    external_id: `${marker}-${i}`,
    company: "Pagination Test Co",
    title: `${marker} Engineer ${i}`,
    url: `https://example.com/${marker}-${i}`,
    category: "software" as const,
    status: "active" as const,
    posted_at: new Date(Date.now() - i * 1000).toISOString(),
  }));

  const { error: insertError } = await admin.from("job_postings").insert(rows);
  if (insertError) throw insertError;

  const email = `e2e-pagination-${Date.now()}@example.com`;
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

    await page.goto(`/dashboard/jobs?q=${marker}`);
    const results = page.getByTestId("job-results");
    await expect(results.getByRole("link")).toHaveCount(25);
    await expect(page.getByRole("link", { name: "Next →" })).toBeVisible();
    await expect(page.getByRole("link", { name: "← Previous" })).not.toBeVisible();

    await page.getByRole("link", { name: "Next →" }).click();
    await expect(results.getByRole("link")).toHaveCount(1);
    await expect(page.getByRole("link", { name: "← Previous" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Next →" })).not.toBeVisible();

    await page.getByRole("link", { name: "← Previous" }).click();
    await expect(results.getByRole("link")).toHaveCount(25);
  } finally {
    await admin.auth.admin.deleteUser(data.user.id);
    await admin
      .from("job_postings")
      .delete()
      .in(
        "external_id",
        rows.map((r) => r.external_id),
      );
  }
});

test("a posting's salary range displays on the detail page", async ({ page }) => {
  const { data: source } = await admin.from("job_sources").select("id").eq("name", "greenhouse").single();
  const { data: posting, error: postingError } = await admin
    .from("job_postings")
    .insert({
      source_id: source!.id,
      external_id: `e2e-salary-display-${Date.now()}`,
      company: "Salary Test Co",
      title: "Senior Salary Display Test Engineer",
      url: "https://example.com/e2e-salary-display",
      category: "software",
      status: "active",
      salary_min: 120000,
      salary_max: 150000,
    })
    .select("id")
    .single();
  if (postingError) throw postingError;

  const email = `e2e-salary-${Date.now()}@example.com`;
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

    await page.goto(`/dashboard/jobs/${posting!.id}`);
    await expect(page.getByText("$120k–$150k")).toBeVisible();
  } finally {
    await admin.auth.admin.deleteUser(data.user.id);
    await admin.from("job_postings").delete().eq("id", posting!.id);
  }
});
