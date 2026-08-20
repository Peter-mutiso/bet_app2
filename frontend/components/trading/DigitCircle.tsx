"use client";

import {
  QUARTILE_COLORS,
  RING_NEUTRAL_COLOR,
  RING_TRACK_COLOR,
  type QuartileTier,
} from "@/lib/digitQuartiles";

interface Props {
  digit: number;
  percent: number;
  isMax?: boolean;
  isSubMax?: boolean;
  isSubMin?: boolean;
  isMin?: boolean;
  isSelected?: boolean;
  isCurrentTick?: boolean;
  tickDirection?: "UP" | "DOWN" | "NONE";
}

const TIER_RANK_LABEL: Record<QuartileTier, string> = {
  q4: "quartile 4, most touched",
  q3: "quartile 3",
  q2: "quartile 2",
  q1: "quartile 1, least touched",
};

export default function DigitCircle({
  digit,
  percent,
  isMax = false,
  isSubMax = false,
  isSubMin = false,
  isMin = false,
  isSelected = false,
  isCurrentTick = false,
  tickDirection = "NONE",
}: Props) {
  // Only the four ranked digits (top 2 / bottom 2 by touch percent) get a
  // quartile color. The other six stay neutral — defaulting them to "q2"
  // made 6 of 10 circles look identical to the one digit that's genuinely
  // 2nd-least-touched, which misrepresented the data instead of clarifying it.
  const tier: QuartileTier | null = isMax
    ? "q4"
    : isSubMax
      ? "q3"
      : isSubMin
        ? "q2"
        : isMin
          ? "q1"
          : null;

  const ringColor = tier ? QUARTILE_COLORS[tier] : RING_NEUTRAL_COLOR;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  /*
   * Cap the visual progress so the ring remains readable.
   */
  const maxScale = 20;

  const safePercent = Number.isFinite(percent)
    ? Math.max(0, percent)
    : 0;

  const progress = Math.min(safePercent, maxScale) / maxScale;

  const offset = circumference * (1 - progress);

  return (
    <div
      className="digit-circle"
      role="img"
      aria-label={`Digit ${digit}, ${safePercent.toFixed(1)} percent${
        tier ? `, ${TIER_RANK_LABEL[tier]}` : ""
      }${isSelected ? ", selected prediction" : ""}${isCurrentTick ? ", current tick" : ""}`}
    >
      <div className="digit-circle-shell">
        {/* Background */}
        <div className="absolute inset-0 rounded-full border border-slate-700/80 bg-slate-900/95 shadow-[0_4px_14px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.05)]" />

        {/* Probability ring */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={RING_TRACK_COLOR}
            strokeWidth="5"
          />

          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition:
                "stroke-dashoffset 700ms ease, stroke 250ms ease",
            }}
          />
        </svg>

        {/* Inner surface */}
        <div
          className="absolute inset-[9%] flex flex-col items-center justify-center rounded-full border bg-[radial-gradient(circle_at_35%_28%,rgba(51,65,85,0.95),rgba(15,23,42,0.98)_65%,rgba(2,6,23,1))] shadow-[inset_0_2px_5px_rgba(255,255,255,0.04),inset_0_-5px_10px_rgba(0,0,0,0.3)] transition-all duration-200"
          style={{
            borderColor: isSelected
              ? "#2dd4bf"
              : `${ringColor}55`,
            boxShadow: isSelected
              ? "0 0 0 2px rgba(45,212,191,0.28), inset 0 2px 5px rgba(255,255,255,0.05), 0 5px 16px rgba(0,0,0,0.4)"
              : "inset 0 2px 5px rgba(255,255,255,0.04), 0 4px 12px rgba(0,0,0,0.35)",
          }}
        >
          <span className="select-none font-bold leading-none tracking-tight text-slate-50 text-[clamp(1.25rem,2.6vw,2.25rem)]">
            {digit}
          </span>

          <span className="mt-1 select-none font-mono text-[clamp(0.5rem,0.85vw,0.75rem)] font-semibold leading-none text-slate-400">
            {safePercent.toFixed(1)}%
          </span>
        </div>

        {/* Quartile indicator — only for the four ranked digits */}
        {tier && (
          <span
            aria-hidden="true"
            className="absolute right-[4%] top-[4%] h-2.5 w-2.5 rounded-full border-2 border-slate-950 shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
            style={{
              backgroundColor: ringColor,
            }}
          />
        )}

        {/* Selected indicator */}
        {isSelected && (
          <span
            aria-hidden="true"
            className="absolute bottom-[3%] left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border border-teal-300/50 bg-teal-500 px-2 py-0.5 text-[8px] font-bold leading-none text-slate-950 shadow-[0_2px_8px_rgba(20,184,166,0.4)]"
          >
            Selected
          </span>
        )}

        {/* Current tick */}
        {isCurrentTick && (
          <span
            aria-hidden="true"
            className="absolute bottom-[4%] left-[4%] flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-950 text-[8px] font-black text-white shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
            style={{
              backgroundColor:
                tickDirection === "UP"
                  ? "#10b981"
                  : tickDirection === "DOWN"
                    ? "#ef4444"
                    : "#64748b",
            }}
          >
            {tickDirection === "UP"
              ? "▲"
              : tickDirection === "DOWN"
                ? "▼"
                : "•"}
          </span>
        )}
      </div>
    </div>
  );
}