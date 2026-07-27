import { describe, expect, it } from "vitest";
import { hashText } from "./hash";

describe("hashText", () => {
  it("is deterministic for the same text", () => {
    expect(hashText("Senior Engineer with 5 years of experience")).toBe(
      hashText("Senior Engineer with 5 years of experience"),
    );
  });

  it("differs when the text changes", () => {
    expect(hashText("Senior Engineer")).not.toBe(hashText("Staff Engineer"));
  });
});
