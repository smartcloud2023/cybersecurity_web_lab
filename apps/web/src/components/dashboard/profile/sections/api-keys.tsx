"use client";

import { useEffect, useState } from "react";
import { Check, Code2, Copy, Plus, Trash2 } from "lucide-react";
import { createApiKey, listApiKeys, revokeApiKey, type ApiKey } from "@/lib/account";
import { ApiError } from "@/lib/api";
import { Field, SectionCard, inputClass, inputStyle } from "../ui";
import { ComingSoon } from "../coming-soon";

export function ApiKeysSection({ token }: { token: string }) {
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listApiKeys(token)
      .then((k) => {
        if (!cancelled) setKeys(k);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't load API keys.");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const created = await createApiKey(token, name.trim());
      setKeys((prev) => [created, ...(prev ?? [])]);
      setRevealedKey(created.key);
      setName("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create API key.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await revokeApiKey(token, id);
      setKeys((prev) => prev?.filter((k) => k.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't revoke that key.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCopy() {
    if (!revealedKey) return;
    try {
      await navigator.clipboard.writeText(revealedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the key
      // is still visible on screen to copy by hand.
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionCard
        title="API Keys & Tokens"
        description="Personal keys for authenticating against CyberLab's API — no public API is exposed yet, so these aren't usable against anything today. They're ready for when one ships."
      >
        <ComingSoon
          icon={Code2}
          title="No public API yet"
          description="Keys created here are real and stored securely, but nothing currently accepts them as credentials."
        />
      </SectionCard>

      {revealedKey && (
        <SectionCard title="Your new API key">
          <p className="mb-2 text-sm text-[var(--dash-ink-secondary)]">
            Copy it now — you won&apos;t be able to see it again.
          </p>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 overflow-x-auto rounded-lg border px-3 py-2 font-mono text-sm"
              style={{ ...inputStyle, borderColor: "var(--dash-border)" }}
            >
              {revealedKey}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded-lg border p-2"
              style={{ borderColor: "var(--dash-border)" }}
              aria-label="Copy API key"
            >
              {copied ? (
                <Check className="h-4 w-4" style={{ color: "#0ca30c" }} />
              ) : (
                <Copy className="h-4 w-4 text-[var(--dash-ink-secondary)]" />
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setRevealedKey(null)}
            className="mt-3 text-xs text-[var(--dash-ink-muted)] underline underline-offset-2"
          >
            Done, hide this
          </button>
        </SectionCard>
      )}

      <SectionCard title="Create a new key">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Field label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CI runner"
                className={inputClass}
                style={inputStyle}
                maxLength={100}
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
          >
            <Plus className="h-3.5 w-3.5" />
            {creating ? "Creating…" : "Create key"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </SectionCard>

      <SectionCard title="Your keys">
        {keys === null ? (
          <p className="text-sm text-[var(--dash-ink-muted)]">Loading…</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-[var(--dash-ink-muted)]">No API keys yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-3"
                style={{ borderColor: "var(--dash-border)" }}
              >
                <div>
                  <p className="text-sm text-[var(--dash-ink)]">{k.name}</p>
                  <p className="font-mono text-xs text-[var(--dash-ink-muted)]">
                    {k.prefix}… · created {new Date(k.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevoke(k.id)}
                  disabled={busyId === k.id}
                  className="shrink-0 rounded-lg border p-2 text-[var(--dash-ink-secondary)] hover:text-[var(--dash-ink)] disabled:opacity-50"
                  style={{ borderColor: "var(--dash-border)" }}
                  aria-label={`Revoke ${k.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
