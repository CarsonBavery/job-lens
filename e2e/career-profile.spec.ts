import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

test("career profile: GitHub project summarization, editing, and tailoring integration", async ({
  page,
}) => {
  // 2 real Gemini calls (project summarization + resume tailoring), plus a
  // real GitHub API round-trip -- same rate-limit-retry headroom as the
  // other AI-feature tests.
  test.setTimeout(300000);

  const email = `e2e-profile-${Date.now()}@example.com`;
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
    await page.waitForURL(/\/dashboard$/);

    await page.goto("/dashboard/profile");

    // --- Add a project via a real GitHub URL: README gets summarized once
    //     by Gemini into an editable description ---
    await page.getByPlaceholder("Project title").fill("Hello World Demo");
    await page
      .getByPlaceholder("GitHub repo URL (optional) — Gemini will summarize it")
      .fill("https://github.com/octocat/Hello-World");
    await page.getByRole("button", { name: "Add project" }).click();

    // No explicit timeout: inherits navigationTimeout/actionTimeout from
    // playwright.config.ts, which already accounts for a real Gemini retry
    // wait. Scoped to the <summary> specifically -- a plain getByText also
    // matches the generated description text once the AI summary renders
    // inside the same <details>, a strict-mode violation.
    const helloWorldSummary = page.locator("summary").filter({ hasText: "Hello World Demo" });
    await expect(helloWorldSummary).toBeVisible({ timeout: 180000 });

    // Expand it and confirm a non-empty, Gemini-generated description is
    // there -- exact wording isn't asserted (that's the model's output),
    // just that summarization actually produced something.
    await helloWorldSummary.click();
    const descriptionField = page.locator('textarea[name="description"]').first();
    await expect(descriptionField).not.toHaveValue("");

    // --- Confirm it's editable ---
    await descriptionField.fill("Manually edited description for the demo repo.");
    await descriptionField.locator("..").getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(1000);
    // The saved value now appears both in the display <p> and as the
    // (revalidated) textarea's content -- scope to the paragraph specifically.
    await expect(
      page.locator("p").filter({ hasText: "Manually edited description for the demo repo." }),
    ).toBeVisible();

    // --- Add a manual project with a distinctive, unambiguous skill set,
    //     specifically so a later tailoring pass has a strong, checkable
    //     signal to pull from ---
    await page.getByPlaceholder("Project title").fill("Quantum Widget Scheduler");
    await page
      .getByPlaceholder("Tech stack (if no GitHub URL)")
      .fill("Rust, gRPC");
    await page
      .getByPlaceholder("Description (if no GitHub URL)")
      .fill(
        "Built a distributed job scheduler for quantum widget manufacturing lines, handling real-time constraint satisfaction across 200+ machines.",
      );
    await page.getByRole("button", { name: "Add project" }).click();
    await expect(
      page.locator("summary").filter({ hasText: "Quantum Widget Scheduler" }),
    ).toBeVisible();

    // --- Tailor a resume that never mentions this project against a job
    //     description tightly matched to it, and confirm the profile data
    //     actually influenced the output rather than sitting unused ---
    await page.goto("/dashboard/resumes");
    await page.getByPlaceholder("e.g. Frontend Engineer").fill("E2E Profile Test Resume");
    await page.getByRole("button", { name: "New Resume" }).click();
    await page.waitForURL(/\/dashboard\/resumes\/[0-9a-f-]{36}$/);
    const baseResumeUrl = page.url();

    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("Software engineer with general experience in web development.");
    await expect(page.getByText("Saved", { exact: true })).toBeVisible({ timeout: 10000 });

    await page.getByText("Tailor for a job (AI)").click();
    await page
      .getByPlaceholder("Paste the job description here…")
      .fill(
        "Seeking an engineer experienced in distributed job scheduling systems for quantum widget manufacturing, with Rust and gRPC, handling real-time constraint satisfaction across many machines.",
      );
    await page.getByRole("button", { name: "Generate tailored resume" }).click();

    await page.waitForURL(
      (url) =>
        url.pathname !== new URL(baseResumeUrl).pathname &&
        /\/dashboard\/resumes\/[0-9a-f-]{36}$/.test(url.pathname),
      { timeout: 180000 },
    );

    const tailoredText = await page.locator(".tiptap").innerText();
    expect(tailoredText).toMatch(/quantum|rust|scheduler|grpc/i);
  } finally {
    await admin.auth.admin.deleteUser(data.user.id);
  }
});

test("career profile: delete requires confirmation and cancel leaves the entry intact", async ({
  page,
}) => {
  const email = `e2e-delete-confirm-${Date.now()}@example.com`;
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
    await page.waitForURL(/\/dashboard$/);

    await page.goto("/dashboard/profile");
    await page.getByPlaceholder("Institution").fill("E2E Delete Confirm University");
    await page.getByRole("button", { name: "Add education" }).click();

    const entrySummary = page
      .locator("summary")
      .filter({ hasText: "E2E Delete Confirm University" });
    await expect(entrySummary).toBeVisible();
    await entrySummary.click();

    // Cancel: the confirmation dialog opens, but declining it must not
    // submit the delete Server Action -- the entry stays.
    await page.getByRole("button", { name: "Delete" }).first().click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).not.toBeVisible();
    await expect(entrySummary).toBeVisible();

    // Confirm: the same trigger, but accepting the dialog this time
    // actually submits the delete.
    await page.getByRole("button", { name: "Delete" }).first().click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
    await expect(entrySummary).not.toBeVisible();
  } finally {
    await admin.auth.admin.deleteUser(data.user.id);
  }
});
