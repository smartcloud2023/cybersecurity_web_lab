import { Topbar } from "@/components/dashboard/topbar";
import { ThemeSwitcher } from "@/components/dashboard/theme-switcher";

export default function SettingsPage() {
  return (
    <div className="dash flex min-h-screen flex-col bg-[var(--dash-page)] text-[var(--dash-ink)]">
      <Topbar title="Settings" breadcrumb="Account and appearance" />
      <div className="flex-1 p-6">
        <div className="dash max-w-md rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
          <h2 className="text-sm font-medium text-[var(--dash-ink-secondary)]">
            Appearance
          </h2>
          <p className="mt-1 text-xs text-[var(--dash-ink-muted)]">
            Choose the dashboard&apos;s accent color. Ocean is the default.
          </p>
          <div className="mt-3">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
