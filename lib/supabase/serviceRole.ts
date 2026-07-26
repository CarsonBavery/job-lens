import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Server-only client that bypasses Row Level Security. Never import this
// from a Client Component or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
// Intended for scheduled jobs (e.g. lib/ingestion) and Stripe webhook handlers.
//
// Deliberately in its own module, not lib/supabase/server.ts: that file
// also exports the cookie-based `createClient`, which imports next/headers
// -- a Next.js-runtime-only module. Bundling them together makes the whole
// file unimportable from plain Node contexts (e2e tests calling
// runIngestion() directly, future standalone scripts), even though this
// export itself has no such dependency.
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
