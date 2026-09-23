"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink, Flag, ShieldHalf, Square } from "lucide-react";
import { useAuthToken } from "@/hooks/use-auth";
import {
  getLab,
  getSession,
  launchLab,
  listMySessions,
  sendHeartbeat,
  stopSession,
  submitFlag,
  type LabDetail,
  type LabSession,
} from "@/lib/labs";
import { ApiError } from "@/lib/api";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const HEARTBEAT_INTERVAL_MS = 30_000;
const POLL_INTERVAL_MS = 10_000;
const IDLE_TIMEOUT_MINUTES = 10;

const LIVE_STATUSES = new Set(["requested", "provisioning", "ready", "active"]);

function idleSecondsRemaining(session: LabSession): number {
  if (!session.last_active_at) return IDLE_TIMEOUT_MINUTES * 60;
  const elapsedMs = Date.now() - new Date(session.last_active_at).getTime();
  return Math.max(0, IDLE_TIMEOUT_MINUTES * 60 - Math.floor(elapsedMs / 1000));
}

function formatMinutesSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LabDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const token = useAuthToken();

  const [lab, setLab] = useState<LabDetail | null>(null);
  const [labError, setLabError] = useState<string | null>(null);

  const [session, setSession] = useState<LabSession | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const [flag, setFlag] = useState("");
  const [flagError, setFlagError] = useState<string | null>(null);
  const [flagSuccess, setFlagSuccess] = useState(false);
  const [submittingFlag, setSubmittingFlag] = useState(false);

  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLab(params.slug)
      .then((l) => {
        if (!cancelled) setLab(l);
      })
      .catch((err) => {
        if (!cancelled) setLabError(err instanceof ApiError ? err.message : "Lab not found.");
      });
    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  // Resume an already-running session for this lab on page load, without
  // requiring the student to click Launch again.
  useEffect(() => {
    if (!token || !lab) return;
    let cancelled = false;
    listMySessions(token)
      .then((sessions) => {
        const existing = sessions.find((s) => s.lab_id === lab.id);
        if (existing && !cancelled) setSession(existing);
      })
      .catch(() => {
        // No existing session is not an error condition worth surfacing.
      });
    return () => {
      cancelled = true;
    };
  }, [token, lab]);

  // Heartbeat: keeps the session out of the idle-timeout reaper's reach
  // for as long as this page stays open. Stop navigating away (or closing
  // the tab) and the 10-minute idle timer starts running for real.
  useEffect(() => {
    if (!token || !session || !LIVE_STATUSES.has(session.status)) return;
    const interval = setInterval(() => {
      sendHeartbeat(token, session.id)
        .then(setSession)
        .catch(() => {
          // A failed heartbeat (e.g. session already reaped) will surface
          // on the next status poll below instead.
        });
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [token, session]);

  // Status poll: catches state changes from outside this tab — the
  // background reaper destroying an idle session, or the hard duration
  // cap expiring.
  useEffect(() => {
    if (!token || !session || !LIVE_STATUSES.has(session.status)) return;
    const interval = setInterval(() => {
      getSession(token, session.id)
        .then(setSession)
        .catch(() => {});
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [token, session]);

  // Forces a re-render every second so the idle countdown ticks visibly
  // between the 10s status polls above.
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunch = useCallback(async () => {
    if (!token) {
      router.push(`/login?next=/labs/${params.slug}`);
      return;
    }
    setLaunching(true);
    setLaunchError(null);
    try {
      const s = await launchLab(token, params.slug);
      setSession(s);
      setFlag("");
      setFlagSuccess(false);
      setFlagError(null);
    } catch (err) {
      setLaunchError(err instanceof ApiError ? err.message : "Couldn't launch this lab.");
    } finally {
      setLaunching(false);
    }
  }, [token, params.slug, router]);

  const handleStop = useCallback(async () => {
    if (!token || !session) return;
    setStopping(true);
    try {
      const s = await stopSession(token, session.id);
      setSession(s);
    } catch {
      // The status poll will reconcile if this failed silently.
    } finally {
      setStopping(false);
    }
  }, [token, session]);

  const handleSubmitFlag = useCallback(async () => {
    if (!token || !session || !flag.trim()) return;
    setSubmittingFlag(true);
    setFlagError(null);
    try {
      await submitFlag(token, session.id, flag.trim());
      setFlagSuccess(true);
    } catch (err) {
      setFlagError(err instanceof ApiError ? err.message : "Couldn't submit that flag.");
    } finally {
      setSubmittingFlag(false);
    }
  }, [token, session, flag]);

  if (labError) {
    return (
      <ShellHeader>
        <p className="mt-6 text-sm text-red-400">{labError}</p>
      </ShellHeader>
    );
  }

  if (!lab) {
    return (
      <ShellHeader>
        <p className="mt-6 text-sm text-[var(--dash-ink-muted)]">Loading…</p>
      </ShellHeader>
    );
  }

  const isLive = session && LIVE_STATUSES.has(session.status);

  return (
    <ShellHeader>
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--accent)" }}
        >
          {LEVEL_LABEL[lab.level]}
        </span>
      </div>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{lab.title}</h1>
      {lab.summary && <p className="mt-2 text-[var(--dash-ink-muted)]">{lab.summary}</p>}

      {lab.steps.length > 0 && (
        <div
          className="mt-6 rounded-xl border p-5"
          style={{ borderColor: "var(--dash-border)", backgroundColor: "var(--dash-surface)" }}
        >
          <h2 className="text-sm font-semibold">Objective</h2>
          <ol className="mt-3 flex flex-col gap-3">
            {lab.steps.map((step) => (
              <li key={step.id} className="flex gap-3 text-sm">
                <span className="text-[var(--dash-ink-muted)]">{step.sequence}.</span>
                <span className="flex-1 text-[var(--dash-ink-secondary)]">
                  {step.instruction}
                  <span className="ml-2 text-xs text-[var(--dash-ink-muted)]">
                    ({step.points} pts)
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div
        className="mt-4 rounded-xl border p-5"
        style={{ borderColor: "var(--dash-border)", backgroundColor: "var(--dash-surface)" }}
      >
        {!isLive && (
          <>
            <h2 className="text-sm font-semibold">Launch</h2>
            {session?.status === "destroyed" && (
              <p className="mt-1 text-xs text-[var(--dash-ink-muted)]">
                Your last session ended. Launching starts a fresh one, with a new mutation.
              </p>
            )}
            {launchError && <p className="mt-3 text-sm text-red-400">{launchError}</p>}
            <button
              type="button"
              onClick={handleLaunch}
              disabled={launching}
              className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
            >
              {launching ? "Launching…" : "Launch lab"}
            </button>
            <p className="mt-2 text-xs text-[var(--dash-ink-muted)]">
              Up to 5 launches of this lab per day. A session left idle for {IDLE_TIMEOUT_MINUTES}{" "}
              minutes is destroyed automatically — you can always launch a new one.
            </p>
          </>
        )}

        {isLive && session && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Session — {session.status}</h2>
              <button
                type="button"
                onClick={handleStop}
                disabled={stopping}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs text-[var(--dash-ink-secondary)] hover:text-[var(--dash-ink)] disabled:opacity-50"
                style={{ borderColor: "var(--dash-border)" }}
              >
                <Square className="h-3 w-3" />
                {stopping ? "Stopping…" : "Stop"}
              </button>
            </div>

            {session.connection_info && (
              <a
                href={session.connection_info.split(" ")[0]}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold"
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
              >
                Open target <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            <p className="mt-3 text-xs text-[var(--dash-ink-muted)]">
              Idle timeout in {formatMinutesSeconds(idleSecondsRemaining(session))} — reload this
              page or interact and it resets automatically while this tab stays open.
            </p>

            <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--dash-border)" }}>
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <Flag className="h-4 w-4" style={{ color: "var(--accent)" }} />
                Submit flag
              </h3>
              {flagSuccess ? (
                <p className="mt-2 text-sm" style={{ color: "#0ca30c" }}>
                  Correct — nice work. Progress recorded.
                </p>
              ) : (
                <div className="mt-2 flex gap-2">
                  <input
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="FLAG{...}"
                    className="flex-1 rounded-lg border px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    style={{
                      borderColor: "var(--dash-border)",
                      backgroundColor: "var(--dash-surface-raised)",
                      color: "var(--dash-ink)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSubmitFlag}
                    disabled={submittingFlag || !flag.trim()}
                    className="rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
                  >
                    {submittingFlag ? "Checking…" : "Submit"}
                  </button>
                </div>
              )}
              {flagError && <p className="mt-2 text-sm text-red-400">{flagError}</p>}
            </div>
          </>
        )}
      </div>
    </ShellHeader>
  );
}

function ShellHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="dash min-h-screen bg-[var(--dash-page)] text-[var(--dash-ink)]">
      <header className="border-b border-[var(--dash-border)] px-6 py-4">
        <Link href="/labs" className="flex w-fit items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--accent-soft)" }}
          >
            <ShieldHalf className="h-4.5 w-4.5" style={{ color: "var(--accent)" }} />
          </span>
          <span className="text-base font-semibold tracking-tight">CyberLab</span>
        </Link>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">{children}</div>
    </div>
  );
}
