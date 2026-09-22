import type { ReactNode } from "react";
import { ShieldHalf, Sparkles, Fingerprint } from "lucide-react";

// Shared split-panel layout for register/login/verify-email/mfa-setup — the
// dash-dark theme + selected accent color (see globals.css), not a fixed
// palette, so it always matches whatever the dashboard is set to.
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="dash flex min-h-screen items-center justify-center bg-[var(--dash-page)] px-4 py-10 text-[var(--dash-ink)]">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-2xl md:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-10 sm:px-12">
          <div className="mb-8 flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: "var(--accent-soft)" }}
            >
              <ShieldHalf className="h-4.5 w-4.5" style={{ color: "var(--accent)" }} />
            </span>
            <span className="text-base font-semibold tracking-tight">CyberLab</span>
          </div>

          {eyebrow && (
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--accent)" }}
            >
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-[var(--dash-ink-muted)]">{subtitle}</p>
          )}

          <div className="mt-7">{children}</div>

          {footer && (
            <div className="mt-6 text-sm text-[var(--dash-ink-secondary)]">{footer}</div>
          )}
        </div>

        <BrandPanel />
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <div
      className="relative hidden flex-col justify-between overflow-hidden p-8 md:flex"
      style={{
        background:
          "radial-gradient(120% 120% at 100% 0%, var(--accent) 0%, var(--dash-surface-raised) 55%, var(--dash-page) 100%)",
      }}
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
      >
        <defs>
          <pattern id="auth-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="white" strokeWidth="0.75" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
      </svg>

      <div className="relative flex justify-end">
        <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          cyberlab.io ↗
        </span>
      </div>

      <div className="relative">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
          <ShieldHalf className="h-7 w-7 text-white" />
        </div>
        <p className="mt-6 max-w-xs text-lg font-medium leading-snug text-white">
          &ldquo;Every lab is uniquely mutated — no shared answers, no static
          walkthroughs.&rdquo;
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Chip icon={Sparkles} label="AI Socratic mentor" />
          <Chip icon={Fingerprint} label="Verifiable skills passport" />
        </div>
      </div>
    </div>
  );
}

function Chip({
  icon: Icon,
  label,
}: {
  icon: typeof Sparkles;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
