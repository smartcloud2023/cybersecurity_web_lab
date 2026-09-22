"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useAuthToken, useCurrentUser } from "@/hooks/use-auth";
import { mfaConfirm, mfaSetup } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpInput } from "@/components/auth/otp-input";

export default function MfaSetupPage() {
  const router = useRouter();
  const token = useAuthToken();
  const { user, status } = useCurrentUser();

  const [secret, setSecret] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated" && user?.mfa_enabled) router.replace("/dashboard");
  }, [status, user, router]);

  useEffect(() => {
    if (status !== "authenticated" || !token || user?.mfa_enabled) return;
    let cancelled = false;
    mfaSetup(token)
      .then(async ({ secret, otpauthUri }) => {
        const dataUrl = await QRCode.toDataURL(otpauthUri, { margin: 1, width: 200 });
        if (!cancelled) {
          setSecret(secret);
          setQrDataUrl(dataUrl);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Couldn't start MFA setup.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [status, token, user?.mfa_enabled]);

  async function handleConfirm() {
    if (!token || code.length !== 6) return;
    setError(null);
    setSubmitting(true);
    try {
      await mfaConfirm(token, code);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status !== "authenticated" || user?.mfa_enabled) {
    // Covers "still loading", "unauthenticated" (about to redirect), and
    // "already enabled" (about to redirect) — see the effect above.
    return (
      <div className="dash flex min-h-screen items-center justify-center bg-[var(--dash-page)] text-sm text-[var(--dash-ink-muted)]">
        Loading…
      </div>
    );
  }

  return (
    <AuthShell
      eyebrow="Step 3 of 3"
      title="Set up multi-factor authentication"
      subtitle="Optional, but strongly recommended — it's the single biggest thing you can do to keep this account safe."
      footer={
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-[var(--dash-ink-muted)] underline underline-offset-2 hover:text-[var(--dash-ink)]"
        >
          Skip for now — I&apos;ll set this up later
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        {!qrDataUrl && !error && (
          <p className="text-sm text-[var(--dash-ink-muted)]">Generating your setup code…</p>
        )}

        {qrDataUrl && (
          <div className="flex flex-col items-center gap-3 rounded-lg border p-4" style={{ borderColor: "var(--dash-border)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- data: URL from the qrcode lib, not an optimizable remote image */}
            <img src={qrDataUrl} alt="MFA setup QR code" width={200} height={200} className="rounded-md bg-white p-2" />
            <p className="text-xs text-[var(--dash-ink-muted)]">
              Scan with Google Authenticator, 1Password, or any TOTP app.
            </p>
            {secret && (
              <p className="rounded-md bg-[var(--dash-surface-raised)] px-2 py-1 font-mono text-xs tracking-wider text-[var(--dash-ink-secondary)]">
                {secret}
              </p>
            )}
          </div>
        )}

        <div>
          <p className="mb-1.5 text-sm text-[var(--dash-ink-secondary)]">Enter the 6-digit code from your app</p>
          <OtpInput value={code} onChange={setCode} disabled={submitting || !qrDataUrl} />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting || code.length !== 6 || !qrDataUrl}
          className="mt-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
        >
          {submitting ? "Enabling…" : "Enable MFA"}
        </button>
      </div>
    </AuthShell>
  );
}
