"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { updateProfile, type ProfileUpdate, type User } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Field, SaveButton, SectionCard, inputClass, inputStyle } from "../ui";

const SOCIAL_FIELDS: { key: keyof ProfileUpdate; label: string; placeholder: string }[] = [
  { key: "github_url", label: "GitHub", placeholder: "https://github.com/username" },
  { key: "linkedin_url", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { key: "facebook_url", label: "Facebook", placeholder: "https://facebook.com/username" },
  { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/username" },
  { key: "x_url", label: "X", placeholder: "https://x.com/username" },
  { key: "website_url", label: "Personal website", placeholder: "https://example.com" },
];

export function SocialIdentitySection({
  user,
  token,
  onUpdated,
}: {
  user: User;
  token: string;
  onUpdated: (user: User) => void;
}) {
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [socials, setSocials] = useState<Record<string, string>>(
    Object.fromEntries(
      SOCIAL_FIELDS.map((f) => [f.key, (user[f.key] as string | null | undefined) ?? ""])
    )
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = (user.first_name?.[0] ?? user.email[0]).toUpperCase();

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const patch: ProfileUpdate = {
        avatar_url: avatarUrl || null,
        bio: bio || null,
        ...Object.fromEntries(SOCIAL_FIELDS.map((f) => [f.key, socials[f.key] || null])),
      };
      const updated = await updateProfile(token, patch);
      onUpdated(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Profile Picture" description="A URL to an image — file uploads aren't supported yet.">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element -- arbitrary external URL, not an optimizable local asset */
            <img
              src={avatarUrl}
              alt=""
              className="h-14 w-14 rounded-full border object-cover"
              style={{ borderColor: "var(--dash-border)" }}
            />
          ) : (
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold"
              style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {initials}
            </span>
          )}
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </SectionCard>

      <SectionCard title="Bio">
        <Field label={`${bio.length}/280`}>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 280))}
            rows={3}
            className={inputClass}
            style={inputStyle}
            placeholder="Tell other students a bit about yourself."
          />
        </Field>
      </SectionCard>

      <SectionCard title="Social Identity" description="Shown on your public profile, if you choose to make one public later.">
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIAL_FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 shrink-0 text-[var(--dash-ink-muted)]" />
                <input
                  value={socials[f.key]}
                  onChange={(e) => setSocials((s) => ({ ...s, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </Field>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <SaveButton onClick={handleSave} saving={saving} saved={saved} />
      </SectionCard>
    </div>
  );
}
