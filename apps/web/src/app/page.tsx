import Link from "next/link";

const pathways = [
  {
    name: "Foundation",
    detail: "Linux, networking, HTTP, DNS, the command line.",
  },
  {
    name: "Intermediate Web",
    detail: "Recon, authentication, SQLi, XSS, API abuse.",
  },
  {
    name: "Advanced Web",
    detail: "SSRF, JWT attacks, business logic, exploit chaining.",
  },
];

const differentiators = [
  {
    title: "Every session is unique",
    detail:
      "Labs are procedurally mutated per session, so a walkthrough for one student doesn't work for the next.",
  },
  {
    title: "An AI mentor that asks, not tells",
    detail:
      "Get a Socratic nudge grounded in what you've actually tried — never the answer.",
  },
  {
    title: "Scored on methodology, not luck",
    detail:
      "Your technique, your written findings report, and your flag all factor into the score.",
  },
  {
    title: "Proof that travels",
    detail:
      "Finish a lab and get a verifiable credential an employer can check independently.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">
          Learn penetration testing by actually doing it.
        </h1>
        <p className="mt-4 text-lg text-black/70 dark:text-white/70">
          Launch an isolated lab, work through a guided exercise, and prove
          what you can do — with a mentor, a score that means something, and
          a credential that outlives any single platform.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/register"
            className="rounded-md bg-foreground px-4 py-2 text-background hover:opacity-90"
          >
            Get started
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            View dashboard
          </Link>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-sm font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
          Learning pathways
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {pathways.map((pathway) => (
            <div
              key={pathway.name}
              className="rounded-lg border border-black/10 p-5 dark:border-white/10"
            >
              <h3 className="font-medium">{pathway.name}</h3>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                {pathway.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-sm font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
          Why CyberLab
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {differentiators.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-black/10 p-5 dark:border-white/10"
            >
              <h3 className="font-medium">{item.title}</h3>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
