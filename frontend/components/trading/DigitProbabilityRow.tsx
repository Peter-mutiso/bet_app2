"use client";

import { useMemo } from "react";
import { useMarketStore } from "@/store/marketStore";
import { QUARTILE_COLORS } from "@/lib/digitQuartiles";
import DigitCircle from "./DigitCircle";

export default function DigitProbabilityRow() {
  const stats = useMarketStore((state) => state.digitStats);
  const prediction = useMarketStore((state) => state.prediction);
  const displayDigit = useMarketStore((state) => state.displayDigit);
  const priceDirection = useMarketStore((state) => state.priceDirection);
  const ticks = useMarketStore((state) => state.ticks);

  const hasLiveTicks = ticks.length > 0;
  const recentTicks = ticks.slice(-6);

  /*
   * Determine the four ranked digits.
   */
  const {
    maxDigit,
    subMaxDigit,
    subMinDigit,
    minDigit,
  } = useMemo(() => {
    if (!stats || stats.length === 0) {
      return {
        maxDigit: null,
        subMaxDigit: null,
        subMinDigit: null,
        minDigit: null,
      };
    }

    const sorted = [...stats].sort(
      (a, b) => (b.percent ?? 0) - (a.percent ?? 0),
    );

    return {
      maxDigit: sorted[0]?.digit ?? null,
      subMaxDigit: sorted[1]?.digit ?? null,
      subMinDigit: sorted[sorted.length - 2]?.digit ?? null,
      minDigit: sorted[sorted.length - 1]?.digit ?? null,
    };
  }, [stats]);

  /*
   * The store is designed to contain all ten digits.
   *
   * Explicitly construct digits 0-9 here as an additional safety
   * measure. If a partial stats array ever arrives, the missing
   * digits still receive a circle instead of collapsing the grid.
   */
  const digits = useMemo(() => {
    const byDigit = new Map(
      (stats ?? []).map((item) => [item.digit, item]),
    );

    return Array.from({ length: 10 }, (_, digit) => {
      const item = byDigit.get(digit);

      return {
        digit,
        count: item?.count ?? 0,
        percent: item?.percent ?? 0,
      };
    });
  }, [stats]);

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      {/* ============================================================
          DIGIT GRID
          
          ALWAYS:
          
          0   1   2   3   4
          5   6   7   8   9
          
          The grid itself controls the layout.
          Nothing inside the grid is allowed to determine its size.
      ============================================================ */}
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div className="digit-grid">
          {digits.map((item) => (
            <div
              key={item.digit}
              className="digit-grid-cell"
            >
              <DigitCircle
                digit={item.digit}
                percent={item.percent}
                isMax={item.digit === maxDigit}
                isSubMax={item.digit === subMaxDigit}
                isSubMin={item.digit === subMinDigit}
                isMin={item.digit === minDigit}
                isSelected={item.digit === prediction}
                isCurrentTick={
                  hasLiveTicks && item.digit === displayDigit
                }
                tickDirection={priceDirection}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          COMPACT FOOTER
      ============================================================ */}
      <div className="flex h-[22px] min-h-[22px] shrink-0 items-center justify-between gap-2 overflow-hidden border-t border-slate-800/70 px-1">
        {/* Quartile legend */}
        <div className="flex min-w-0 shrink items-center gap-[clamp(0.35rem,0.8vw,0.75rem)] overflow-hidden">
          {[
            { label: "Q4", tier: "q4" as const },
            { label: "Q3", tier: "q3" as const },
            { label: "Q2", tier: "q2" as const },
            { label: "Q1", tier: "q1" as const },
          ].map(({ label, tier }) => (
            <span
              key={tier}
              className="flex shrink-0 items-center gap-1 text-[7px] font-bold tracking-wide text-slate-500"
            >
              <span
                aria-hidden="true"
                className="h-[6px] w-[6px] shrink-0 rounded-full border border-slate-950"
                style={{
                  backgroundColor: QUARTILE_COLORS[tier],
                }}
              />

              {label}
            </span>
          ))}
        </div>

        {/* Recent digit ticker */}
        <div className="flex shrink-0 items-center overflow-hidden font-mono text-[8px]">
          {recentTicks.length > 0 ? (
            recentTicks.map((tick, index) => {
              const isLast = index === recentTicks.length - 1;

              return (
                <span
                  key={`${tick}-${index}`}
                  className="flex items-center"
                >
                  {index > 0 && (
                    <span
                      className="px-1 text-slate-700"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  )}

                  <span
                    className={
                      isLast
                        ? "font-bold text-teal-300"
                        : "text-slate-500"
                    }
                  >
                    {tick}
                  </span>
                </span>
              );
            })
          ) : (
            <span className="text-slate-700">—</span>
          )}
        </div>
      </div>
    </section>
  );
}