import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchAshbyJobs } from "./ashby";

// Trimmed from a real `api.ashbyhq.com/posting-api/job-board/linear`
// response captured 2026-07-25.
const FIXTURE = {
  jobs: [
    {
      id: "d3bc1ced-3ce4-4086-a050-555055dbb1ff",
      title: "Senior / Staff Fullstack Engineer",
      location: "Europe",
      isRemote: true,
      isListed: true,
      publishedAt: "2021-04-27T20:13:45.158+00:00",
      jobUrl: "https://jobs.ashbyhq.com/linear/d3bc1ced-3ce4-4086-a050-555055dbb1ff",
      descriptionPlain: "At Linear, we're building the product development system...",
    },
    {
      id: "unlisted-1",
      title: "Old Draft Role",
      location: "Remote",
      isRemote: true,
      isListed: false,
      publishedAt: null,
      jobUrl: "https://jobs.ashbyhq.com/linear/unlisted-1",
    },
    {
      // Real, observed shape (not hypothetical): 10/104 live Vanta postings
      // omitted isRemote entirely, which violated job_postings.remote's
      // NOT NULL constraint until this was coerced with `?? false`.
      id: "no-remote-field",
      title: "Channel Manager, DACH",
      location: "Germany",
      isListed: true,
      publishedAt: "2026-01-01T00:00:00.000Z",
      jobUrl: "https://jobs.ashbyhq.com/vanta/no-remote-field",
    },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchAshbyJobs", () => {
  it("normalizes listed jobs and filters out unlisted ones", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => FIXTURE }),
    );

    const jobs = await fetchAshbyJobs("linear", "Linear");

    expect(jobs.find((j) => j.externalId === "unlisted-1")).toBeUndefined();
    expect(jobs.find((j) => j.externalId === "d3bc1ced-3ce4-4086-a050-555055dbb1ff")).toEqual({
      externalId: "d3bc1ced-3ce4-4086-a050-555055dbb1ff",
      company: "Linear",
      title: "Senior / Staff Fullstack Engineer",
      location: "Europe",
      remote: true,
      description: "At Linear, we're building the product development system...",
      url: "https://jobs.ashbyhq.com/linear/d3bc1ced-3ce4-4086-a050-555055dbb1ff",
      postedAt: "2021-04-27T20:13:45.158+00:00",
      departmentHint: null,
    });
  });

  it("defaults remote to false when Ashby omits isRemote", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => FIXTURE }),
    );

    const jobs = await fetchAshbyJobs("vanta", "Vanta");
    const job = jobs.find((j) => j.externalId === "no-remote-field");

    expect(job?.remote).toBe(false);
  });
});
