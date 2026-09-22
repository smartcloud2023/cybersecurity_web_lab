"use client";

import Link from "next/link";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import type { User } from "@/lib/auth";
import { SectionCard } from "../ui";

// A real (if simple) score computed from the account's own actual security
// signals — not a placeholder number. There's no threat-detection or
// anomaly-monitoring system behind this yet, so "Threat Alerts" below shows
// an honest empty state rather than fabricated data.
function computeScore(user: User): { score: number; recommendations: { label: string; href: string }[] } {
  let score = 40; // baseline: a hashed password is always in place
  const recommendations: { label: string; href: string }[] = [];

  if (user.email_verified) {
    score += 30;
  } else {
    recommendations.push({ label: "Verify your email address", href: "/verify-email" });
  }

  if (user.mfa_enabled) {
    score += 30;
  } else {
    recommendations.push({ label: "Enable multi-factor authentication", href: "/mfa-setup" });
  }

  return { score, recommendations };
}

export function SecurityCenterSection({ user }: { user: User }) {
  const { score, recommendations } = computeScore(user);
  const tone = score >= 90 ? "#0ca30c" : score >= 60 ? "#fab219" : "#d03b3b";

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Security Score" description="Based on your account's current security settings.">
        <div className="flex items-center gap-5">
          <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0 -rotate-90">
            <circle cx="36" cy="36" r="30" fill="none" stroke="var(--dash-surface-raised)" strokeWidth="8" />
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke={tone}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 2 * Math.PI * 30} ${2 * Math.PI * 30}`}
            />
          </svg>
          <div>
            <p className="text-2xl font-semibold" style={{ color: tone }}>
              {score}
              <span className="text-sm text-[var(--dash-ink-muted)]">/100</span>
            </p>
            <p className="text-sm text-[var(--dash-ink-muted)]">
              {recommendations.length === 0
                ? "All available protections are enabled."
                : `${recommendations.length} recommendation${recommendations.length > 1 ? "s" : ""} below.`}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Recommendations">
        {recommendations.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-[var(--dash-ink-secondary)]">
            <CheckCircle2 className="h-4 w-4" style={{ color: "#0ca30c" }} />
            Nothing to fix right now.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {recommendations.map((rec) => (
              <li key={rec.href}>
                <Link
                  href={rec.href}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-[var(--dash-surface-raised)]"
                  style={{ borderColor: "var(--dash-border)" }}
                >
                  <span className="flex items-center gap-2 text-[var(--dash-ink)]">
                    <ShieldAlert className="h-4 w-4" style={{ color: "#fab219" }} />
                    {rec.label}
                  </span>
                  <span style={{ color: "var(--accent)" }}>Fix now →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Threat Alerts" description="No monitoring system is wired up yet — this will surface real alerts once one is.">
        <div className="flex items-center gap-2 text-sm text-[var(--dash-ink-muted)]">
          <CheckCircle2 className="h-4 w-4" style={{ color: "#0ca30c" }} />
          No threats detected.
        </div>
      </SectionCard>
    </div>
  );
}
