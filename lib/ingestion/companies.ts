import type { JobSourceName } from "./types";

export interface CompanyConfig {
  source: JobSourceName;
  token: string;
  companyName: string;
}

// Seed list for Phase 3. There's no discovery API for any of these ATSs --
// you have to know a company's board token up front -- so this starts as a
// small, hand-verified list rather than an open crawl. Every token below
// was confirmed live (2026-07-25) via a direct curl against the source's
// public API before being added; don't add one without checking it first,
// a typo'd token just silently returns zero postings instead of erroring.
export const SEED_COMPANIES: CompanyConfig[] = [
  { source: "greenhouse", token: "airbnb", companyName: "Airbnb" },
  { source: "greenhouse", token: "stripe", companyName: "Stripe" },
  { source: "ashby", token: "linear", companyName: "Linear" },
  { source: "ashby", token: "vanta", companyName: "Vanta" },
  { source: "ashby", token: "ramp", companyName: "Ramp" },
  { source: "lever", token: "plaid", companyName: "Plaid" },
  { source: "workable", token: "typeform", companyName: "Typeform" },
];
