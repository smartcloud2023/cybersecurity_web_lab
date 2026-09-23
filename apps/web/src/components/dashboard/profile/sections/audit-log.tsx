"use client";

import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { listAuditEvents, type AuditEvent } from "@/lib/account";
import { ApiError } from "@/lib/api";
import { SectionCard } from "../ui";

const ACTION_LABELS: Record<string, string> = {
  "auth.register": "Account created",
  "auth.login": "Signed in",
  "auth.password_changed": "Password changed",
  "auth.mfa_enabled": "Multi-factor authentication enabled",
  "auth.mfa_disabled": "Multi-factor authentication disabled",
  "auth.email_verified": "Email verified",
  "profile.updated": "Profile updated",
  "session.revoked": "Session revoked",
  "session.revoked_others": "Signed out of other devices",
  "api_key.created": "API key created",
  "api_key.revoked": "API key revoked",
  "passkey.added": "Passkey added",
  "passkey.removed": "Passkey removed",
};

export function AuditLogSection({ token }: { token: string }) {
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAuditEvents(token)
      .then((e) => {
        if (!cancelled) setEvents(e);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't load activity.");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <SectionCard title="Activity & Audit Logs" description="The last 50 security-relevant events on your account.">
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      {events === null ? (
        <p className="text-sm text-[var(--dash-ink-muted)]">Loading…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-[var(--dash-ink-muted)]">No activity recorded yet.</p>
      ) : (
        <ul className="flex flex-col divide-y" style={{ borderColor: "var(--dash-border)" }}>
          {events.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-3 border-b py-2.5 last:border-b-0"
              style={{ borderColor: "var(--dash-border)" }}
            >
              <ScrollText className="h-4 w-4 shrink-0 text-[var(--dash-ink-muted)]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[var(--dash-ink)]">
                  {ACTION_LABELS[e.action] ?? e.action}
                  {e.object && (
                    <span className="text-[var(--dash-ink-muted)]"> — {e.object}</span>
                  )}
                </p>
              </div>
              <p className="shrink-0 text-xs text-[var(--dash-ink-muted)]">
                {new Date(e.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
