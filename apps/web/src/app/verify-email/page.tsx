"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthToken, useCurrentUser } from "@/hooks/use-auth";
import { resendVerification, verifyEmail } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpInput } from "@/components/auth/otp-input";

export default function VerifyEmailPage() {
  const router = useRouter();
  const token = useAuthToken();
  const { user, status } = useCurrentUser();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && user?.email_verified) router.replace("/mfa-setup");
  }, [status, user, router]);

  async function handleSubmit() {
    if (!token || code.length !== 6) return;
    setError(null);
    setSubmitting(true);
    try {
      await verifyEmail(token, code);
      router.push("/mfa-setup");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!token) return;
    setError(null);
    setResending(true);
    try {
      await resendVerification(token);
      setResent(true);
      setCode("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setResending(false);
    }
  }

  if (status !== "authenticated") {
    return (
      <div className="dash flex min-h-screen items-center justify-center bg-[var(--dash-page)] text-sm text-[var(--dash-ink-muted)]">
        Loading…
      </div>
    );
  }

  return (
    <AuthShell
      eyebrow="Step 2 of 3"
      title="Enter verification code"
      subtitle={`We've sent a code to ${user?.email ?? "your email"}.`}
      footer={
        <button
          type="button"
          onClick={() => router.push("/mfa-setup")}
          className="text-[var(--dash-ink-muted)] underline underline-offset-2 hover:text-[var(--dash-ink)]"
        >
          Skip for now
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <OtpInput value={code} onChange={setCode} disabled={submitting} />

        {error && <p className="text-sm text-red-400">{error}</p>}
        {resent && !error && (
          <p className="text-sm" style={{ color: "var(--accent)" }}>
            A new code was sent.
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || code.length !== 6}
          className="mt-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
        >
          {submitting ? "Verifying…" : "Verify code"}
        </button>

        <p className="text-center text-sm text-[var(--dash-ink-muted)]">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-medium underline underline-offset-2 disabled:opacity-50"
            style={{ color: "var(--accent)" }}
          >
            {resending ? "Sending…" : "Click to resend"}
          </button>
        </p>
      </div>
    </AuthShell>
  );
}
