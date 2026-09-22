"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled,
}: {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function setDigit(index: number, digit: string) {
    const next = value.padEnd(length, " ").split("");
    next[index] = digit || " ";
    onChange(next.join("").trimEnd());
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <div className="flex gap-2" role="group" aria-label="Verification code">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={value[i] ?? ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-12 w-11 rounded-lg border text-center text-lg font-semibold outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
          style={{
            borderColor: "var(--dash-border)",
            backgroundColor: "var(--dash-surface-raised)",
            color: "var(--dash-ink)",
          }}
        />
      ))}
    </div>
  );
}
