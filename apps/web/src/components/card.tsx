import type { ReactNode } from "react";

export function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-black/10 p-5 dark:border-white/10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-black/60 dark:text-white/60">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
