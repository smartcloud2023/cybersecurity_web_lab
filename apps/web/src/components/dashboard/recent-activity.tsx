"use client";

import { useEffect, useState } from "react";
import { useAuthToken } from "@/hooks/use-auth";
import { getMyActivity, type ActivityItem } from "@/lib/progress";

const STATUS_LABEL: Record<ActivityItem["status"], string> = {
  requested: "Starting…",
  provisioning: "Starting…",
  ready: "In progress",
  active: "In progress",
  expired: "Expired",
  destroying: "Ending…",
  destroyed: "Ended",
  failed: "Failed",
};

export function RecentActivity() {
  const token = useAuthToken();
  const [activity, setActivity] = useState<ActivityItem[] | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getMyActivity(token)
      .then((rows) => {
        if (!cancelled) setActivity(rows);
      })
      .catch(() => {
        if (!cancelled) setActivity([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="dash rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 text-[var(--dash-ink)]">
      <h2 className="text-sm font-medium text-[var(--dash-ink-secondary)]">
        Recent activity
      </h2>

      {activity === null ? (
        <p className="mt-3 text-xs text-[var(--dash-ink-muted)]">Loading…</p>
      ) : activity.length === 0 ? (
        <p className="mt-3 text-xs text-[var(--dash-ink-muted)]">
          No labs launched yet — head over to Labs to get started.
        </p>
      ) : (
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
            {activity.map((row) => (
              <tr key={row.session_id} className="border-t border-[var(--dash-border)]">
                <td className="py-2.5 pr-2">{row.lab_title}</td>
                <td className="py-2.5 text-[var(--dash-ink-secondary)]">
                  {STATUS_LABEL[row.status]}
                </td>
                <td className="py-2.5 text-right tabular-nums">
                  {row.score ?? "—"}
                </td>
                <td className="py-2.5 text-right text-[var(--dash-ink-muted)]">
                  {new Date(row.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
