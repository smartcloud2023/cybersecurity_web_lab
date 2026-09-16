import { Card } from "@/components/card";

// Placeholder lab detail — replace with a call to GET /api/labs/{lab_id}.
export default async function LabDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight uppercase">
        {slug}
      </h1>
      <p className="mt-2 text-black/60 dark:text-white/60">
        Objectives, difficulty, duration, and hints will load here once the
        lab catalogue API is wired up.
      </p>
      <div className="mt-8">
        <Card title="Launch">
          <button
            disabled
            className="rounded-md bg-foreground px-4 py-2 text-background opacity-50"
          >
            Launch lab
          </button>
          <p className="mt-2 text-xs text-black/50 dark:text-white/50">
            Disabled until POST /api/labs/{"{lab_id}"}/launch is implemented.
          </p>
        </Card>
      </div>
    </div>
  );
}
