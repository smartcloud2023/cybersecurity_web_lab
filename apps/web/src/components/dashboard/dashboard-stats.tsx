"use client";

import { useEffect, useState } from "react";
import { Activity, BadgeCheck, FlaskConical, Trophy } from "lucide-react";
import { useAuthToken } from "@/hooks/use-auth";
import { StatCard } from "@/components/dashboard/stat-card";
import { getMyProgress, type ProgressItem } from "@/lib/progress";
import { listMySessions, type LabSession } from "@/lib/labs";

export function DashboardStats() {
  const token = useAuthToken();
  const [progress, setProgress] = useState<ProgressItem[] | null>(null);
  const [sessions, setSessions] = useState<LabSession[] | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    Promise.all([getMyProgress(token), listMySessions(token)])
      .then(([p, s]) => {
        if (!cancelled) {
          setProgress(p);
          setSessions(s);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProgress([]);
          setSessions([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const labsCompleted = progress?.filter((p) => p.status === "completed").length;
  const activeSessions = sessions?.length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Labs completed"
        value={labsCompleted === undefined ? "—" : String(labsCompleted)}
        icon={Trophy}
      />
      <StatCard
        label="Active sessions"
        value={activeSessions === undefined ? "—" : String(activeSessions)}
        icon={FlaskConical}
      />
      <StatCard label="Avg. tradecraft score" value="—" icon={Activity} />
      <StatCard label="Credentials earned" value="—" icon={BadgeCheck} />
    </div>
  );
}
