import { apiFetch } from "@/lib/api";
import { applyExternalToken, type User } from "@/lib/auth";

export type Session = {
  id: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  last_seen_at: string;
  is_current: boolean;
};

export async function listSessions(token: string): Promise<Session[]> {
  return apiFetch<Session[]>("/api/me/sessions", { token });
}

export async function revokeSession(token: string, id: string): Promise<void> {
  await apiFetch<void>(`/api/me/sessions/${id}`, { method: "DELETE", token });
}

export async function revokeOtherSessions(token: string): Promise<void> {
  await apiFetch<void>("/api/me/sessions/revoke-others", { method: "POST", token });
}

export type AuditEvent = {
  id: string;
  action: string;
  object: string;
  timestamp: string;
};

export async function listAuditEvents(token: string): Promise<AuditEvent[]> {
  return apiFetch<AuditEvent[]>("/api/me/audit-events", { token });
}

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
};

export type ApiKeyCreated = ApiKey & { key: string };

export async function listApiKeys(token: string): Promise<ApiKey[]> {
  return apiFetch<ApiKey[]>("/api/me/api-keys", { token });
}

export async function createApiKey(token: string, name: string): Promise<ApiKeyCreated> {
  return apiFetch<ApiKeyCreated>("/api/me/api-keys", {
    method: "POST",
    token,
    body: { name },
  });
}

export async function revokeApiKey(token: string, id: string): Promise<void> {
  await apiFetch<void>(`/api/me/api-keys/${id}`, { method: "DELETE", token });
}

export type Passkey = {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
};

export async function listPasskeys(token: string): Promise<Passkey[]> {
  return apiFetch<Passkey[]>("/api/me/passkeys", { token });
}

export async function deletePasskey(token: string, id: string): Promise<void> {
  await apiFetch<void>(`/api/me/passkeys/${id}`, { method: "DELETE", token });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- opaque WebAuthn JSON options, shaped by the server and passed straight to @simplewebauthn/browser
type WebAuthnOptionsJSON = any;

export async function passkeyRegistrationOptions(
  token: string
): Promise<{ challengeToken: string; optionsJSON: WebAuthnOptionsJSON }> {
  const data = await apiFetch<{ challenge_token: string; options: WebAuthnOptionsJSON }>(
    "/api/auth/passkeys/register/options",
    { method: "POST", token }
  );
  return { challengeToken: data.challenge_token, optionsJSON: data.options };
}

export async function passkeyRegistrationVerify(
  token: string,
  challengeToken: string,
  name: string,
  credential: WebAuthnOptionsJSON
): Promise<Passkey> {
  return apiFetch<Passkey>("/api/auth/passkeys/register/verify", {
    method: "POST",
    token,
    body: { challenge_token: challengeToken, name, credential },
  });
}

export async function passkeyLoginOptions(
  email: string
): Promise<{ challengeToken: string; optionsJSON: WebAuthnOptionsJSON }> {
  const data = await apiFetch<{ challenge_token: string; options: WebAuthnOptionsJSON }>(
    "/api/auth/passkeys/login/options",
    { method: "POST", body: { email } }
  );
  return { challengeToken: data.challenge_token, optionsJSON: data.options };
}

export async function passkeyLoginVerify(
  challengeToken: string,
  credential: WebAuthnOptionsJSON
): Promise<User> {
  const data = await apiFetch<{ access_token: string; token_type: string; user: User }>(
    "/api/auth/passkeys/login/verify",
    { method: "POST", body: { challenge_token: challengeToken, credential } }
  );
  applyExternalToken(data.access_token);
  return data.user;
}
