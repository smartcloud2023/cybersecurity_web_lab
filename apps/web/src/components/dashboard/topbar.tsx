import { Bell } from "lucide-react";
import { ThemeSwitcher } from "@/components/dashboard/theme-switcher";

export function Topbar({
  title,
  breadcrumb,
}: {
  title: string;
  breadcrumb?: string;
}) {
  return (
    <header className="dash flex items-center justify-between border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-6 py-4 text-[var(--dash-ink)]">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {breadcrumb && (
          <p className="mt-0.5 text-xs text-[var(--dash-ink-muted)]">{breadcrumb}</p>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs text-[var(--dash-ink-muted)]">Theme</span>
          <ThemeSwitcher />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="rounded-full p-2 text-[var(--dash-ink-secondary)] hover:bg-[var(--dash-surface-raised)] hover:text-[var(--dash-ink)]"
        >
          <Bell className="h-4.5 w-4.5" />
        </button>

        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
            style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
          >
            ST
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium">Student</p>
            <p className="text-xs text-[var(--dash-ink-muted)]">Beginner plan</p>
          </div>
        </div>
      </div>
    </header>
  );
}
