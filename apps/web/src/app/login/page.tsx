"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";
import { Fingerprint } from "lucide-react";
import { login, mfaVerify } from "@/lib/auth";
import { passkeyLoginOptions, passkeyLoginVerify } from "@/lib/account";
import { ApiError } from "@/lib/api";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpInput } from "@/components/auth/otp-input";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [passkeySubmitting, setPasskeySubmitting] = useState(false);

  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaSubmitting, setMfaSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.mfaRequired) {
        setPendingToken(result.pendingToken);
      } else {
        router.push(next);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasskeyLogin() {
    if (!email) {
      setError("Enter your email first, then use a passkey.");
      return;
    }
    setError(null);
    setPasskeySubmitting(true);
    try {
      const { challengeToken, optionsJSON } = await passkeyLoginOptions(email);
      const credential = await startAuthentication({ optionsJSON });
      await passkeyLoginVerify(challengeToken, credential);
      router.push(next);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Passkey login was cancelled.");
      } else {
        setError("That passkey didn't work.");
      }
    } finally {
      setPasskeySubmitting(false);
    }
  }

  async function handleMfaSubmit() {
    if (!pendingToken || mfaCode.length !== 6) return;
    setError(null);
    setMfaSubmitting(true);
    try {
      await mfaVerify(pendingToken, mfaCode);
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setMfaSubmitting(false);
    }
  }

  if (pendingToken) {
    return (
      <AuthShell
        eyebrow="Two-factor authentication"
        title="Enter your authenticator code"
        subtitle="Open your authenticator app and enter the current 6-digit code."
        footer={
          <button
            type="button"
            onClick={() => {
              setPendingToken(null);
              setMfaCode("");
              setError(null);
            }}
            className="text-[var(--dash-ink-muted)] underline underline-offset-2 hover:text-[var(--dash-ink)]"
          >
            Back to log in
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <OtpInput value={mfaCode} onChange={setMfaCode} disabled={mfaSubmitting} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="button"
            onClick={handleMfaSubmit}
            disabled={mfaSubmitting || mfaCode.length !== 6}
            className="mt-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
          >
            {mfaSubmitting ? "Verifying…" : "Verify and log in"}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in"
      subtitle="Pick up where you left off."
      footer={
        <>
          No account?{" "}
          <Link href="/register" className="font-medium" style={{ color: "var(--accent)" }}>
            Sign up
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[var(--dash-ink-secondary)]">Email address</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border px-3 py-2.5 text-[var(--dash-ink)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ borderColor: "var(--dash-border)", backgroundColor: "var(--dash-surface-raised)" }}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[var(--dash-ink-secondary)]">Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border px-3 py-2.5 text-[var(--dash-ink)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ borderColor: "var(--dash-border)", backgroundColor: "var(--dash-surface-raised)" }}
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>

        <button
          type="button"
          onClick={handlePasskeyLogin}
          disabled={passkeySubmitting}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium text-[var(--dash-ink-secondary)] hover:text-[var(--dash-ink)] disabled:opacity-50"
          style={{ borderColor: "var(--dash-border)" }}
        >
          <Fingerprint className="h-4 w-4" />
          {passkeySubmitting ? "Waiting for device…" : "Log in with a passkey"}
        </button>
      </form>
    </AuthShell>
  );
}
