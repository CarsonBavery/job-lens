import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";

const execFileAsync = promisify(execFile);

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

// Resolves the Stripe CLI binary. On this dev machine, winget installs it
// without immediately updating PATH for already-running shells (its own
// install output says "restart your shell to use the new value") -- fall
// back to the known install location rather than requiring that restart.
// A normal environment (a fresh terminal, or CI with the CLI properly on
// PATH) just uses "stripe" directly via STRIPE_CLI_PATH or the final
// fallback below.
function resolveStripeCli(): string {
  if (process.env.STRIPE_CLI_PATH) return process.env.STRIPE_CLI_PATH;
  const wingetFallback =
    "C:\\Users\\ctrac\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Stripe.StripeCli_Microsoft.Winget.Source_8wekyb3d8bbwe\\stripe.exe";
  if (existsSync(wingetFallback)) return wingetFallback;
  return "stripe";
}

async function pollUntil<T>(fn: () => Promise<T>, predicate: (v: T) => boolean, timeoutMs = 30000): Promise<T> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const value = await fn();
    if (predicate(value)) return value;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("pollUntil timed out");
}

test("Stripe webhook syncs subscription lifecycle to profiles/subscriptions", async () => {
  // Real network round-trips to Stripe's API for each trigger, plus
  // webhook forwarding latency -- generous but not open-ended.
  test.setTimeout(120000);

  const stripeCli = resolveStripeCli();
  const email = `e2e-billing-${Date.now()}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "e2e-Test-Password-123!",
    email_confirm: true,
  });
  if (error) throw error;
  const userId = data.user.id;

  const listener = spawn(
    stripeCli,
    ["listen", "--forward-to", "localhost:3000/api/webhooks/stripe", "--api-key", process.env.STRIPE_SECRET_KEY!],
    { stdio: ["ignore", "pipe", "pipe"] },
  );

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("stripe listen didn't become ready in time")), 20000);
      const onData = (chunk: Buffer) => {
        if (chunk.toString().includes("Ready!")) {
          clearTimeout(timeout);
          listener.stdout?.off("data", onData);
          resolve();
        }
      };
      listener.stdout?.on("data", onData);
      listener.stderr?.on("data", onData);
    });

    // --- A subscription becoming active upgrades the user to pro ---
    await execFileAsync(stripeCli, [
      "trigger",
      "customer.subscription.created",
      "--override",
      `subscription:metadata[user_id]=${userId}`,
      "--api-key",
      process.env.STRIPE_SECRET_KEY!,
    ]);

    const proProfile = await pollUntil(
      async () => {
        const { data } = await admin
          .from("profiles")
          .select("subscription_tier, stripe_customer_id")
          .eq("id", userId)
          .single();
        return data;
      },
      (p) => p?.subscription_tier === "pro",
    );
    expect(proProfile?.subscription_tier).toBe("pro");
    expect(proProfile?.stripe_customer_id).toBeTruthy();

    const { data: subscription } = await admin
      .from("subscriptions")
      .select("status, current_period_end, price_id")
      .eq("user_id", userId)
      .single();
    expect(subscription?.status).toBe("active");
    expect(subscription?.current_period_end).toBeTruthy();
    expect(subscription?.price_id).toBeTruthy();

    // --- Cancellation downgrades the user back to free ---
    await execFileAsync(stripeCli, [
      "trigger",
      "customer.subscription.deleted",
      "--override",
      `subscription:metadata[user_id]=${userId}`,
      "--api-key",
      process.env.STRIPE_SECRET_KEY!,
    ]);

    const freeProfile = await pollUntil(
      async () => {
        const { data } = await admin
          .from("profiles")
          .select("subscription_tier")
          .eq("id", userId)
          .single();
        return data;
      },
      (p) => p?.subscription_tier === "free",
    );
    expect(freeProfile?.subscription_tier).toBe("free");
  } finally {
    listener.kill();
    await admin.auth.admin.deleteUser(userId);
  }
});
