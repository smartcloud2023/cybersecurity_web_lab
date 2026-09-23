"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthToken } from "@/hooks/use-auth";
import { listMySessions, type LabSession } from "@/lib/labs";

export function ActiveLabCard() {
  const token = useAuthToken();
  const [sessions, setSessions] = useState<LabSession[] | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    listMySessions(token)
      .then((s) => {
        if (!cancelled) setSessions(s);
      })
      .catch(() => {
        if (!cancelled) setSessions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const active = sessions?.find((s) => s.status === "ready" || s.status === "active");

  return (
    <div className="dash rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
      <h2 className="text-sm font-medium text-[var(--dash-ink-secondary)]">Active lab</h2>
      {sessions === null ? (
        <p className="mt-2 text-xs text-[var(--dash-ink-muted)]">Loading…</p>
      ) : active ? (
        <>
          <p className="mt-2 font-medium capitalize">{active.status} session</p>
          <p className="text-xs text-[var(--dash-ink-muted)]">
            Started {new Date(active.created_at).toLocaleTimeString()}
          </p>
        </>
      ) : (
        <p className="mt-2 text-xs text-[var(--dash-ink-muted)]">No active lab right now.</p>
      )}
      <Link
        href={active ? `/labs/${active.lab_slug}` : "/labs"}
        className="mt-3 inline-block rounded-md px-3 py-1.5 text-xs font-medium"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
      >
        {active ? "Resume lab" : "Browse labs"}
      </Link>
    </div>
  );
}
