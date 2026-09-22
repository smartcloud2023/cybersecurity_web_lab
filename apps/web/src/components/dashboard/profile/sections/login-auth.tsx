"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, LifeBuoy, ShieldCheck } from "lucide-react";
import { changePassword, mfaDisable, type User } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Badge, Field, SaveButton, SectionCard, inputClass, inputStyle } from "../ui";
import { ComingSoon } from "../coming-soon";

export function LoginAuthSection({
  user,
  token,
  onUpdated,
}: {
  user: User;
  token: string;
  onUpdated: (user: User) => void;
}) {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const [disablingMfa, setDisablingMfa] = useState(false);
  const [mfaPassword, setMfaPassword] = useState("");
  const [mfaSaving, setMfaSaving] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);

  async function handlePasswordSave() {
    setPwSaving(true);
    setPwError(null);
    setPwSaved(false);
    try {
      await changePassword(token, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setPwSaved(true);
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : "Couldn't change password.");
    } finally {
      setPwSaving(false);
    }
  }

  async function handleMfaDisable() {
    setMfaSaving(true);
    setMfaError(null);
    try {
      await mfaDisable(token, mfaPassword);
      onUpdated({ ...user, mfa_enabled: false });
      setDisablingMfa(false);
      setMfaPassword("");
    } catch (err) {
      setMfaError(err instanceof ApiError ? err.message : "Couldn't disable MFA.");
    } finally {
      setMfaSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Password">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Current password">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              style={inputStyle}
              autoComplete="current-password"
            />
          </Field>
          <Field label="New password">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              style={inputStyle}
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
        </div>
        {pwError && <p className="mt-3 text-sm text-red-400">{pwError}</p>}
        <SaveButton
          onClick={handlePasswordSave}
          saving={pwSaving}
          saved={pwSaved}
          label="Change password"
          disabled={currentPassword.length === 0 || newPassword.length < 8}
        />
      </SectionCard>

      <SectionCard title="Multi-factor authentication">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" style={{ color: "var(--accent)" }} />
            {user.mfa_enabled ? <Badge tone="good">Enabled</Badge> : <Badge tone="warn">Disabled</Badge>}
          </div>
          {user.mfa_enabled ? (
            !disablingMfa && (
              <button
                type="button"
                onClick={() => setDisablingMfa(true)}
                className="rounded-lg border px-3 py-1.5 text-sm text-[var(--dash-ink-secondary)] hover:text-[var(--dash-ink)]"
                style={{ borderColor: "var(--dash-border)" }}
              >
                Disable MFA
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => router.push("/mfa-setup")}
              className="rounded-lg px-3 py-1.5 text-sm font-medium"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
            >
              Set up MFA
            </button>
          )}
        </div>

        {disablingMfa && (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border p-3" style={{ borderColor: "var(--dash-border)" }}>
            <Field label="Confirm your password to disable MFA">
              <input
                type="password"
                value={mfaPassword}
                onChange={(e) => setMfaPassword(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </Field>
            {mfaError && <p className="text-sm text-red-400">{mfaError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleMfaDisable}
                disabled={mfaSaving || mfaPassword.length === 0}
                className="rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: "#d03b3b", color: "#ffffff" }}
              >
                {mfaSaving ? "Disabling…" : "Confirm disable"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDisablingMfa(false);
                  setMfaPassword("");
                  setMfaError(null);
                }}
                className="rounded-lg border px-3 py-1.5 text-sm text-[var(--dash-ink-secondary)]"
                style={{ borderColor: "var(--dash-border)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Passkeys">
        <ComingSoon
          icon={Fingerprint}
          title="Passkeys aren't set up yet"
          description="Passwordless sign-in with your device's biometrics or security key is planned but not built yet."
        />
      </SectionCard>

      <SectionCard title="Recovery">
        {user.email_verified ? (
          <p className="text-sm text-[var(--dash-ink-secondary)]">
            Your verified email address ({user.email}) is your current recovery method.
          </p>
        ) : (
          <ComingSoon
            icon={LifeBuoy}
            title="No recovery method set up"
            description="Verify your email to use it as a recovery method. Backup codes and a recovery phone are planned but not built yet."
            linkHref="/verify-email"
            linkLabel="Verify your email"
          />
        )}
      </SectionCard>
    </div>
  );
}
