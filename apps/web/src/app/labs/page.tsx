import Link from "next/link";
import { Card } from "@/components/card";

// Placeholder catalogue — replace with a call to GET /api/labs.
const labs = [
  {
    slug: "web001",
    title: "WEB001 — Recon & Exploitation",
    level: "Beginner",
    duration: "30–60 min",
  },
];

export default function LabsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Lab catalogue</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {labs.map((lab) => (
          <Card key={lab.slug} title={lab.level}>
            <p className="font-medium">{lab.title}</p>
            <p className="text-sm text-black/60 dark:text-white/60">
              {lab.duration}
            </p>
            <Link
              href={`/labs/${lab.slug}`}
              className="mt-2 inline-block text-sm underline underline-offset-4"
            >
              View lab
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
