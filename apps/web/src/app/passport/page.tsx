// Placeholder — replace with a call to GET /api/credentials.
export default function PassportPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        Skills passport
      </h1>
      <p className="mt-2 text-black/60 dark:text-white/60">
        Verifiable credentials you've earned will be listed here, each with a
        link a third party can use to independently verify it.
      </p>
      <div className="mt-8 rounded-lg border border-dashed border-black/15 p-8 text-center text-sm text-black/50 dark:border-white/15 dark:text-white/50">
        No credentials issued yet.
      </div>
    </div>
  );
}
