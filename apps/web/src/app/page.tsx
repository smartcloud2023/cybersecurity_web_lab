import Link from "next/link";
import {
  ArrowRight,
  Award,
  Fingerprint,
  GraduationCap,
  Network,
  Radar,
  Sparkles,
  Target,
} from "lucide-react";
import { HeroIllustration } from "@/components/marketing/hero-illustration";

const pathways = [
  {
    name: "Foundation",
    detail: "Linux, networking, HTTP, DNS, the command line.",
    icon: GraduationCap,
  },
  {
    name: "Intermediate Web",
    detail: "Recon, authentication, SQLi, XSS, API abuse.",
    icon: Network,
  },
  {
    name: "Advanced Web",
    detail: "SSRF, JWT attacks, business logic, exploit chaining.",
    icon: Radar,
  },
];

const differentiators = [
  {
    title: "Proof that travels",
    detail:
      "Finish a lab and get a verifiable credential an employer can check independently — not another certificate PDF nobody looks at.",
    icon: Award,
  },
  {
    title: "An AI mentor that asks, not tells",
    detail:
      "Get a Socratic nudge grounded in what you've actually tried — never the answer.",
    icon: Sparkles,
  },
  {
    title: "Every session is unique",
    detail:
      "Labs are procedurally mutated per session, so a walkthrough for one student doesn't work for the next.",
    icon: Fingerprint,
  },
  {
    title: "Scored on methodology, not luck",
    detail:
      "Your technique, your written findings report, and your flag all factor into the score.",
    icon: Target,
  },
];

export default function Home() {
  return (
    <div className="dash bg-[var(--dash-page)] text-[var(--dash-ink)]">
      <section className="relative overflow-hidden border-b border-[var(--dash-border)]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 85% 0%, var(--accent-soft) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 sm:py-24 lg:grid-cols-2 lg:py-28">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Practical cybersecurity training
            </span>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              We provide the best hands-on cybersecurity training.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-[var(--dash-ink-secondary)]">
              Launch an isolated lab, work through a guided exercise, and
              prove what you can do — with a mentor, a score that means
              something, and a credential that outlives any single platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/labs"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--dash-border)] px-5 py-2.5 text-sm font-semibold text-[var(--dash-ink)] transition hover:bg-[var(--dash-surface-raised)]"
              >
                Browse labs
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {["Mutated per session", "AI Socratic mentor", "Verifiable credential"].map(
                (label) => (
                  <span
                    key={label}
                    className="rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-1.5 text-xs font-medium text-[var(--dash-ink-secondary)]"
                  >
                    {label}
                  </span>
                ),
              )}
            </div>
          </div>

          <HeroIllustration />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--dash-ink-muted)]">
          Learning pathways
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {pathways.map((pathway) => (
            <div
              key={pathway.name}
              className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 transition hover:border-[var(--accent)]/40"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--accent-soft)" }}
              >
                <pathway.icon className="h-4.5 w-4.5" style={{ color: "var(--accent)" }} />
              </span>
              <h3 className="mt-4 font-medium">{pathway.name}</h3>
              <p className="mt-1 text-sm text-[var(--dash-ink-muted)]">{pathway.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-12 pb-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--dash-ink-muted)]">
          Why CyberLab
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {differentiators.map((item) => (
            <div
              key={item.title}
              className="flex gap-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 transition hover:border-[var(--accent)]/40"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--accent-soft)" }}
              >
                <item.icon className="h-4.5 w-4.5" style={{ color: "var(--accent)" }} />
              </span>
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="mt-1 text-sm text-[var(--dash-ink-muted)]">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-12 pb-24">
        <div
          className="flex flex-col items-center gap-5 rounded-2xl border border-[var(--dash-border)] px-8 py-14 text-center"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, var(--accent-soft) 0%, var(--dash-surface) 70%)",
          }}
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to prove what you can do?
          </h2>
          <p className="max-w-md text-sm text-[var(--dash-ink-secondary)]">
            Create a free account and launch your first mutated lab in
            minutes — no credit card required.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
