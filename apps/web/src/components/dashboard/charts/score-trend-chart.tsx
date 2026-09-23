// Tradecraft telemetry scoring (per docs/blueprint.md §5.B) isn't built
// yet — no session produces a real score trend to plot, so this stays an
// honest empty state rather than a fabricated chart.
export function ScoreTrendChart() {
  return (
    <div className="dash rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 text-[var(--dash-ink)]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--dash-ink-secondary)]">
          Tradecraft score trend
        </h2>
      </div>
      <div className="mt-3 flex h-48 items-center justify-center rounded-lg border border-dashed border-[var(--dash-border)] text-center text-xs text-[var(--dash-ink-muted)]">
        Tradecraft telemetry scoring isn&apos;t live yet — this will chart
        your last 6 sessions once it ships.
      </div>
    </div>
  );
}
