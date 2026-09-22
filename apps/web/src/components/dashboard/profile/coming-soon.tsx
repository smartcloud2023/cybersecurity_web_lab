import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function ComingSoon({
  icon: Icon,
  title,
  description,
  linkHref,
  linkLabel,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--dash-border)] px-6 py-12 text-center">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--accent-soft)" }}
      >
        <Icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
      </span>
      <p className="text-sm font-medium text-[var(--dash-ink)]">{title}</p>
      <p className="max-w-sm text-sm text-[var(--dash-ink-muted)]">{description}</p>
      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className="mt-1 text-sm font-medium underline underline-offset-2"
          style={{ color: "var(--accent)" }}
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
