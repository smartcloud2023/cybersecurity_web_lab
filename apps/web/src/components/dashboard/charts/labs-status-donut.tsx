"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Status palette (reserved meaning, never themed) — see the dataviz skill's
// reference palette. "Not started" is informational, not a status, so it
// takes the muted ink rather than a status color.
const SEGMENTS = [
  { key: "completed", label: "Completed", value: 2, color: "#0ca30c" },
  { key: "in_progress", label: "In progress", value: 1, color: "#fab219" },
  { key: "not_started", label: "Not started", value: 4, color: "#898781" },
];

const total = SEGMENTS.reduce((sum, s) => sum + s.value, 0);

export function LabsStatusDonut() {
  return (
    <div className="dash rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 text-[var(--dash-ink)]">
      <h2 className="text-sm font-medium text-[var(--dash-ink-secondary)]">
        Labs by status
      </h2>

      <div className="mt-2 flex items-center gap-6">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={SEGMENTS}
                dataKey="value"
                nameKey="label"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={3}
                cornerRadius={4}
                stroke="none"
              >
                {SEGMENTS.map((s) => (
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
          {SEGMENTS.map((s) => (
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
    </div>
  );
}
