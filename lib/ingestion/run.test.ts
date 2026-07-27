import { describe, expect, it } from "vitest";
import { determineClosedExternalIds } from "./run";

describe("determineClosedExternalIds", () => {
  it("closes postings that were active but weren't fetched this run", () => {
    expect(determineClosedExternalIds(["a", "b", "c"], ["a", "c"])).toEqual(["b"]);
  });

  it("closes nothing when every previously-active posting was fetched again", () => {
    expect(determineClosedExternalIds(["a", "b"], ["a", "b"])).toEqual([]);
  });

  it("closes everything when a company has zero postings this run", () => {
    expect(determineClosedExternalIds(["a", "b"], [])).toEqual(["a", "b"]);
  });

  it("closes nothing for a company with no previously-active postings", () => {
    expect(determineClosedExternalIds([], ["a", "b"])).toEqual([]);
  });
});
