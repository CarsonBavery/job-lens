import Link from "next/link";
import type { DocumentRecord } from "@/lib/documents/db";

export function TailoredVersionsList({
  versions,
  hrefPrefix,
}: {
  versions: DocumentRecord[];
  hrefPrefix: string;
}) {
  if (versions.length === 0) return null;

  return (
    <div className="rounded-md border border-gray-200 p-4 dark:border-gray-800">
      <p className="mb-2 text-sm font-medium">Tailored versions</p>
      <ul className="flex flex-col gap-1">
        {versions.map((version) => (
          <li key={version.id}>
            <Link href={`${hrefPrefix}/${version.id}`} className="text-sm hover:underline">
              {version.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
