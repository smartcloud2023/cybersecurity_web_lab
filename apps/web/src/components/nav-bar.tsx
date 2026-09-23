"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldHalf } from "lucide-react";
import { useAuthToken } from "@/hooks/use-auth";

const links = [
  { href: "/labs", label: "Labs" },
  { href: "/pricing", label: "Pricing" },
];

export function NavBar() {
  const pathname = usePathname();
  const token = useAuthToken();
  // The dashboard has its own sidebar/topbar shell (see app/dashboard) —
  // the marketing nav doesn't sit above it.
  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <header className="dash sticky top-0 z-40 border-b border-[var(--dash-border)] bg-[var(--dash-page)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--accent-soft)" }}
          >
            <ShieldHalf className="h-4 w-4" style={{ color: "var(--accent)" }} />
          </span>
          <span className="text-base font-semibold tracking-tight text-[var(--dash-ink)]">
            CyberLab
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[var(--dash-ink-secondary)] transition hover:text-[var(--dash-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {token ? (
            <Link
              href="/dashboard"
              className="rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-[var(--dash-ink-secondary)] transition hover:text-[var(--dash-ink)] sm:inline-block"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90"
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
