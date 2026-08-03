import { describe, expect, it } from "vitest";
import { extractSalaryRange } from "./extractSalary";

describe("extractSalaryRange", () => {
  it("extracts a comma-formatted dollar range", () => {
    expect(extractSalaryRange("We offer $120,000 - $150,000 per year.")).toEqual({
      min: 120000,
      max: 150000,
    });
  });

  it("handles an en dash separator and no second $ sign", () => {
    expect(extractSalaryRange("Base pay: $120,000–150,000")).toEqual({
      min: 120000,
      max: 150000,
    });
  });

  it("handles a 'to' separator", () => {
    expect(extractSalaryRange("Salary $120,000 to $150,000")).toEqual({
      min: 120000,
      max: 150000,
    });
  });

  it("handles k-notation", () => {
    expect(extractSalaryRange("Compensation: $120k - $150K")).toEqual({
      min: 120000,
      max: 150000,
    });
  });

  it("sorts a reversed range", () => {
    expect(extractSalaryRange("$150,000 - $120,000")).toEqual({ min: 120000, max: 150000 });
  });

  it("returns null when there's no dollar range at all", () => {
    expect(extractSalaryRange("Join our growing team of engineers.")).toBeNull();
  });

  it("returns null for a single dollar figure with no range", () => {
    expect(extractSalaryRange("We raised $5,000,000 in funding.")).toBeNull();
  });

  it("returns null for implausibly low figures (not a salary)", () => {
    expect(extractSalaryRange("Coffee budget: $5 - $10 per week.")).toBeNull();
  });

  it("returns null for implausibly high figures (not a salary)", () => {
    expect(extractSalaryRange("$5,000,000 - $6,000,000 in Series B funding.")).toBeNull();
  });

  it("returns null for a degenerate zero-width range", () => {
    expect(extractSalaryRange("$120,000 - $120,000")).toBeNull();
  });

  it("returns null for null/undefined/empty input", () => {
    expect(extractSalaryRange(null)).toBeNull();
    expect(extractSalaryRange(undefined)).toBeNull();
    expect(extractSalaryRange("")).toBeNull();
  });
});
