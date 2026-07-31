import type { JobSourceName } from "./types";

export interface CompanyConfig {
  source: JobSourceName;
  token: string;
  companyName: string;
}

// Seed list for Phase 3, expanded 2026-07-30 for the STEM-job-board pivot
// (see CLAUDE.md) to give the new category filters real breadth instead of
// being dominated by `software`. There's no discovery API for any of these
// ATSs -- you have to know a company's board token up front -- so this
// stays a small, hand-verified list rather than an open crawl. Every token
// below was confirmed live via a direct curl against the source's public
// API before being added (dates noted per batch); don't add one without
// checking it first, a typo'd token just silently returns zero postings
// instead of erroring. Several plausible candidates were tried and
// rejected during the 2026-07-30 expansion (404s, not silently trusted):
// Greenhouse doordash/snowflakecomputing/tempuslabs/colorgenomics/anduril,
// Ashby figma(moved to Greenhouse instead)/huggingface/zipline/bostondynamics,
// Lever attentive/netlify/hims -- Lever in particular came up empty across
// every candidate tried, so this batch added nothing on that source.
export const SEED_COMPANIES: CompanyConfig[] = [
  { source: "greenhouse", token: "airbnb", companyName: "Airbnb" },
  { source: "greenhouse", token: "stripe", companyName: "Stripe" },
  { source: "ashby", token: "linear", companyName: "Linear" },
  { source: "ashby", token: "vanta", companyName: "Vanta" },
  { source: "ashby", token: "ramp", companyName: "Ramp" },
  { source: "lever", token: "plaid", companyName: "Plaid" },
  { source: "workable", token: "typeform", companyName: "Typeform" },

  // -- confirmed live 2026-07-30 --
  { source: "greenhouse", token: "asana", companyName: "Asana" },
  { source: "greenhouse", token: "robinhood", companyName: "Robinhood" },
  { source: "greenhouse", token: "discord", companyName: "Discord" },
  { source: "greenhouse", token: "vercel", companyName: "Vercel" },
  { source: "greenhouse", token: "cloudflare", companyName: "Cloudflare" },
  { source: "greenhouse", token: "figma", companyName: "Figma" },
  { source: "greenhouse", token: "anthropic", companyName: "Anthropic" },
  { source: "greenhouse", token: "databricks", companyName: "Databricks" },
  { source: "greenhouse", token: "ginkgobioworks", companyName: "Ginkgo Bioworks" },
  {
    source: "greenhouse",
    token: "recursionpharmaceuticals",
    companyName: "Recursion Pharmaceuticals",
  },
  { source: "ashby", token: "notion", companyName: "Notion" },
  { source: "ashby", token: "openai", companyName: "OpenAI" },
  { source: "ashby", token: "perplexity", companyName: "Perplexity" },
  { source: "ashby", token: "skydio", companyName: "Skydio" },
  { source: "ashby", token: "benchling", companyName: "Benchling" },
];
