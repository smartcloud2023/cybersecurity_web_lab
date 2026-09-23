"use client";

import { useState } from "react";
import {
  User as UserIcon,
  Image as ImageIcon,
  KeyRound,
  ShieldCheck,
  Laptop,
  Link2,
  Code2,
  Users,
  ScrollText,
  Lock,
  SlidersHorizontal,
  Award,
  LifeBuoy,
} from "lucide-react";
import { useAuthToken, useCurrentUser } from "@/hooks/use-auth";
import { PersonalInfoSection } from "./sections/personal-info";
import { SocialIdentitySection } from "./sections/social-identity";
import { LoginAuthSection } from "./sections/login-auth";
import { SecurityCenterSection } from "./sections/security-center";
import { DevicesSessionsSection } from "./sections/devices-sessions";
import { AuditLogSection } from "./sections/audit-log";
import { ApiKeysSection } from "./sections/api-keys";
import { RolesPermissionsSection } from "./sections/roles-permissions";
import { PreferencesSection } from "./sections/preferences";
import { CyberProfileSection } from "./sections/cyber-profile";
import { ComingSoon } from "./coming-soon";
import { SectionCard } from "./ui";

type SectionId =
  | "personal"
  | "social"
  | "login-auth"
  | "security-center"
  | "devices"
  | "connected-apps"
  | "api-keys"
  | "roles"
  | "audit"
  | "privacy"
  | "preferences"
  | "cyber-profile"
  | "recovery";

const NAV: { id: SectionId; label: string; icon: typeof UserIcon }[] = [
  { id: "personal", label: "Personal Information", icon: UserIcon },
  { id: "social", label: "Profile & Social Identity", icon: ImageIcon },
  { id: "login-auth", label: "Login & Authentication", icon: KeyRound },
  { id: "security-center", label: "Security Center", icon: ShieldCheck },
  { id: "devices", label: "Devices & Sessions", icon: Laptop },
  { id: "connected-apps", label: "Connected Applications", icon: Link2 },
  { id: "api-keys", label: "API Keys & Tokens", icon: Code2 },
  { id: "roles", label: "Roles & Permissions", icon: Users },
  { id: "audit", label: "Activity & Audit Logs", icon: ScrollText },
  { id: "privacy", label: "Privacy & Consent", icon: Lock },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "cyber-profile", label: "Cybersecurity Profile", icon: Award },
  { id: "recovery", label: "Recovery & Emergency", icon: LifeBuoy },
];

export function ProfileShell() {
  const [active, setActive] = useState<SectionId>("personal");
  const token = useAuthToken();
  const { user, setUser } = useCurrentUser();

  if (!user || !token) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--dash-ink-muted)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <nav className="flex shrink-0 gap-1 overflow-x-auto pb-2 lg:w-64 lg:flex-col lg:overflow-visible lg:pb-0">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              aria-current={isActive ? "page" : undefined}
              className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors lg:whitespace-normal"
              style={
                isActive ? { backgroundColor: "var(--accent-soft)", color: "var(--accent)" } : undefined
              }
            >
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: isActive ? "var(--accent)" : "var(--dash-ink-muted)" }}
              />
              <span className={isActive ? "font-medium" : "text-[var(--dash-ink-secondary)]"}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="min-w-0 flex-1">
        {active === "personal" && (
          <PersonalInfoSection user={user} token={token} onUpdated={setUser} />
        )}
        {active === "social" && (
          <SocialIdentitySection user={user} token={token} onUpdated={setUser} />
        )}
        {active === "login-auth" && (
          <LoginAuthSection user={user} token={token} onUpdated={setUser} />
        )}
        {active === "security-center" && <SecurityCenterSection user={user} />}
        {active === "devices" && <DevicesSessionsSection token={token} />}
        {active === "connected-apps" && (
          <SectionCard title="Connected Applications">
            <ComingSoon
              icon={Link2}
              title="No connected applications"
              description="There's nothing to connect to yet — this will list third-party apps you've authorized once that exists."
            />
          </SectionCard>
        )}
        {active === "api-keys" && <ApiKeysSection token={token} />}
        {active === "roles" && <RolesPermissionsSection user={user} />}
        {active === "audit" && <AuditLogSection token={token} />}
        {active === "privacy" && (
          <SectionCard title="Privacy & Consent">
            <ComingSoon
              icon={Lock}
              title="Nothing to configure yet"
              description="Consent and data-sharing controls will live here. For now, see our policies."
              linkHref="/privacy"
              linkLabel="Read the Privacy Policy"
            />
          </SectionCard>
        )}
        {active === "preferences" && <PreferencesSection />}
        {active === "cyber-profile" && <CyberProfileSection />}
        {active === "recovery" && (
          <SectionCard title="Recovery & Emergency">
            <ComingSoon
              icon={LifeBuoy}
              title="Not built yet"
              description="Backup recovery methods, account lock, and emergency controls (like signing out of every device) are planned but not built yet."
            />
          </SectionCard>
        )}
      </div>
    </div>
  );
}
