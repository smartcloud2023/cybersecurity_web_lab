"use client";

import { useState } from "react";
import { updateProfile, type User } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Badge, Field, SaveButton, SectionCard, inputClass, inputStyle } from "../ui";

export function PersonalInfoSection({
  user,
  token,
  onUpdated,
}: {
  user: User;
  token: string;
  onUpdated: (user: User) => void;
}) {
  const [firstName, setFirstName] = useState(user.first_name ?? "");
  const [lastName, setLastName] = useState(user.last_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateProfile(token, {
        first_name: firstName || null,
        last_name: lastName || null,
      });
      onUpdated(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const memberSince = new Date(user.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  return (
    <SectionCard title="Personal Information" description="Your name and basic account details.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
            style={inputStyle}
            maxLength={100}
          />
        </Field>
        <Field label="Last name">
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
            style={inputStyle}
            maxLength={100}
          />
        </Field>
        <Field label="Email">
          <div className="flex items-center gap-2">
            <input value={user.email} disabled className={`${inputClass} opacity-60`} style={inputStyle} />
            {user.email_verified ? (
              <Badge tone="good">Verified</Badge>
            ) : (
              <Badge tone="warn">Unverified</Badge>
            )}
          </div>
        </Field>
        <Field label="Member since">
          <input value={memberSince} disabled className={`${inputClass} opacity-60`} style={inputStyle} />
        </Field>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <SaveButton onClick={handleSave} saving={saving} saved={saved} />
    </SectionCard>
  );
}
