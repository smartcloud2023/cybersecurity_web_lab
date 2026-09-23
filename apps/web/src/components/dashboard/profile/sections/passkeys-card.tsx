"use client";

import { useEffect, useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { Fingerprint, Plus, Trash2 } from "lucide-react";
import {
  deletePasskey,
  listPasskeys,
  passkeyRegistrationOptions,
  passkeyRegistrationVerify,
  type Passkey,
} from "@/lib/account";
import { ApiError } from "@/lib/api";
import { Field, SectionCard, inputClass, inputStyle } from "../ui";

export function PasskeysCard({ token }: { token: string }) {
  const [passkeys, setPasskeys] = useState<Passkey[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listPasskeys(token)
      .then((p) => {
        if (!cancelled) setPasskeys(p);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't load passkeys.");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleAdd() {
    if (!name.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const { challengeToken, optionsJSON } = await passkeyRegistrationOptions(token);
      const credential = await startRegistration({ optionsJSON });
      const created = await passkeyRegistrationVerify(token, challengeToken, name.trim(), credential);
      setPasskeys((prev) => [created, ...(prev ?? [])]);
      setName("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error && err.name === "NotAllowedError") {
        // The browser's own cancel/timeout error — not a server failure.
        setError("Passkey setup was cancelled.");
      } else {
        setError("Couldn't set up that passkey.");
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await deletePasskey(token, id);
      setPasskeys((prev) => prev?.filter((p) => p.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't remove that passkey.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SectionCard
      title="Passkeys"
      description="Sign in with your device's fingerprint, face, or security key instead of a password — a passkey alone is enough to sign in, no separate MFA code needed."
    >
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      {passkeys === null ? (
        <p className="text-sm text-[var(--dash-ink-muted)]">Loading…</p>
      ) : passkeys.length === 0 ? (
        <p className="mb-4 text-sm text-[var(--dash-ink-muted)]">No passkeys registered yet.</p>
      ) : (
        <div className="mb-4 flex flex-col gap-2">
          {passkeys.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-3"
              style={{ borderColor: "var(--dash-border)" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--accent-soft)" }}
                >
                  <Fingerprint className="h-4 w-4" style={{ color: "var(--accent)" }} />
                </span>
                <div>
                  <p className="text-sm text-[var(--dash-ink)]">{p.name}</p>
                  <p className="text-xs text-[var(--dash-ink-muted)]">
                    Added {new Date(p.created_at).toLocaleDateString()}
                    {p.last_used_at && ` · last used ${new Date(p.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(p.id)}
                disabled={busyId === p.id}
                className="shrink-0 rounded-lg border p-2 text-[var(--dash-ink-secondary)] hover:text-[var(--dash-ink)] disabled:opacity-50"
                style={{ borderColor: "var(--dash-border)" }}
                aria-label={`Remove ${p.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Field label="Name this device">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MacBook Touch ID"
              className={inputClass}
              style={inputStyle}
              maxLength={100}
            />
          </Field>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || !name.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
        >
          <Plus className="h-3.5 w-3.5" />
          {adding ? "Waiting for device…" : "Add a passkey"}
        </button>
      </div>
    </SectionCard>
  );
}
