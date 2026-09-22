// Placeholder — replace with GET /api/lab-sessions once sessions exist.
const ROWS = [
  { lab: "WEB001 — Recon & Exploitation", status: "In progress", score: "—", date: "Today" },
];

export function RecentActivity() {
  return (
    <div className="dash rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 text-[var(--dash-ink)]">
      <h2 className="text-sm font-medium text-[var(--dash-ink-secondary)]">
        Recent activity
      </h2>

      <table className="mt-3 w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-[var(--dash-ink-muted)]">
            <th className="pb-2 font-normal">Lab</th>
            <th className="pb-2 font-normal">Status</th>
            <th className="pb-2 text-right font-normal">Score</th>
            <th className="pb-2 text-right font-normal">Date</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.lab} className="border-t border-[var(--dash-border)]">
              <td className="py-2.5 pr-2">{row.lab}</td>
              <td className="py-2.5 text-[var(--dash-ink-secondary)]">{row.status}</td>
              <td className="py-2.5 text-right tabular-nums">{row.score}</td>
              <td className="py-2.5 text-right text-[var(--dash-ink-muted)]">{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
