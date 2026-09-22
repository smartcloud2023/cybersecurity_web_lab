import { apiFetch } from "@/lib/api";

export type UserRole = "student" | "instructor" | "admin";

// Field names match the API's JSON wire format directly (snake_case) —
// there's no transform layer, so what the backend returns is what the type
// says. All the profile fields are optional: filled in later from the
// profile page, not required at signup.
export type User = {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  x_url?: string | null;
  website_url?: string | null;
  email_verified: boolean;
  mfa_enabled: boolean;
  created_at: string;
};

export type ProfileUpdate = Partial<
  Pick<
    User,
    | "first_name"
    | "last_name"
    | "bio"
    | "avatar_url"
    | "github_url"
    | "linkedin_url"
    | "facebook_url"
    | "instagram_url"
    | "x_url"
    | "website_url"
  >
>;

type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

// Discriminated on mfa_required, mirroring the API's LoginResponse.
type LoginResponse =
  | { mfa_required: false; access_token: string; token_type: string; user: User }
  | { mfa_required: true; pending_token: string };

export type LoginResult =
  | { mfaRequired: false; user: User }
  | { mfaRequired: true; pendingToken: string };

const STORAGE_KEY = "cyberlab-token";

function readStoredToken(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

// Same external-store pattern as lib/theme.ts, for the same reason:
// useSyncExternalStore instead of setState-in-effect, with one shared
// module-level value so every component (nav, sidebar, guards) reads and
// updates the same token without prop-drilling.
let currentToken: string | null | undefined = undefined; // undefined = not yet read
const listeners = new Set<() => void>();

export function getTokenSnapshot(): string | null {
  if (currentToken === undefined) {
    currentToken = readStoredToken();
  }
  return currentToken;
}

// undefined here (as opposed to getTokenSnapshot's string | null) means "not
// checked yet" — deliberately distinct from null ("checked, no token
// found"). The very first client render after a full page load must match
// whatever the server rendered, and the server can't read localStorage, so
// callers that gate a redirect on "definitely no token" (see useCurrentUser)
// need to tell that apart from "haven't looked yet".
export function getServerTokenSnapshot(): string | null | undefined {
  return undefined;
}

export function subscribeToken(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Nothing about localStorage "changes" right after hydration to prompt a
// re-check on its own. Call this once after mount to force one — belt and
// suspenders alongside React's own post-mount snapshot re-check.
export function recheckToken() {
  currentToken = readStoredToken();
  listeners.forEach((l) => l());
}

function setToken(token: string | null) {
  currentToken = token;
  try {
    if (token) window.localStorage.setItem(STORAGE_KEY, token);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best-effort only.
  }
  listeners.forEach((l) => l());
}

export function logout() {
  setToken(null);
}

export async function register(email: string, password: string): Promise<User> {
  const data = await apiFetch<TokenResponse>("/api/auth/register", {
    method: "POST",
    body: { email, password },
  });
  setToken(data.access_token);
  return data.user;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const data = await apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (data.mfa_required) {
    return { mfaRequired: true, pendingToken: data.pending_token };
  }
  setToken(data.access_token);
  return { mfaRequired: false, user: data.user };
}

export async function mfaVerify(pendingToken: string, code: string): Promise<User> {
  const data = await apiFetch<TokenResponse>("/api/auth/mfa/verify", {
    method: "POST",
    body: { pending_token: pendingToken, code },
  });
  setToken(data.access_token);
  return data.user;
}

export async function fetchCurrentUser(token: string): Promise<User> {
  return apiFetch<User>("/api/me", { token });
}

export async function updateProfile(token: string, patch: ProfileUpdate): Promise<User> {
  return apiFetch<User>("/api/me", { method: "PATCH", token, body: patch });
}

export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await apiFetch<void>("/api/auth/change-password", {
    method: "POST",
    token,
    body: { current_password: currentPassword, new_password: newPassword },
  });
}

export async function verifyEmail(token: string, code: string): Promise<User> {
  return apiFetch<User>("/api/auth/verify-email", { method: "POST", token, body: { code } });
}

export async function resendVerification(token: string): Promise<void> {
  await apiFetch<void>("/api/auth/resend-verification", { method: "POST", token });
}

export async function mfaSetup(token: string): Promise<{ secret: string; otpauthUri: string }> {
  const data = await apiFetch<{ secret: string; otpauth_uri: string }>("/api/auth/mfa/setup", {
    method: "POST",
    token,
  });
  return { secret: data.secret, otpauthUri: data.otpauth_uri };
}

export async function mfaConfirm(token: string, code: string): Promise<User> {
  return apiFetch<User>("/api/auth/mfa/confirm", { method: "POST", token, body: { code } });
}

export async function mfaDisable(token: string, password: string): Promise<void> {
  await apiFetch<void>("/api/auth/mfa/disable", { method: "POST", token, body: { password } });
}
