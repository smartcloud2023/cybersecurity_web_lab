"use client";

import { useEffect, useState } from "react";
import { Laptop, LogOut } from "lucide-react";
import { listSessions, revokeOtherSessions, revokeSession, type Session } from "@/lib/account";
import { ApiError } from "@/lib/api";
import { Badge, SectionCard } from "../ui";

export function DevicesSessionsSection({ token }: { token: string }) {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listSessions(token)
      .then((s) => {
        if (!cancelled) setSessions(s);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't load sessions.");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleRevoke(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await revokeSession(token, id);
      setSessions((prev) => prev?.filter((s) => s.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't revoke that session.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRevokeOthers() {
    setRevokingOthers(true);
    setError(null);
    try {
      await revokeOtherSessions(token);
      setSessions((prev) => prev?.filter((s) => s.is_current) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't sign out other sessions.");
    } finally {
      setRevokingOthers(false);
    }
  }

  const hasOthers = (sessions?.length ?? 0) > 1;

  return (
    <SectionCard
      title="Devices & Sessions"
      description="Every device currently signed in to your account. Revoking a session signs it out immediately."
    >
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      {sessions === null ? (
        <p className="text-sm text-[var(--dash-ink-muted)]">Loading…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-3"
              style={{ borderColor: "var(--dash-border)" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--accent-soft)" }}
                >
                  <Laptop className="h-4 w-4" style={{ color: "var(--accent)" }} />
                </span>
                <div>
                  <p className="flex items-center gap-2 text-sm text-[var(--dash-ink)]">
                    {s.user_agent ?? "Unknown device"}
                    {s.is_current && <Badge tone="good">This device</Badge>}
                  </p>
                  <p className="text-xs text-[var(--dash-ink-muted)]">
                    {s.ip_address ?? "Unknown IP"} · last active{" "}
                    {new Date(s.last_seen_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {!s.is_current && (
                <button
                  type="button"
                  onClick={() => handleRevoke(s.id)}
                  disabled={busyId === s.id}
                  className="shrink-0 rounded-lg border px-3 py-1.5 text-xs text-[var(--dash-ink-secondary)] hover:text-[var(--dash-ink)] disabled:opacity-50"
                  style={{ borderColor: "var(--dash-border)" }}
                >
                  {busyId === s.id ? "Revoking…" : "Revoke"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {hasOthers && (
        <button
          type="button"
          onClick={handleRevokeOthers}
          disabled={revokingOthers}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          style={{ backgroundColor: "#d03b3b", color: "#ffffff" }}
        >
          <LogOut className="h-3.5 w-3.5" />
          {revokingOthers ? "Signing out…" : "Sign out of all other devices"}
        </button>
      )}
    </SectionCard>
  );
}
