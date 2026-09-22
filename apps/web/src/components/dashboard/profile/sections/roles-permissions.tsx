import { Users } from "lucide-react";
import type { User } from "@/lib/auth";
import { Badge, SectionCard } from "../ui";

const ROLE_DESCRIPTIONS: Record<User["role"], string> = {
  student: "Can launch labs, submit findings, and track personal progress.",
  instructor: "Can additionally review student submissions and manage cohorts.",
  admin: "Full platform access, including user and lab management.",
};

export function RolesPermissionsSection({ user }: { user: User }) {
  return (
    <SectionCard
      title="Roles & Permissions"
      description="Your role controls what you can access. Role changes are made by an administrator, not from this page."
    >
      <div className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: "var(--dash-border)" }}>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--accent-soft)" }}
        >
          <Users className="h-4 w-4" style={{ color: "var(--accent)" }} />
        </span>
        <div>
          <Badge tone="neutral">
            <span className="capitalize">{user.role}</span>
          </Badge>
          <p className="mt-1 text-sm text-[var(--dash-ink-secondary)]">
            {ROLE_DESCRIPTIONS[user.role]}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
