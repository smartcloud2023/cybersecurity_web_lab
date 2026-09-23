import { apiFetch } from "@/lib/api";

export type LabLevel = "beginner" | "intermediate" | "advanced";

export type Lab = {
  id: string;
  slug: string;
  title: string;
  level: LabLevel;
  summary: string | null;
};

export type LabStep = {
  id: string;
  sequence: number;
  instruction: string;
  points: number;
};

export type LabDetail = Lab & { steps: LabStep[] };

export type LabSessionStatus =
  | "requested"
  | "provisioning"
  | "ready"
  | "active"
  | "expired"
  | "destroying"
  | "destroyed"
  | "failed";

export type LabSession = {
  id: string;
  lab_id: string;
  lab_slug: string;
  status: LabSessionStatus;
  connection_info: string | null;
  expires_at: string | null;
  last_active_at: string | null;
  created_at: string;
};

export async function listLabs(): Promise<Lab[]> {
  return apiFetch<Lab[]>("/api/labs");
}

export async function getLab(slug: string): Promise<LabDetail> {
  return apiFetch<LabDetail>(`/api/labs/${slug}`);
}

export async function launchLab(token: string, slug: string): Promise<LabSession> {
  return apiFetch<LabSession>(`/api/labs/${slug}/launch`, { method: "POST", token });
}

export async function getSession(token: string, id: string): Promise<LabSession> {
  return apiFetch<LabSession>(`/api/lab-sessions/${id}`, { token });
}

export async function sendHeartbeat(token: string, id: string): Promise<LabSession> {
  return apiFetch<LabSession>(`/api/lab-sessions/${id}/heartbeat`, { method: "POST", token });
}

export async function stopSession(token: string, id: string): Promise<LabSession> {
  return apiFetch<LabSession>(`/api/lab-sessions/${id}/stop`, { method: "POST", token });
}

export async function submitFlag(token: string, id: string, flag: string): Promise<void> {
  await apiFetch<void>(`/api/lab-sessions/${id}/submit-flag`, {
    method: "POST",
    token,
    body: { flag },
  });
}

export async function listMySessions(token: string): Promise<LabSession[]> {
  return apiFetch<LabSession[]>("/api/me/lab-sessions", { token });
}
