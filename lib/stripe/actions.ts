"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "./client";
import { getStripeCustomerId, setStripeCustomerId } from "./db";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

// Reuses an existing Stripe customer if this user already has one (e.g.
// from a previous, canceled subscription) rather than creating a new one
// on every checkout attempt.
async function getOrCreateCustomerId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string,
): Promise<string> {
  const existing = await getStripeCustomerId(supabase, userId);
  if (existing) return existing;

  const customer = await getStripeClient().customers.create({
    email,
    metadata: { user_id: userId },
  });
  await setStripeCustomerId(supabase, userId, customer.id);
  return customer.id;
}

export async function createCheckoutSession(): Promise<void> {
  const { supabase, user } = await requireUser();
  const customerId = await getOrCreateCustomerId(supabase, user.id, user.email!);

  const session = await getStripeClient().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    // Redundant with subscription_data.metadata below, but this is what's
    // present on the checkout.session.completed event itself -- the
    // subscription's own metadata only carries through to *later*
    // lifecycle events (updated/deleted), not the initial checkout event.
    client_reference_id: user.id,
    subscription_data: { metadata: { user_id: user.id } },
    line_items: [{ price: process.env.STRIPE_PRICE_ID_PRO_MONTHLY!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?checkout=canceled`,
  });

  redirect(session.url!);
}

export async function createPortalSession(): Promise<void> {
  const { supabase, user } = await requireUser();
  const customerId = await getStripeCustomerId(supabase, user.id);
  if (!customerId) redirect("/dashboard/billing");

  const session = await getStripeClient().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`,
  });

  redirect(session.url);
}
