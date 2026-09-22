import type { ReactNode } from "react";
import { Check, Loader2 } from "lucide-react";

export const inputClass =
  "w-full rounded-lg border px-3 py-2 text-sm text-[var(--dash-ink)] outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed";
export const inputStyle = {
  borderColor: "var(--dash-border)",
  backgroundColor: "var(--dash-surface-raised)",
};

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
      <h2 className="text-sm font-semibold text-[var(--dash-ink)]">{title}</h2>
      {description && <p className="mt-1 text-xs text-[var(--dash-ink-muted)]">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-[var(--dash-ink-secondary)]">{label}</span>
      {children}
    </label>
  );
}

// Reuses the dataviz skill's validated status colors (good/warning/critical)
// rather than inventing new ones — see references/palette.md.
const BADGE_TONES = {
  good: { bg: "rgba(12,163,12,0.14)", fg: "#0ca30c" },
  warn: { bg: "rgba(250,178,25,0.16)", fg: "#fab219" },
  bad: { bg: "rgba(208,59,59,0.16)", fg: "#d03b3b" },
  neutral: { bg: "var(--dash-surface-raised)", fg: "var(--dash-ink-muted)" },
} as const;

export function Badge({
  tone,
  children,
}: {
  tone: keyof typeof BADGE_TONES;
  children: ReactNode;
}) {
  const colors = BADGE_TONES[tone];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: colors.bg, color: colors.fg }}
    >
      {children}
    </span>
  );
}

export function SaveButton({
  onClick,
  saving,
  saved,
  label = "Save changes",
  disabled,
}: {
  onClick: () => void;
  saving: boolean;
  saved: boolean;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving || disabled}
      className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
    >
      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {!saving && saved && <Check className="h-3.5 w-3.5" />}
      {saving ? "Saving…" : saved ? "Saved" : label}
    </button>
  );
}
