"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  Trophy,
  BadgeCheck,
  CreditCard,
  Settings,
  ShieldHalf,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/labs", label: "Labs", icon: FlaskConical },
  { href: "/dashboard/progress", label: "Progress", icon: Trophy },
  { href: "/passport", label: "Skills Passport", icon: BadgeCheck },
  { href: "/pricing", label: "Billing", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="dash flex h-full w-64 shrink-0 flex-col border-r border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-ink)]">
      <div className="flex items-center gap-2 px-5 py-5">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--accent-soft)" }}
        >
          <ShieldHalf className="h-4.5 w-4.5" style={{ color: "var(--accent)" }} />
        </span>
        <span className="text-base font-semibold tracking-tight">CyberLab</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
              style={
                active
                  ? { backgroundColor: "var(--accent-soft)", color: "var(--accent)" }
                  : undefined
              }
            >
              <Icon
                className="h-4 w-4"
                style={{ color: active ? "var(--accent)" : "var(--dash-ink-muted)" }}
              />
              <span className={active ? "font-medium" : "text-[var(--dash-ink-secondary)]"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-[var(--dash-border)] px-3 py-4">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--dash-ink-secondary)] hover:text-[var(--dash-ink)]"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <div className="rounded-lg p-3" style={{ backgroundColor: "var(--accent-soft)" }}>
          <p className="text-xs font-medium" style={{ color: "var(--accent)" }}>
            Beginner trial — 7 days left
          </p>
          <p className="mt-1 text-xs text-[var(--dash-ink-secondary)]">
            Upgrade to Pro for more mentor hints and advanced labs.
          </p>
          <Link
            href="/pricing"
            className="mt-2 inline-block rounded-md px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
          >
            Upgrade plan
          </Link>
        </div>
      </div>
    </aside>
  );
}
