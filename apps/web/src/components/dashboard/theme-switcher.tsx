"use client";

import { useSyncExternalStore } from "react";
import {
  ACCENTS,
  getAccentSnapshot,
  getServerAccentSnapshot,
  setAccent,
  subscribeAccent,
} from "@/lib/theme";

export function ThemeSwitcher() {
  const active = useSyncExternalStore(
    subscribeAccent,
    getAccentSnapshot,
    getServerAccentSnapshot
  );

  return (
    <div
      role="radiogroup"
      aria-label="Dashboard accent color"
      className="flex items-center gap-2"
    >
      {ACCENTS.map((accent, i) => (
        <button
          key={accent.id}
          type="button"
          role="radio"
          aria-checked={active === accent.id}
          aria-label={`${accent.label}${i === 0 ? " (default)" : ""}`}
          title={`${accent.label}${i === 0 ? " — default" : ""}`}
          onClick={() => setAccent(accent.id)}
          className="h-6 w-6 shrink-0 rounded-full transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            backgroundColor: accent.swatch,
            outlineColor: accent.swatch,
            boxShadow:
              active === accent.id
                ? `0 0 0 2px var(--dash-surface), 0 0 0 4px ${accent.swatch}`
                : "0 0 0 1px rgba(255,255,255,0.15)",
          }}
        />
      ))}
    </div>
  );
}
