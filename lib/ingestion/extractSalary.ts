// Best-effort salary extraction from a posting's free-text description.
// None of the 4 supported ATS APIs expose compensation as a clean
// structured field -- when a posting discloses a range (e.g. for US
// pay-transparency-law compliance), it's embedded directly in the
// description body, so this has to be pattern-matched rather than parsed
// from JSON. Deliberately conservative: only extracts a clear "$X - $Y"
// range within a plausible annual-salary band, rather than guessing at
// single figures (which are more likely to be funding/equity amounts than
// a salary) or non-range phrasing ("starting at $X").
const RANGE_PATTERN =
  /\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s?(k|K)?\s?(?:-|–|—|to)\s?\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s?(k|K)?/;

const MIN_PLAUSIBLE_SALARY = 20_000;
const MAX_PLAUSIBLE_SALARY = 1_000_000;

function parseAmount(digits: string, kSuffix: string | undefined): number {
  const n = Number(digits.replace(/,/g, ""));
  return kSuffix ? n * 1000 : n;
}

export function extractSalaryRange(
  description: string | null | undefined,
): { min: number; max: number } | null {
  if (!description) return null;

  const match = RANGE_PATTERN.exec(description);
  if (!match) return null;

  const a = parseAmount(match[1], match[2]);
  const b = parseAmount(match[3], match[4]);
  const min = Math.min(a, b);
  const max = Math.max(a, b);

  if (min < MIN_PLAUSIBLE_SALARY || max > MAX_PLAUSIBLE_SALARY || min === max) {
    return null;
  }

  return { min, max };
}
