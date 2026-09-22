"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { AuthShell } from "@/components/auth/auth-shell";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password);
      router.push("/verify-email");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      subtitle="Practice real attacker techniques in isolated, disposable labs."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium" style={{ color: "var(--accent)" }}>
            Log in
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
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border px-3 py-2.5 text-[var(--dash-ink)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ borderColor: "var(--dash-border)", backgroundColor: "var(--dash-surface-raised)" }}
          />
          <span className="text-xs text-[var(--dash-ink-muted)]">At least 8 characters.</span>
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-xs text-[var(--dash-ink-muted)]">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
