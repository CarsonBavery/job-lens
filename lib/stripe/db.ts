import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function getStripeCustomerId(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data.stripe_customer_id;
}

export async function setStripeCustomerId(
  supabase: SupabaseClient<Database>,
  userId: string,
  customerId: string,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("id", userId);
  if (error) throw error;
}

export async function findUserIdByStripeCustomerId(
  supabase: SupabaseClient<Database>,
  customerId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

// A status mapping, not a one-way "cancellation sets it to free" flag --
// covers resubscribing, failed-payment recovery, etc. the same way a fresh
// checkout would. Every other status (canceled, incomplete_expired,
// unpaid, ...) resolves to free.
export function tierForSubscriptionStatus(status: string): "free" | "pro" {
  return status === "active" || status === "trialing" ? "pro" : "free";
}

export async function upsertSubscription(
  supabase: SupabaseClient<Database>,
  params: {
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    priceId: string | null;
    status: string;
    currentPeriodEnd: string | null;
  },
): Promise<void> {
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: params.userId,
      stripe_customer_id: params.stripeCustomerId,
      stripe_subscription_id: params.stripeSubscriptionId,
      price_id: params.priceId,
      status: params.status,
      current_period_end: params.currentPeriodEnd,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;

  // Backfills stripe_customer_id here too, not just in
  // lib/stripe/actions.ts's checkout flow -- a subscription can start
  // existing for a user without ever going through our own checkout (e.g.
  // created directly in the Stripe dashboard, or -- as found while manually
  // verifying this webhook against a real customer.subscription.created
  // event -- any event whose customer wasn't already linked). Without this,
  // createPortalSession silently has no customer id to open a portal for.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      subscription_tier: tierForSubscriptionStatus(params.status),
      stripe_customer_id: params.stripeCustomerId,
    })
    .eq("id", params.userId);
  if (profileError) throw profileError;
}
