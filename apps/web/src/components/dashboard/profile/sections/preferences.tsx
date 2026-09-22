import { ThemeSwitcher } from "@/components/dashboard/theme-switcher";
import { SectionCard } from "../ui";

export function PreferencesSection() {
  return (
    <SectionCard title="Appearance" description="Choose the dashboard's accent color. Ocean is the default.">
      <ThemeSwitcher />
    </SectionCard>
  );
}
