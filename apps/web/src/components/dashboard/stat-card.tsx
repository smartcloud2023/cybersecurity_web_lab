import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  deltaTone = "good",
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "good" | "critical";
  icon: LucideIcon;
}) {
  return (
    <div className="dash rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 text-[var(--dash-ink)]">
      <div className="flex items-center justify-between">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--accent-soft)" }}
        >
          <Icon className="h-4.5 w-4.5" style={{ color: "var(--accent)" }} />
        </span>
        {delta && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              color: deltaTone === "good" ? "#0ca30c" : "#e66767",
              backgroundColor:
                deltaTone === "good" ? "rgba(12,163,12,0.14)" : "rgba(230,103,103,0.14)",
            }}
          >
            {delta}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-[var(--dash-ink-secondary)]">{label}</p>
    </div>
  );
}
