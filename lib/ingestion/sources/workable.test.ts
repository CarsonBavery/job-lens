import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchWorkableJobs } from "./workable";

const FIXTURE = {
  name: "Acme",
  jobs: [
    {
      id: "job-1",
      title: "Support Engineer",
      url: "https://apply.workable.com/acme/j/job-1",
      shortlink: "https://acme.workable.com/j/job-1",
      telecommute: true,
      city: "Austin",
      state: "TX",
      country: "United States",
      created_at: "2026-06-01T00:00:00.000Z",
    },
    {
      id: "job-2",
      title: "Office Manager",
      url: "https://apply.workable.com/acme/j/job-2",
      telecommute: false,
      country: "United Kingdom",
    },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchWorkableJobs", () => {
  it("normalizes fields, preferring shortlink over url, joining location parts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => FIXTURE }),
    );

    const jobs = await fetchWorkableJobs("acme", "Acme");

    expect(jobs[0]).toEqual({
      externalId: "job-1",
      company: "Acme",
      title: "Support Engineer",
      location: "Austin, TX, United States",
      remote: true,
      description: null,
      url: "https://acme.workable.com/j/job-1",
      postedAt: "2026-06-01T00:00:00.000Z",
      departmentHint: null,
    });
  });

  it("falls back to url when shortlink is absent, and handles a partial location", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => FIXTURE }),
    );

    const jobs = await fetchWorkableJobs("acme", "Acme");
    expect(jobs[1].url).toBe("https://apply.workable.com/acme/j/job-2");
    expect(jobs[1].location).toBe("United Kingdom");
    expect(jobs[1].remote).toBe(false);
  });
});
