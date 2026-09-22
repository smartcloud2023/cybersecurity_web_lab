export type AccentId = "ocean" | "violet" | "aqua" | "amber";

export const ACCENTS: { id: AccentId; label: string; swatch: string }[] = [
  { id: "ocean", label: "Ocean", swatch: "#3987e5" },
  { id: "violet", label: "Violet", swatch: "#9085e9" },
  { id: "aqua", label: "Aqua", swatch: "#1fb586" },
  { id: "amber", label: "Amber", swatch: "#d99a1f" },
];

// First entry is the default system color, applied whenever nothing is
// stored yet (first visit, private browsing, storage cleared) and during
// server rendering, before the client has a chance to read localStorage.
export const DEFAULT_ACCENT: AccentId = ACCENTS[0].id;

const STORAGE_KEY = "cyberlab-accent";

function readStoredAccent(): AccentId {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && ACCENTS.some((a) => a.id === stored)) {
      return stored as AccentId;
    }
  } catch {
    // localStorage unavailable (private mode, blocked storage) — fall back.
  }
  return DEFAULT_ACCENT;
}

// A tiny external store so multiple components can read/set the accent
// without prop-drilling, synced via useSyncExternalStore (the store, not
// component state, so both the immediate same-tab update from clicking a
// swatch and this module's own bookkeeping stay in one place).
let currentAccent: AccentId | null = null;
const listeners = new Set<() => void>();

export function getAccentSnapshot(): AccentId {
  if (currentAccent === null) {
    currentAccent = readStoredAccent();
  }
  return currentAccent;
}

export function getServerAccentSnapshot(): AccentId {
  return DEFAULT_ACCENT;
}

export function subscribeAccent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAccent(id: AccentId) {
  currentAccent = id;
  document.documentElement.setAttribute("data-accent", id);
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Best-effort only — per-viewer convenience, not required state.
  }
  listeners.forEach((l) => l());
}
