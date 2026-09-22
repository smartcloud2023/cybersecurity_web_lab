"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Placeholder — replace with GET /api/progress once sessions exist.
const DATA = [
  { session: "S1", score: 42 },
  { session: "S2", score: 55 },
  { session: "S3", score: 51 },
  { session: "S4", score: 68 },
  { session: "S5", score: 74 },
  { session: "S6", score: 82 },
];

// Sequential blue — the reference palette's default sequential hue.
const SERIES_COLOR = "#3987e5";

export function ScoreTrendChart() {
  return (
    <div className="dash rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 text-[var(--dash-ink)]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--dash-ink-secondary)]">
          Tradecraft score trend
        </h2>
        <span className="text-xs text-[var(--dash-ink-muted)]">Last 6 sessions</span>
      </div>

      <div className="mt-3 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES_COLOR} stopOpacity={0.18} />
                <stop offset="100%" stopColor={SERIES_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--dash-border)"
              strokeDasharray="0"
            />
            <XAxis
              dataKey="session"
              tick={{ fill: "var(--dash-ink-muted)", fontSize: 11 }}
              axisLine={{ stroke: "var(--dash-border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--dash-ink-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              cursor={{ stroke: "var(--dash-border)", strokeWidth: 1 }}
              contentStyle={{
                background: "var(--dash-surface-raised)",
                border: "1px solid var(--dash-border)",
                borderRadius: 8,
                color: "var(--dash-ink)",
                fontSize: 12,
              }}
              formatter={(value) => [value, "Score"]}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke={SERIES_COLOR}
              strokeWidth={2}
              fill="url(#scoreFill)"
              dot={false}
              activeDot={{ r: 4, fill: SERIES_COLOR, stroke: "var(--dash-surface)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
