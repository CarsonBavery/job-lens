// Coarse first pass for cross-source job dedup: two postings with the same
// key are almost certainly the same job. Postings that DON'T match still get
// compared via embedding similarity (see job_postings.embedding) since the
// same role is often titled slightly differently across ATS platforms.
export function buildDedupKey(params: {
  company: string;
  title: string;
  location?: string | null;
}): string {
  const normalize = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^a-z0-9 ]/g, "");

  return [
    normalize(params.company),
    normalize(params.title),
    normalize(params.location ?? ""),
  ].join("|");
}
