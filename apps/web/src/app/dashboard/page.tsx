import Link from "next/link";
import { Card } from "@/components/card";

// Placeholder data — replace with a call to GET /api/me, /api/progress,
// and /api/lab-sessions/{active} once the backend is wired up.
const student = { name: "Student", completedLabs: 0, totalLabs: 1 };
const activeLab = null as null | { title: string; status: string; expiresIn: string };
const nextLesson = { slug: "web001", title: "WEB001 — Recon & Exploitation" };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back, {student.name}
      </h1>
      <p className="mt-1 text-black/60 dark:text-white/60">
        {student.completedLabs} of {student.totalLabs} labs completed
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card title="Active lab">
          {activeLab ? (
            <div>
              <p className="font-medium">{activeLab.title}</p>
              <p className="text-sm text-black/60 dark:text-white/60">
                {activeLab.status} · expires in {activeLab.expiresIn}
              </p>
            </div>
          ) : (
            <p className="text-sm text-black/60 dark:text-white/60">
              No active session. Launch a lab to get started.
            </p>
          )}
        </Card>

        <Card title="Next up">
          <p className="font-medium">{nextLesson.title}</p>
          <Link
            href={`/labs/${nextLesson.slug}`}
            className="mt-2 inline-block text-sm underline underline-offset-4"
          >
            View lab
          </Link>
        </Card>

        <Card title="Skills passport">
          <p className="text-sm text-black/60 dark:text-white/60">
            No credentials issued yet.
          </p>
          <Link
            href="/passport"
            className="mt-2 inline-block text-sm underline underline-offset-4"
          >
            View passport
          </Link>
        </Card>
      </div>

      <div className="mt-8">
        <Card title="Progress">
          <p className="text-sm text-black/60 dark:text-white/60">
            Progress tracking will appear here once labs are launched.
          </p>
        </Card>
      </div>
    </div>
  );
}
