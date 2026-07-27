import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import { customerIdOf, currentPeriodEndOf } from "./webhookHelpers";

describe("customerIdOf", () => {
  it("returns the string as-is when customer is already an id", () => {
    expect(customerIdOf("cus_123")).toBe("cus_123");
  });

  it("extracts the id from an expanded customer object", () => {
    expect(customerIdOf({ id: "cus_456" } as Stripe.Customer)).toBe("cus_456");
  });
});

describe("currentPeriodEndOf", () => {
  it("reads current_period_end from the first subscription item, not the subscription itself", () => {
    const subscription = {
      items: { data: [{ current_period_end: 1735689600 }] },
    } as Stripe.Subscription;
    expect(currentPeriodEndOf(subscription)).toBe(new Date(1735689600 * 1000).toISOString());
  });

  it("returns null when there are no subscription items", () => {
    const subscription = { items: { data: [] } } as unknown as Stripe.Subscription;
    expect(currentPeriodEndOf(subscription)).toBeNull();
  });
});
