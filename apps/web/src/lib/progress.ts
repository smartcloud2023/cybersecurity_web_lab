import { apiFetch } from "@/lib/api";
import type { LabLevel, LabSessionStatus } from "@/lib/labs";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type ProgressItem = {
  lab_id: string;
  lab_slug: string;
  lab_title: string;
  level: LabLevel;
  status: ProgressStatus;
  score: number;
};

export type ActivityItem = {
  session_id: string;
  lab_slug: string;
  lab_title: string;
  status: LabSessionStatus;
  score: number | null;
  created_at: string;
};

export async function getMyProgress(token: string): Promise<ProgressItem[]> {
  return apiFetch<ProgressItem[]>("/api/progress", { token });
}

export async function getMyActivity(token: string, limit = 10): Promise<ActivityItem[]> {
  return apiFetch<ActivityItem[]>(`/api/me/activity?limit=${limit}`, { token });
}
