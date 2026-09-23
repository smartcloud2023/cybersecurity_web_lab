import Link from "next/link";
import { Topbar } from "@/components/dashboard/topbar";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { LabsStatusDonut } from "@/components/dashboard/charts/labs-status-donut";
import { ScoreTrendChart } from "@/components/dashboard/charts/score-trend-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ActiveLabCard } from "@/components/dashboard/active-lab-card";

const student = { name: "Student" };

export default function DashboardPage() {
  return (
    <div className="dash flex min-h-screen flex-col bg-[var(--dash-page)] text-[var(--dash-ink)]">
      <Topbar title="Dashboard" breadcrumb={`Welcome back, ${student.name}`} />

      <div className="flex-1 space-y-6 p-6">
        <DashboardStats />

        <div className="grid gap-4 lg:grid-cols-2">
          <ScoreTrendChart />
          <LabsStatusDonut />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>

          <div className="flex flex-col gap-4">
            <ActiveLabCard />

            <div className="dash rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
              <h2 className="text-sm font-medium text-[var(--dash-ink-secondary)]">
                Skills passport
              </h2>
              <p className="mt-2 text-xs text-[var(--dash-ink-muted)]">
                No credentials issued yet.
              </p>
              <Link
                href="/passport"
                className="mt-3 inline-block text-xs underline underline-offset-4 text-[var(--dash-ink-secondary)]"
              >
                View passport
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
