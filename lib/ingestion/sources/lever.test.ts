import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchLeverJobs } from "./lever";

const FIXTURE = [
  {
    id: "abc-123",
    text: "Staff Backend Engineer",
    categories: { location: "San Francisco", team: "Engineering" },
    workplaceType: "remote",
    hostedUrl: "https://jobs.lever.co/acme/abc-123",
    createdAt: 1750000000000,
    descriptionPlain: "Build our platform.",
  },
  {
    id: "def-456",
    text: "Product Designer",
    categories: { location: "Remote - EMEA" },
    hostedUrl: "https://jobs.lever.co/acme/def-456",
    createdAt: 1750000000000,
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchLeverJobs", () => {
  it("normalizes fields, using workplaceType for remote detection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => FIXTURE }),
    );

    const jobs = await fetchLeverJobs("acme", "Acme");

    expect(jobs[0]).toEqual({
      externalId: "abc-123",
      company: "Acme",
      title: "Staff Backend Engineer",
      location: "San Francisco",
      remote: true,
      description: "Build our platform.",
      url: "https://jobs.lever.co/acme/abc-123",
      postedAt: new Date(1750000000000).toISOString(),
    });
  });

  it("falls back to detecting remote from the location string when workplaceType is absent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => FIXTURE }),
    );

    const jobs = await fetchLeverJobs("acme", "Acme");
    expect(jobs[1].remote).toBe(true);
    expect(jobs[1].description).toBeNull();
  });

  it("throws a descriptive error for an unknown company slug", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: false, error: "Document not found" }),
      }),
    );

    await expect(fetchLeverJobs("nonexistent", "Nonexistent")).rejects.toThrow(
      "Document not found",
    );
  });
});
