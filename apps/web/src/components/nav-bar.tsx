"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthToken } from "@/hooks/use-auth";

const links = [
  { href: "/dashboard", label: "Dashboard" },
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
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          CyberLab
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {token ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-foreground px-3 py-1.5 text-background hover:opacity-90"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-black/10 px-3 py-1.5 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-foreground px-3 py-1.5 text-background hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
