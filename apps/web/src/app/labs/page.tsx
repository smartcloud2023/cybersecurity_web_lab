"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlaskConical, ShieldHalf } from "lucide-react";
import { listLabs, type Lab } from "@/lib/labs";
import { ApiError } from "@/lib/api";

const LEVEL_LABEL: Record<Lab["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function LabsPage() {
  const [labs, setLabs] = useState<Lab[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listLabs()
      .then((l) => {
        if (!cancelled) setLabs(l);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't load labs.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="dash min-h-screen bg-[var(--dash-page)] text-[var(--dash-ink)]">
      <header className="border-b border-[var(--dash-border)] px-6 py-4">
        <Link href="/dashboard" className="flex w-fit items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--accent-soft)" }}
          >
            <ShieldHalf className="h-4.5 w-4.5" style={{ color: "var(--accent)" }} />
          </span>
          <span className="text-base font-semibold tracking-tight">CyberLab</span>
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Lab catalogue</h1>
        <p className="mt-1 text-sm text-[var(--dash-ink-muted)]">
          Every lab is uniquely mutated per session — no shared answers, no static walkthroughs.
        </p>

        {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
        {labs === null && !error && (
          <p className="mt-6 text-sm text-[var(--dash-ink-muted)]">Loading…</p>
        )}
        {labs?.length === 0 && (
          <p className="mt-6 text-sm text-[var(--dash-ink-muted)]">No labs published yet.</p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {labs?.map((lab) => (
            <Link
              key={lab.id}
              href={`/labs/${lab.slug}`}
              className="rounded-xl border p-5 transition-colors hover:bg-[var(--dash-surface-raised)]"
              style={{ borderColor: "var(--dash-border)", backgroundColor: "var(--dash-surface)" }}
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4" style={{ color: "var(--accent)" }} />
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--accent)" }}
                >
                  {LEVEL_LABEL[lab.level]}
                </span>
              </div>
              <p className="mt-2 font-medium">{lab.title}</p>
              {lab.summary && (
                <p className="mt-1 text-sm text-[var(--dash-ink-muted)]">{lab.summary}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
