import { NextResponse } from "next/server";
import { runIngestion } from "@/lib/ingestion/run";

// Vercel Cron calls this with `Authorization: Bearer ${CRON_SECRET}` (see
// vercel.json). The same header works for manually triggering a run (e.g.
// via curl or the e2e test) before this is ever deployed.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summaries = await runIngestion();
  return NextResponse.json({ summaries });
}
