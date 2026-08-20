"use client";

import { useState } from "react";
import { useMarketStore } from "@/store/marketStore";
import { useAIMarketFeed } from "@/hooks/useAIMarketFeed";
import AIScannerModal from "./AIScannerModal";

export default function DigitTicker() {
  // Feeds per-symbol tick history into the AI market store so the
  // scanner (opened via the button below) has data to analyze instead
  // of an empty market map.
  useAIMarketFeed();

  const displayPrice = useMarketStore((state) => state.displayPrice);
  const priceDirection = useMarketStore((state) => state.priceDirection);

  const [showScanner, setShowScanner] = useState(false);

  const priceColor =
    priceDirection === "UP"
      ? "text-emerald-500"
      : priceDirection === "DOWN"
      ? "text-red-500"
      : "text-slate-400";

  return (
    <>
      <AIScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
      />

      <div className="flex w-full flex-wrap items-center justify-center gap-3 sm:gap-6">
        {/* Current Tick */}
        <div className="flex flex-col items-center">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {displayPrice > 0 && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
            )}
            Current tick
          </span>

          <div className="flex items-center gap-1.5">
            {displayPrice > 0 ? (
              <div
                key={priceDirection}
                className={`transition-all duration-500 ${
                  priceDirection === "UP"
                    ? "rotate-0"
                    : priceDirection === "DOWN"
                    ? "rotate-180"
                    : "opacity-0"
                }`}
              >
                <svg
                  className={`h-4 w-4 ${priceColor}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </div>
            ) : null}

            {displayPrice > 0 ? (
              <span
                key={displayPrice}
                className={`animate-price-pulse text-lg font-extrabold sm:text-xl ${priceColor}`}
              >
                {displayPrice.toFixed(2)}
              </span>
            ) : (
              <span className="skeleton block h-5 w-20 rounded-md" aria-label="Waiting for live market data" />
            )}
          </div>
        </div>

        {/* AI Scanner Button */}
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="group flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-violet-500/40 active:scale-95"
        >
          <svg
            className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:rotate-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>

          <span>AI Scanner</span>
        </button>
      </div>
    </>
  );
}
