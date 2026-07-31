import type { JobCategory } from "@/types/database";
import { Badge } from "@/components/ui/badge";

const CATEGORY_LABELS: Record<JobCategory, string> = {
  software: "Software",
  data_ml: "Data / ML",
  hardware: "Hardware",
  biotech: "Biotech",
  infrastructure_security: "Infra / Security",
  other_stem: "Other STEM",
  non_technical: "Non-Technical",
};

export function JobCategoryBadge({
  category,
  className,
}: {
  category: JobCategory;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={className}
      style={{
        backgroundColor: `var(--category-${category})`,
        color: `var(--category-${category}-foreground)`,
        borderColor: "transparent",
      }}
    >
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
