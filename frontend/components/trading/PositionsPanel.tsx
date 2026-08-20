"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePositionsStore } from "@/store/positionsStore";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { CloseIcon, InboxIcon } from "@/components/ui/icons";

export default function PositionsPanel() {
  const {
    openPositions,
    closedPositions,
    showPanel,
    activeTab,
    setActiveTab,
    hidePositionsPanel,
    removeClosedPosition,
  } = usePositionsStore();

  const timersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const currency = "$";

  const visiblePositions = useMemo(
    () =>
      activeTab === "open"
        ? openPositions
        : closedPositions,
    [activeTab, openPositions, closedPositions]
  );

  // Remove closed trades after 10 minutes
  useEffect(() => {
    closedPositions.forEach((trade) => {
      if (!timersRef.current[trade.id]) {
        timersRef.current[trade.id] = setTimeout(() => {
          removeClosedPosition(trade.id);
          delete timersRef.current[trade.id];
        }, 600000);
      }
    });

    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);

      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [closedPositions, removeClosedPosition]);

  // Auto hide after 3 seconds if no open positions remain
  useEffect(() => {
    if (!showPanel) return;

    if (openPositions.length === 0) {
      hideTimer.current = setTimeout(() => {
        hidePositionsPanel();
      }, 3000);
    } else if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, [openPositions, showPanel, hidePositionsPanel]);

  return (
    <Modal isOpen={showPanel} onClose={hidePositionsPanel} size="md" labelledBy="positions-panel-title" className="p-5">
      <>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 id="positions-panel-title" className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-slate-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>

            Positions
          </h2>

          <button
            onClick={hidePositionsPanel}
            aria-label="Close positions panel"
            className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}

        <div className="mb-4 flex rounded-lg bg-slate-900 p-1">
          <button
            onClick={() => setActiveTab("open")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-bold transition ${
              activeTab === "open"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Open ({openPositions.length})
          </button>

          <button
            onClick={() => setActiveTab("closed")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-bold transition ${
              activeTab === "closed"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Closed ({closedPositions.length})
          </button>
        </div>

        {visiblePositions.length === 0 ? (
          <EmptyState
            icon={<InboxIcon className="h-5 w-5" />}
            title={activeTab === "open" ? "No open positions" : "No closed positions yet"}
            description={
              activeTab === "open"
                ? "Trades you place will show up here while they're running."
                : "Your finished trades will appear here once settled."
            }
          />
        ) : (
          <div className="max-h-[420px] space-y-3.5 overflow-y-auto pr-1 custom-scrollbar">
            {visiblePositions.map((trade: any) => {
              const potentialPayout =
                trade.payout || trade.stake * 1.95;

              const totalDuration =
                trade.tickDuration || 5;

              const remaining =
                trade.remainingTicks ?? 0;

              const completed = Math.max(
                0,
                totalDuration - remaining
              );

              const progressPercent = Math.min(
                100,
                Math.max(
                  0,
                  (completed / totalDuration) * 100
                )
              );

              const isWon = trade.status === "won";
              const isLost = trade.status === "lost";

              let borderColor =
                "border-teal-500/30 bg-slate-900/90";

              if (isWon)
                borderColor =
                  "border-emerald-500/60 bg-emerald-950/20";

              if (isLost)
                borderColor =
                  "border-rose-500/60 bg-rose-950/20";

                                return (
                <div
                  key={trade.id}
                  className={`rounded-xl border p-4 shadow-md ${borderColor}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-slate-100">
                        {trade.symbol || trade.asset}
                      </span>

                      <span className="rounded border border-teal-500/30 bg-slate-800 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-teal-400">
                        {trade.contractType || trade.type}
                      </span>

                      {trade.prediction !== undefined && (
                        <span className="rounded border border-amber-500/30 bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                          Target: {trade.prediction}
                        </span>
                      )}
                    </div>

                    {trade.status === "open" ? (
                      <Badge tone="success" dot>
                        {remaining} ticks left
                      </Badge>
                    ) : isWon ? (
                      <Badge tone="success">
                        ✓ Won (+{currency}
                        {trade.pnl.toFixed(2)})
                      </Badge>
                    ) : (
                      <Badge tone="danger">
                        ✕ Lost ({currency}
                        {trade.pnl.toFixed(2)})
                      </Badge>
                    )}
                  </div>

                  {trade.status === "open" && (
                    <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
                        style={{
                          width: `${progressPercent}%`,
                        }}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-2.5 text-xs">
                    <div>
                      <span className="block text-[10px] font-semibold uppercase text-slate-500">
                        Entry
                      </span>

                      <span className="font-bold text-slate-200">
                        {trade.entryPrice?.toFixed(2) ?? "--"}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-semibold uppercase text-slate-500">
                        Spot
                      </span>

                      <span className="font-bold text-teal-300">
                        {trade.currentPrice?.toFixed(2) ??
                          trade.entryPrice?.toFixed(2) ??
                          "--"}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-semibold uppercase text-slate-500">
                        Stake / Payout
                      </span>

                      <span className="font-extrabold text-emerald-400">
                        {currency}
                        {trade.stake.toFixed(2)}
                        {" / "}
                        {currency}
                        {potentialPayout.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    </Modal>
  );
}