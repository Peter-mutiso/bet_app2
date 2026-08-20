"use client";
import { useMarketStore } from "@/store/marketStore";
import { useState } from "react";
import { useWalletStore } from "@/store/walletStore";
import { useTradeStore, Trade } from "@/store/tradeStore";
import { api } from "@/lib/api";

interface TradeButtonsProps {
  /** Optional multiplier for calculating dynamic payouts (e.g., 0.95 = 95% profit) */
  payoutMultiplier?: number;
  /** Disable buttons during active ticks or invalid balance state */
  disabled?: boolean;
}

export default function TradeButtons({
  payoutMultiplier = 0.95,
  disabled = false,
}: TradeButtonsProps) {
  const [loadingType, setLoadingType] = useState<"EVEN" | "ODD" | null>(null);

  // Zustand Store Selectors
  const currency = useWalletStore((s) => s.currency) || "USD";
  const balance = useWalletStore((s) => s.balance) || 0;

  // Read symbol from MarketStore (where market selections live)
  const symbol = useMarketStore((s) => s.symbol) || "R_100";

  // Read stake safely from TradeStore (or fallback to default 10)
  const stake = useTradeStore((s) => (s as any).stake) ?? 10;
  const addTradeToHistory = useTradeStore((s) => s.addTrade);

  // Dynamic calculations
  const numStake = Number(stake) || 0;
  const potentialProfit = numStake * payoutMultiplier;
  const totalPayout = numStake + potentialProfit;
  const hasInsufficientBalance = balance < numStake;

  const handlePlaceTrade = async (type: "DIGITEVEN" | "DIGITODD") => {
    const actionLabel = type === "DIGITEVEN" ? "EVEN" : "ODD";
    if (disabled || loadingType || hasInsufficientBalance) return;

    setLoadingType(actionLabel);

    try {
      const payload = {
        symbol,
        contractType: type,
        stake: numStake,
        tickDuration: 1,
      };

      const response = await api<Partial<Trade>>("/trades/place", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Optimistically push trade into local Zustand store with all required Trade fields
      if (response && response.id) {
        const tradeDuration = response.tickDuration ?? 1;

        addTradeToHistory({
          id: response.id,
          symbol: response.symbol || symbol,
          contractType: response.contractType || type,
          stake: response.stake || numStake,
          payout: response.payout || totalPayout,
          status: response.status || "OPEN",
          tickDuration: tradeDuration,
          remainingTicks: response.remainingTicks ?? tradeDuration,
          createdAt: response.createdAt || new Date().toISOString(),
        } as Trade);
      }
    } catch (error) {
      console.error(`Failed to place ${actionLabel} trade:`, error);
    } finally {
      setLoadingType(null);
    }
  };

  const isExecuting = loadingType !== null;
  const isInteractionDisabled = disabled || isExecuting || hasInsufficientBalance;

  return (
    <div className="space-y-3 w-full">
      {/* Insufficient Funds Warning */}
      {hasInsufficientBalance && (
        <div className="text-center text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg py-2 px-3 shadow-sm">
          ⚠️ Insufficient balance for a {currency} {numStake.toFixed(2)} stake.
        </div>
      )}

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* EVEN BUTTON */}
        <button
          type="button"
          onClick={() => handlePlaceTrade("DIGITEVEN")}
          disabled={isInteractionDisabled}
          className={`
            relative overflow-hidden rounded-xl p-4 text-left transition-all duration-150 shadow-md select-none cursor-pointer
            ${
              isInteractionDisabled
                ? "bg-emerald-100/70 border border-emerald-200 text-emerald-400 cursor-not-allowed opacity-60 shadow-none"
                : "bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] border border-emerald-500 text-white shadow-emerald-600/20"
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
              Potential Profit
            </span>
            <span className="text-[10px] font-black bg-emerald-950/30 text-emerald-100 border border-emerald-300/30 rounded px-2 py-0.5">
              +{(payoutMultiplier * 100).toFixed(0)}%
            </span>
          </div>

          <h2 className="mt-1 text-2xl font-black tracking-tight">
            +{currency} {potentialProfit.toFixed(2)}
          </h2>

          <div className="mt-4 flex items-center justify-between pt-2 border-t border-emerald-500/40">
            <span className="text-lg font-black tracking-wide">EVEN</span>
            {loadingType === "EVEN" ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <span className="text-xs font-bold opacity-80">Buy Trade →</span>
            )}
          </div>
        </button>

        {/* ODD BUTTON */}
        <button
          type="button"
          onClick={() => handlePlaceTrade("DIGITODD")}
          disabled={isInteractionDisabled}
          className={`
            relative overflow-hidden rounded-xl p-4 text-left transition-all duration-150 shadow-md select-none cursor-pointer
            ${
              isInteractionDisabled
                ? "bg-rose-100/70 border border-rose-200 text-rose-400 cursor-not-allowed opacity-60 shadow-none"
                : "bg-rose-600 hover:bg-rose-500 active:scale-[0.98] border border-rose-500 text-white shadow-rose-600/20"
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
              Potential Profit
            </span>
            <span className="text-[10px] font-black bg-rose-950/30 text-rose-100 border border-rose-300/30 rounded px-2 py-0.5">
              +{(payoutMultiplier * 100).toFixed(0)}%
            </span>
          </div>

          <h2 className="mt-1 text-2xl font-black tracking-tight">
            +{currency} {potentialProfit.toFixed(2)}
          </h2>

          <div className="mt-4 flex items-center justify-between pt-2 border-t border-rose-500/40">
            <span className="text-lg font-black tracking-wide">ODD</span>
            {loadingType === "ODD" ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <span className="text-xs font-bold opacity-80">Buy Trade →</span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}