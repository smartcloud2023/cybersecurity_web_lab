import { redirect } from "next/navigation";

// Superseded by /dashboard/profile (Preferences section covers appearance,
// alongside the rest of the account/security IA). Kept as a redirect so old
// links/bookmarks still land somewhere.
export default function SettingsPage() {
  redirect("/dashboard/profile");
}
