import { Bug, Fingerprint, KeyRound, ShieldCheck, Terminal } from "lucide-react";

// Self-contained hero graphic for the marketing home page — no external
// image assets. Composition: a glowing "target" panel at the center,
// dashed scan rings, and floating tool chips orbiting it, all driven by
// the shared --accent variable so it matches whatever accent the visitor
// last had set (see globals.css).
export function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm sm:max-w-md">
      <div
        className="absolute inset-0 rounded-[2rem]"
        style={{
          background:
            "radial-gradient(75% 75% at 50% 38%, var(--accent-soft) 0%, transparent 70%)",
        }}
      />

      <svg
        aria-hidden
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full opacity-[0.35]"
      >
        <defs>
          <pattern id="hero-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path
              d="M 26 0 L 0 0 0 26"
              fill="none"
              stroke="var(--dash-ink-muted)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#hero-grid)" />
        <circle
          cx="200"
          cy="190"
          r="150"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1"
          strokeDasharray="2 8"
          opacity="0.6"
        />
        <circle
          cx="200"
          cy="190"
          r="110"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1"
          strokeDasharray="1 6"
          opacity="0.4"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex h-32 w-32 items-center justify-center rounded-3xl sm:h-40 sm:w-40"
          style={{
            background:
              "linear-gradient(160deg, var(--accent) 0%, var(--dash-surface-raised) 120%)",
            boxShadow: "0 0 0 1px var(--dash-border), 0 20px 60px -12px var(--accent)",
          }}
        >
          <ShieldCheck className="h-14 w-14 text-white sm:h-16 sm:w-16" strokeWidth={1.6} />
        </div>
      </div>

      <ToolChip icon={Terminal} className="left-[4%] top-[16%]" />
      <ToolChip icon={KeyRound} className="right-[2%] top-[30%]" />
      <ToolChip icon={Bug} className="left-[0%] bottom-[18%]" />
      <ToolChip icon={Fingerprint} className="right-[8%] bottom-[4%]" />

      <span className="absolute left-[22%] top-[6%] h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
      <span className="absolute right-[18%] top-[10%] h-1 w-1 rounded-full bg-[var(--dash-ink-muted)]" />
      <span className="absolute bottom-[28%] right-[26%] h-1 w-1 rounded-full bg-[var(--accent)]" />
    </div>
  );
}

function ToolChip({
  icon: Icon,
  className = "",
}: {
  icon: typeof Terminal;
  className?: string;
}) {
  return (
    <div
      className={`absolute flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-sm sm:h-12 sm:w-12 ${className}`}
      style={{
        background: "var(--dash-surface-raised)",
        borderColor: "var(--dash-border)",
        boxShadow: "0 8px 24px -8px rgba(0,0,0,0.5)",
      }}
    >
      <Icon className="h-5 w-5" style={{ color: "var(--accent)" }} strokeWidth={1.8} />
    </div>
  );
}
