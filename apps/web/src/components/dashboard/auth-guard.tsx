"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-auth";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useCurrentUser();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    // Covers both "loading" (avoids a flash of the dashboard before the
    // token check resolves) and "unauthenticated" (the effect above is
    // about to navigate away).
    return (
      <div className="dash flex min-h-screen items-center justify-center bg-[var(--dash-page)] text-sm text-[var(--dash-ink-muted)]">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
