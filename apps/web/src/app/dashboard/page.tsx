import Link from "next/link";
import { FlaskConical, Trophy, Activity, BadgeCheck } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { LabsStatusDonut } from "@/components/dashboard/charts/labs-status-donut";
import { ScoreTrendChart } from "@/components/dashboard/charts/score-trend-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

// Placeholder data — replace with a call to GET /api/me, /api/progress,
// and /api/lab-sessions/{active} once the backend is wired up.
const student = { name: "Student" };
const activeLab = { title: "WEB001 — Recon & Exploitation", status: "Active", expiresIn: "42 min" };
const nextLesson = { slug: "web001", title: "WEB001 — Recon & Exploitation" };

export default function DashboardPage() {
  return (
    <div className="dash flex min-h-screen flex-col bg-[var(--dash-page)] text-[var(--dash-ink)]">
      <Topbar title="Dashboard" breadcrumb={`Welcome back, ${student.name}`} />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Labs completed" value="2" delta="+1 this week" icon={Trophy} />
          <StatCard label="Active sessions" value="1" icon={FlaskConical} />
          <StatCard label="Avg. tradecraft score" value="74" delta="+12" icon={Activity} />
          <StatCard label="Credentials earned" value="0" icon={BadgeCheck} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ScoreTrendChart />
          <LabsStatusDonut />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>

          <div className="flex flex-col gap-4">
            <div className="dash rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
              <h2 className="text-sm font-medium text-[var(--dash-ink-secondary)]">
                Active lab
              </h2>
              <p className="mt-2 font-medium">{activeLab.title}</p>
              <p className="text-xs text-[var(--dash-ink-muted)]">
                {activeLab.status} · expires in {activeLab.expiresIn}
              </p>
              <Link
                href={`/labs/${nextLesson.slug}`}
                className="mt-3 inline-block rounded-md px-3 py-1.5 text-xs font-medium"
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
              >
                Resume lab
              </Link>
            </div>

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
