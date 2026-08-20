"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { useTradeStore } from "@/store/tradeStore";
import { useWalletStore } from "@/store/walletStore";

interface TradeRecord {
  id: string;
  symbol: string;
  contractType: string;
  stake: number | string;
  profit?: number | string;
  payout?: number | string;
  status: "OPEN" | "WON" | "LOST";
  createdAt?: string;
}

export default function TradeHistory() {
  const [apiTrades, setApiTrades] = useState<TradeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const currency = useWalletStore((s) => s.currency) || "USD";
  const localHistory = useTradeStore((s) => s.tradeHistory);

  async function fetchHistory() {
    try {
      const data = await api<TradeRecord[]>("/trades/history");
      if (Array.isArray(data)) {
        setApiTrades(data);
      }
    } catch (error) {
      // Keep existing data on transient network errors
      console.warn("Trade history polling warning:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  // Merge & Deduplicate local realtime store + API backend records
  const displayTrades = useMemo(() => {
    const tradeMap = new Map<string, TradeRecord>();

    // 1. Populate from local Zustand store
    localHistory.forEach((t) => {
      tradeMap.set(t.id, {
        id: t.id,
        symbol: t.symbol,
        contractType: t.contractType,
        stake: t.stake,
        profit: t.profit,
        payout: t.payout,
        status: t.status as "OPEN" | "WON" | "LOST",
        createdAt: t.createdAt || new Date().toISOString(),
      });
    });

    // 2. Overwrite with synced backend database records
    apiTrades.forEach((t) => {
      tradeMap.set(t.id, t);
    });

    return Array.from(tradeMap.values()).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [localHistory, apiTrades]);

  // Performance Metrics Calculation
  const stats = useMemo(() => {
    const completed = displayTrades.filter(
      (t) => t.status === "WON" || t.status === "LOST"
    );
    const wins = completed.filter((t) => t.status === "WON").length;
    const winRate = completed.length > 0 ? (wins / completed.length) * 100 : 0;

    const netProfit = completed.reduce((acc, t) => {
      const stakeNum = Number(t.stake) || 0;
      if (t.profit !== undefined) return acc + Number(t.profit);
      if (t.status === "WON") {
        const payoutNum = Number(t.payout) || stakeNum * 1.95;
        return acc + (payoutNum - stakeNum);
      }
      return acc - stakeNum;
    }, 0);

    return {
      total: displayTrades.length,
      winRate: winRate.toFixed(1),
      netProfit,
    };
  }, [displayTrades]);

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-[#0d1626] p-5 text-slate-100 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
          Trade History
        </h2>
        <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
          {stats.total} Total
        </span>
      </div>

      {/* Summary Performance Bar */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Win Rate
            </span>
            <span className="text-sm font-black text-teal-400">
              {stats.winRate}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Net Profit / Loss
            </span>
            <span
              className={`text-sm font-black ${
                stats.netProfit >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {stats.netProfit >= 0 ? "+" : ""}
              {currency} {stats.netProfit.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Loading & Empty States */}
      {loading && displayTrades.length === 0 ? (
        <div className="py-10 text-center text-xs font-semibold text-slate-500 animate-pulse">
          Syncing trade records...
        </div>
      ) : displayTrades.length === 0 ? (
        <div className="py-10 text-center text-xs font-semibold text-slate-500">
          No trade history recorded yet.
        </div>
      ) : (
        /* History Table List */
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
          {displayTrades.map((trade) => {
            const numStake = Number(trade.stake) || 0;
            const isWin = trade.status === "WON";
            const isLoss = trade.status === "LOST";

            // Calculate profit dynamically if omitted in payload
            let profitVal = 0;
            if (trade.profit !== undefined) {
              profitVal = Number(trade.profit);
            } else if (isWin) {
              profitVal = (Number(trade.payout) || numStake * 1.95) - numStake;
            } else if (isLoss) {
              profitVal = -numStake;
            }

            // Date parsing
            const formattedTime = trade.createdAt
              ? new Date(trade.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : "Just now";

            return (
              <div
                key={trade.id}
                className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-3.5 transition-all hover:border-slate-700/80 shadow-sm"
              >
                {/* Top Row: Symbol, Contract Type & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-100">
                      {trade.symbol}
                    </span>
                    <span className="rounded bg-slate-800 border border-slate-700/60 px-2 py-0.5 text-[10px] font-bold text-teal-300 uppercase tracking-wide">
                      {trade.contractType.replaceAll("_", " ")}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      isWin
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                        : isLoss
                        ? "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                        : "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {trade.status}
                  </span>
                </div>

                {/* Bottom Row: Stake, Profit/Loss & Time */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Stake
                      </span>
                      <span className="font-bold text-slate-200">
                        {currency} {numStake.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Profit / Loss
                      </span>
                      <span
                        className={`font-extrabold ${
                          profitVal >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {profitVal >= 0 ? "+" : ""}
                        {currency} {profitVal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-500">
                      {formattedTime}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}