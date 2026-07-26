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

    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toEqual({
      externalId: "d3bc1ced-3ce4-4086-a050-555055dbb1ff",
      company: "Linear",
      title: "Senior / Staff Fullstack Engineer",
      location: "Europe",
      remote: true,
      description: "At Linear, we're building the product development system...",
      url: "https://jobs.ashbyhq.com/linear/d3bc1ced-3ce4-4086-a050-555055dbb1ff",
      postedAt: "2021-04-27T20:13:45.158+00:00",
    });
  });
});
