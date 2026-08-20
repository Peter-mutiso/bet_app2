// Shared color/legend definitions for the digit-probability visualization.
// Only the digit ranked 1st and 2nd by touch percent (Q4/Q3) and the digit
// ranked 9th and 10th (Q2/Q1) get a distinct color — the middle six digits
// use the neutral track color. Defined once here so DigitCircle and
// DigitProbabilityRow can never drift out of sync on what each color means.
export const QUARTILE_COLORS = {
  q1: "#ef4444", // red — least touched
  q2: "#f97316", // orange — second least touched
  q3: "#38bdf8", // light blue — second most touched
  q4: "#22c55e", // green — most touched
} as const;

export type QuartileTier = keyof typeof QUARTILE_COLORS;

export const QUARTILE_LEGEND: { tier: QuartileTier; label: string }[] = [
  { tier: "q4", label: "Q4 most" },
  { tier: "q3", label: "Q3" },
  { tier: "q2", label: "Q2" },
  { tier: "q1", label: "Q1 least" },
];

export const RING_NEUTRAL_COLOR = "#475569";
export const RING_TRACK_COLOR = "#1e293b";
