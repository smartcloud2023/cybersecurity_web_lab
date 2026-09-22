import { Topbar } from "@/components/dashboard/topbar";
import { ProfileShell } from "@/components/dashboard/profile/profile-shell";

export default function ProfilePage() {
  return (
    <div className="dash flex min-h-screen flex-col bg-[var(--dash-page)] text-[var(--dash-ink)]">
      <Topbar title="Profile" breadcrumb="Your account, security, and preferences" />
      <div className="flex-1 p-6">
        <ProfileShell />
      </div>
    </div>
  );
}
