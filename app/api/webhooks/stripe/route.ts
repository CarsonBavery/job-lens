import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { findUserIdByStripeCustomerId, upsertSubscription } from "@/lib/stripe/db";
import { customerIdOf, currentPeriodEndOf } from "@/lib/stripe/webhookHelpers";

// Uses the service-role client throughout -- Stripe calls this endpoint
// directly with no Supabase session, so the normal cookie-based client
// (whose profiles/subscriptions RLS policies require auth.uid()) can't
// write anything here.

async function syncSubscription(subscription: Stripe.Subscription, fallbackUserId?: string) {
  const supabase = createServiceRoleClient();
  const customerId = customerIdOf(subscription.customer);

  const userId =
    subscription.metadata.user_id || fallbackUserId || (await findUserIdByStripeCustomerId(supabase, customerId));
  if (!userId) {
    // Expected for `stripe trigger customer.subscription.*` fixtures not
    // tied to any real user (they don't carry our metadata and use a
    // fresh, unassociated test customer) -- not an error worth retrying.
    console.warn(`Stripe webhook: no matching user for customer ${customerId}, skipping`);
    return;
  }

  await upsertSubscription(supabase, {
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    priceId: subscription.items.data[0]?.price.id ?? null,
    status: subscription.status,
    currentPeriodEnd: currentPeriodEndOf(subscription),
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode !== "subscription" || !session.subscription) break;

      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId);

      // Only the checkout.session.completed event carries
      // client_reference_id -- stamp it onto the subscription's own
      // metadata so every later lifecycle event for it (updated, deleted)
      // can map back to our user without needing this session again.
      if (!subscription.metadata.user_id && session.client_reference_id) {
        await getStripeClient().subscriptions.update(subscriptionId, {
          metadata: { user_id: session.client_reference_id },
        });
        subscription.metadata.user_id = session.client_reference_id;
      }

      await syncSubscription(subscription, session.client_reference_id ?? undefined);
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncSubscription(event.data.object);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
