import type Stripe from "stripe";

export function customerIdOf(customer: string | Stripe.Customer | Stripe.DeletedCustomer): string {
  return typeof customer === "string" ? customer : customer.id;
}

// current_period_end lives on each subscription item, not the top-level
// Subscription object, in this API version -- confirmed against the
// installed Stripe SDK's own type definitions, not assumed.
export function currentPeriodEndOf(subscription: Stripe.Subscription): string | null {
  const item = subscription.items.data[0];
  return item ? new Date(item.current_period_end * 1000).toISOString() : null;
}
