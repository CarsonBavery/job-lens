import { describe, expect, it } from "vitest";
import { buildDedupKey } from "./normalize";

describe("buildDedupKey", () => {
  it("normalizes case, whitespace, and punctuation", () => {
    const a = buildDedupKey({
      company: "Acme, Inc.",
      title: "Senior  Engineer!",
      location: "Remote (US)",
    });
    const b = buildDedupKey({
      company: "acme inc",
      title: "senior engineer",
      location: "remote us",
    });
    expect(a).toBe(b);
  });

  it("distinguishes different jobs", () => {
    const a = buildDedupKey({ company: "Acme", title: "Engineer" });
    const b = buildDedupKey({ company: "Acme", title: "Designer" });
    expect(a).not.toBe(b);
  });

  it("treats a missing location as empty", () => {
    const a = buildDedupKey({ company: "Acme", title: "Engineer" });
    const b = buildDedupKey({ company: "Acme", title: "Engineer", location: null });
    expect(a).toBe(b);
  });
});
