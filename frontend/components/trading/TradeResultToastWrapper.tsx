"use client";

import { useEffect, useRef, useState } from "react";
import { usePositionsStore } from "@/store/positionsStore";
import type { Position } from "@/store/positionsStore";
import { CheckCircleIcon, XCircleIcon } from "@/components/ui/icons";

export default function TradeResultToastWrapper() {
  const { closedPositions } = usePositionsStore();

  const [activeToast, setActiveToast] = useState<Position | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const lastToastId = useRef<string | null>(null);

  useEffect(() => {
    if (closedPositions.length === 0) return;

    const latest = closedPositions[0];

    if (latest.id === lastToastId.current) {
      return;
    }

    lastToastId.current = latest.id;

    setActiveToast(latest);
    setIsExiting(false);

    const fadeTimer = setTimeout(() => {
      setIsExiting(true);
    }, 8000);

    const removeTimer = setTimeout(() => {
      setActiveToast(null);
      setIsExiting(false);
    }, 10000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [closedPositions]);

  if (!activeToast) return null;

  const won = activeToast.status === "won";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] rounded-xl border p-4 shadow-[var(--shadow-modal)] transition-all duration-700 ${
        won ? "border-emerald-500/30 bg-[#0d1e18]" : "border-rose-500/30 bg-[#1e0d13]"
      } ${
        isExiting
          ? "translate-x-4 opacity-0"
          : "translate-x-0 opacity-100 animate-toast-in"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={won ? "text-emerald-400" : "text-rose-400"}>
          {won ? <CheckCircleIcon className="h-8 w-8" /> : <XCircleIcon className="h-8 w-8" />}
        </div>

        <div>
          <p className={`text-xs font-black uppercase tracking-wider ${won ? "text-emerald-400" : "text-rose-400"}`}>
            Trade {won ? "won" : "lost"}
          </p>
          <p className="text-sm font-bold text-white">
            {activeToast.symbol ?? activeToast.asset}
          </p>
          <p className={`font-mono text-xs font-bold ${won ? "text-emerald-400" : "text-rose-400"}`}>
            {won ? "+" : ""}
            {activeToast.pnl.toFixed(2)} USD
          </p>
        </div>
      </div>
    </div>
  );
}