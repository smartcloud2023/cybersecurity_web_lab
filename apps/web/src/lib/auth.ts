import { apiFetch } from "@/lib/api";

export type UserRole = "student" | "instructor" | "admin";

export type User = {
  id: string;
  email: string;
  role: UserRole;
};

type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

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

export async function login(email: string, password: string): Promise<User> {
  const data = await apiFetch<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setToken(data.access_token);
  return data.user;
}

export async function fetchCurrentUser(token: string): Promise<User> {
  return apiFetch<User>("/api/me", { token });
}
