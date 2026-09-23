"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/dashboard/topbar";
import { useAuthToken } from "@/hooks/use-auth";
import { getMyProgress, type ProgressItem } from "@/lib/progress";

const STATUS_META: Record<ProgressItem["status"], { label: string; color: string }> = {
  completed: { label: "Completed", color: "#0ca30c" },
  in_progress: { label: "In progress", color: "#fab219" },
  not_started: { label: "Not started", color: "#898781" },
};

export default function ProgressPage() {
  const token = useAuthToken();
  const [progress, setProgress] = useState<ProgressItem[] | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getMyProgress(token)
      .then((rows) => {
        if (!cancelled) setProgress(rows);
      })
      .catch(() => {
        if (!cancelled) setProgress([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="dash flex min-h-screen flex-col bg-[var(--dash-page)] text-[var(--dash-ink)]">
      <Topbar title="Progress" breadcrumb="Your learning path" />
      <div className="flex-1 p-6">
        {progress === null ? (
          <p className="text-sm text-[var(--dash-ink-muted)]">Loading…</p>
        ) : progress.length === 0 ? (
          <div className="dash rounded-xl border border-dashed border-[var(--dash-border)] p-8 text-center text-sm text-[var(--dash-ink-muted)]">
            No labs published yet.
          </div>
        ) : (
          <div className="dash overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--dash-ink-muted)]">
                  <th className="px-4 py-3 font-normal">Lab</th>
                  <th className="px-4 py-3 font-normal">Level</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3 text-right font-normal">Score</th>
                  <th className="px-4 py-3 text-right font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {progress.map((item) => {
                  const meta = STATUS_META[item.status];
                  return (
                    <tr key={item.lab_id} className="border-t border-[var(--dash-border)]">
                      <td className="px-4 py-3 font-medium">{item.lab_title}</td>
                      <td className="px-4 py-3 capitalize text-[var(--dash-ink-secondary)]">
                        {item.level}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {item.status === "not_started" ? "—" : item.score}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/labs/${item.lab_slug}`}
                          className="text-xs underline underline-offset-4 text-[var(--dash-ink-secondary)] hover:text-[var(--dash-ink)]"
                        >
                          {item.status === "not_started" ? "Start" : "View"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
