"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useAuthToken } from "@/hooks/use-auth";
import { getMyProgress, type ProgressItem } from "@/lib/progress";

// Status palette (reserved meaning, never themed) — see the dataviz skill's
// reference palette. "Not started" is informational, not a status, so it
// takes the muted ink rather than a status color.
const STATUS_META = {
  completed: { label: "Completed", color: "#0ca30c" },
  in_progress: { label: "In progress", color: "#fab219" },
  not_started: { label: "Not started", color: "#898781" },
} as const;

export function LabsStatusDonut() {
  const token = useAuthToken();
  const [progress, setProgress] = useState<ProgressItem[] | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getMyProgress(token)
      .then((p) => {
        if (!cancelled) setProgress(p);
      })
      .catch(() => {
        if (!cancelled) setProgress([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const counts = { completed: 0, in_progress: 0, not_started: 0 };
  for (const p of progress ?? []) counts[p.status] += 1;
  const total = counts.completed + counts.in_progress + counts.not_started;
  const segments = (Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((key) => ({
    key,
    ...STATUS_META[key],
    value: counts[key],
  }));

  return (
    <div className="dash rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 text-[var(--dash-ink)]">
      <h2 className="text-sm font-medium text-[var(--dash-ink-secondary)]">
        Labs by status
      </h2>

      {progress === null ? (
        <p className="mt-4 text-xs text-[var(--dash-ink-muted)]">Loading…</p>
      ) : total === 0 ? (
        <p className="mt-4 text-xs text-[var(--dash-ink-muted)]">No labs published yet.</p>
      ) : (
        <div className="mt-2 flex items-center gap-6">
          <div className="relative h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={3}
                  cornerRadius={4}
                  stroke="none"
                >
                  {segments.map((s) => (
                    <Cell key={s.key} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--dash-surface-raised)",
                    border: "1px solid var(--dash-border)",
                    borderRadius: 8,
                    color: "var(--dash-ink)",
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [`${value} labs`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold">{total}</span>
              <span className="text-[10px] text-[var(--dash-ink-muted)]">Total</span>
            </div>
          </div>

          <ul className="flex flex-col gap-2 text-sm">
            {segments.map((s) => (
              <li key={s.key} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-[var(--dash-ink-secondary)]">{s.label}</span>
                <span className="ml-auto font-medium">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
