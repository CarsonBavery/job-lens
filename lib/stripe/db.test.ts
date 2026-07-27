import { describe, expect, it } from "vitest";
import { tierForSubscriptionStatus } from "./db";

describe("tierForSubscriptionStatus", () => {
  it("treats active and trialing as pro", () => {
    expect(tierForSubscriptionStatus("active")).toBe("pro");
    expect(tierForSubscriptionStatus("trialing")).toBe("pro");
  });

  it("treats canceled, past_due, incomplete_expired, and unpaid as free", () => {
    expect(tierForSubscriptionStatus("canceled")).toBe("free");
    expect(tierForSubscriptionStatus("past_due")).toBe("free");
    expect(tierForSubscriptionStatus("incomplete_expired")).toBe("free");
    expect(tierForSubscriptionStatus("unpaid")).toBe("free");
  });
});
