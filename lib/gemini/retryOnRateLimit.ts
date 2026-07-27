import { ApiError } from "@google/genai";

const MAX_RETRIES = 2;
// The free-tier quota this trips is a per-minute window (see
// parseRetryDelayMs below) -- when Google's response doesn't include an
// explicit retryDelay, waiting a full minute-plus is more reliable than a
// short exponential guess that might not span the window's reset.
const FALLBACK_BACKOFF_MS = 65000;

function isRateLimitError(err: unknown): err is ApiError {
  return err instanceof ApiError && err.status === 429;
}

// A 429's message body is the raw Gemini error JSON, e.g.:
//   {"error":{..., "details":[..., {"@type":".../RetryInfo","retryDelay":"56s"}]}}
// Google tells you exactly how long to wait -- use that instead of guessing
// with blind exponential backoff, which is what left this under-waiting
// (capped at 30s total) against real free-tier per-minute limits that can
// ask for 60s+.
function parseRetryDelayMs(err: ApiError): number | null {
  try {
    const details = JSON.parse(err.message)?.error?.details;
    const retryInfo = (details ?? []).find((d: { "@type"?: string }) =>
      d["@type"]?.endsWith("RetryInfo"),
    );
    const retryDelay: string | undefined = retryInfo?.retryDelay; // e.g. "56s"
    if (!retryDelay) return null;
    const seconds = parseFloat(retryDelay);
    return Number.isFinite(seconds) ? seconds * 1000 : null;
  } catch {
    return null;
  }
}

// This project's current Gemini API tier has a low enough rate limit that
// even a single e2e test occasionally trips it (confirmed during Phase 3 --
// not hypothetical). Every Gemini call site should go through this rather
// than calling the SDK directly, so a temporary 429 doesn't become a user-
// or test-facing failure.
export async function retryOnRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRateLimitError(err) || attempt >= MAX_RETRIES) throw err;
      const delay = parseRetryDelayMs(err) ?? FALLBACK_BACKOFF_MS;
      // Small safety margin -- retrying at exactly the server's stated
      // reset instant risks losing a race with clock/latency skew.
      await new Promise((resolve) => setTimeout(resolve, delay + 1000));
    }
  }
}
