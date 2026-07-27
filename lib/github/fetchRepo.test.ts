import { describe, expect, it } from "vitest";
import { parseGithubUrl } from "./fetchRepo";

describe("parseGithubUrl", () => {
  it("parses a plain repo URL", () => {
    expect(parseGithubUrl("https://github.com/vercel/next.js")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("parses a URL without a protocol", () => {
    expect(parseGithubUrl("github.com/vercel/next.js")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("strips a trailing .git", () => {
    expect(parseGithubUrl("https://github.com/vercel/next.js.git")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("strips extra path segments like /tree/main", () => {
    expect(parseGithubUrl("https://github.com/vercel/next.js/tree/main")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("returns null for a non-GitHub URL", () => {
    expect(parseGithubUrl("https://gitlab.com/vercel/next.js")).toBeNull();
  });

  it("returns null for a bare github.com with no repo path", () => {
    expect(parseGithubUrl("https://github.com")).toBeNull();
  });
});
