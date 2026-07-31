import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchGreenhouseJobs } from "./greenhouse";

// Trimmed from a real `boards-api.greenhouse.io/v1/boards/airbnb/jobs?content=true`
// response captured 2026-07-25. The content field is HTML-*encoded* (literal
// "&lt;div&gt;"), which is the specific thing this test guards against.
const FIXTURE = {
  jobs: [
    {
      id: 7995153,
      title: "Acquisition Manager",
      absolute_url: "https://careers.airbnb.com/positions/7995153?gh_jid=7995153",
      updated_at: "2026-06-10T08:50:56-04:00",
      first_published: "2026-06-10T08:50:56-04:00",
      location: { name: "Berlin, Germany " },
      content: "&lt;div&gt;&lt;p&gt;Join our team&lt;/p&gt;&lt;/div&gt;",
      metadata: [{ id: 1, name: "Workplace Type", value: "Hybrid" }],
      // Real shape confirmed live 2026-07-30 against a production board --
      // not documented on Greenhouse's job-board.html page.
      departments: [{ id: 380786, name: "Sales" }],
    },
    {
      id: 123,
      title: "Remote Engineer",
      absolute_url: "https://careers.airbnb.com/positions/123",
      updated_at: "2026-06-01T00:00:00-04:00",
      first_published: null,
      location: { name: "Remote - US" },
      metadata: [],
    },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchGreenhouseJobs", () => {
  it("normalizes fields and decodes HTML-encoded content before stripping tags", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => FIXTURE }),
    );

    const jobs = await fetchGreenhouseJobs("airbnb", "Airbnb");

    expect(jobs[0]).toEqual({
      externalId: "7995153",
      company: "Airbnb",
      title: "Acquisition Manager",
      location: "Berlin, Germany",
      remote: false,
      description: "Join our team",
      url: "https://careers.airbnb.com/positions/7995153?gh_jid=7995153",
      postedAt: "2026-06-10T08:50:56-04:00",
      departmentHint: "Sales",
    });
  });

  it("detects remote from location name when metadata doesn't say so", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => FIXTURE }),
    );

    const jobs = await fetchGreenhouseJobs("airbnb", "Airbnb");
    expect(jobs[1].remote).toBe(true);
    expect(jobs[1].description).toBeNull();
    expect(jobs[1].departmentHint).toBeNull();
  });

  it("throws with a descriptive message on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(fetchGreenhouseJobs("nonexistent", "Nonexistent")).rejects.toThrow("404");
  });
});
