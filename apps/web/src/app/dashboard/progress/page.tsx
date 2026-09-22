import { Topbar } from "@/components/dashboard/topbar";

// Placeholder — replace with GET /api/progress once labs are launched.
export default function ProgressPage() {
  return (
    <div className="dash flex min-h-screen flex-col bg-[var(--dash-page)] text-[var(--dash-ink)]">
      <Topbar title="Progress" breadcrumb="Your learning path" />
      <div className="flex-1 p-6">
        <div className="dash rounded-xl border border-dashed border-[var(--dash-border)] p-8 text-center text-sm text-[var(--dash-ink-muted)]">
          Pathway progress will appear here once labs are launched.
        </div>
      </div>
    </div>
  );
}
