import Link from "next/link";
import type { JobCategory } from "@/types/database";

const CATEGORY_OPTIONS: { value: JobCategory; label: string }[] = [
  { value: "software", label: "Software" },
  { value: "data_ml", label: "Data / ML" },
  { value: "hardware", label: "Hardware" },
  { value: "biotech", label: "Biotech" },
  { value: "infrastructure_security", label: "Infra / Security" },
  { value: "other_stem", label: "Other STEM" },
];

function buildHref(params: { q?: string; remote?: boolean; category?: JobCategory }): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.remote) search.set("remote", "true");
  if (params.category) search.set("category", params.category);
  const qs = search.toString();
  return qs ? `/dashboard/jobs?${qs}` : "/dashboard/jobs";
}

export function JobFilterSidebar({
  activeCategory,
  q,
  remote,
}: {
  activeCategory?: JobCategory;
  q?: string;
  remote?: boolean;
}) {
  return (
    <nav aria-label="Filter by category" className="flex flex-col gap-1">
      <span className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Category
      </span>
      <Link
        href={buildHref({ q, remote })}
        className={`rounded-md px-2 py-1.5 text-sm ${
          !activeCategory
            ? "bg-accent font-medium text-accent-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        All categories
      </Link>
      {CATEGORY_OPTIONS.map((opt) => (
        <Link
          key={opt.value}
          href={buildHref({ q, remote, category: opt.value })}
          className={`rounded-md px-2 py-1.5 text-sm ${
            activeCategory === opt.value
              ? "bg-accent font-medium text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {opt.label}
        </Link>
      ))}
    </nav>
  );
}
