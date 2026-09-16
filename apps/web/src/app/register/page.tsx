import Link from "next/link";

// Form is presentational only — wire up to POST /api/auth/register once the
// backend auth endpoint exists.
export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <form className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            name="email"
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/15"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            name="password"
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/15"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-background hover:opacity-90"
        >
          Sign up
        </button>
      </form>
      <p className="mt-4 text-sm text-black/60 dark:text-white/60">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
