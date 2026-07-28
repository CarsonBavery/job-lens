import Link from "next/link";
import type { DocumentRecord } from "@/lib/documents/db";
import { Card, CardContent } from "@/components/ui/card";

export function TailoredVersionsList({
  versions,
  hrefPrefix,
}: {
  versions: DocumentRecord[];
  hrefPrefix: string;
}) {
  if (versions.length === 0) return null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm font-medium">Tailored versions</p>
        <ul className="flex flex-col gap-1">
          {versions.map((version) => (
            <li key={version.id}>
              <Link href={`${hrefPrefix}/${version.id}`} className="text-sm hover:underline">
                {version.title}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
