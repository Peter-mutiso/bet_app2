"use client";

import { useEffect, useState } from "react";

import { useAIScanner } from "@/hooks/useAIScanner";
import { useAIScannerStore } from "@/store/aiScannerStore";
import { useAITradeStore } from "@/store/aiTradeStore";
import { useMarketStore } from "@/store/marketStore";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/icons";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const markets = ["R_10", "R_25", "R_50", "R_75", "R_100"];
const MIN_AUTO_TRADE_CONFIDENCE = 80;

export default function AIScannerModal({ isOpen, onClose }: Props) {
  const [current, setCurrent] = useState(-1);
  const [finished, setFinished] = useState(false);

  const { bestTrade, startScan, stopScan } = useAIScannerStore();
  const setTradeRequest = useAITradeStore((state) => state.setTradeRequest);
  const { stake, numberOfTicks } = useMarketStore();

  useAIScanner();

  useEffect(() => {
    if (!isOpen) {
      setCurrent(-1);
      setFinished(false);
      stopScan();
      return;
    }

    startScan();

    let index = -1;
    const timer = setInterval(() => {
      index++;
      if (index < markets.length) {
        setCurrent(index);
      } else {
        clearInterval(timer);
        setFinished(true);
      }
    }, 700);

    return () => clearInterval(timer);
  }, [isOpen, startScan, stopScan]);

  const progress = finished ? 100 : ((current + 1) / markets.length) * 100;
  const belowConfidenceThreshold = !!bestTrade && bestTrade.confidence < MIN_AUTO_TRADE_CONFIDENCE;

  function handleAITrade() {
    if (!bestTrade || belowConfidenceThreshold) return;

    setTradeRequest({
      symbol: bestTrade.symbol,
      contractType: bestTrade.recommendation,
      confidence: bestTrade.confidence,
      stake,
      tickDuration: numberOfTicks,
    });

    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" labelledBy="ai-scanner-title">
      <div className="border-b border-slate-700 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-xl sm:h-14 sm:w-14 sm:text-2xl">
              🤖
            </div>

            <div className="min-w-0">
              <h2 id="ai-scanner-title" className="text-lg font-black text-white sm:text-2xl">
                AI Market Scanner
              </h2>
              <p className="text-xs text-slate-400 sm:text-sm">
                Neural engine analyzing volatility markets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close AI scanner"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
        {markets.map((market, index) => (
          <div
            key={market}
            className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3"
          >
            <span className="font-semibold text-white">{market}</span>

            {index < current && <span className="text-xl text-emerald-400">✓</span>}
            {index === current && (
              <span className="animate-spin text-xl text-cyan-400">⟳</span>
            )}
            {index > current && <span className="text-slate-600">●</span>}
          </div>
        ))}

        <div
          className="h-3 overflow-hidden rounded-full bg-slate-800"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Scan progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {!finished && (
          <div className="text-center">
            <div className="mb-3 text-5xl animate-pulse">🧠</div>
            <p className="font-semibold text-cyan-400 animate-pulse">
              AI evaluating live market conditions...
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Trend Detection • Volatility Analysis • Probability Engine
            </p>
          </div>
        )}

        {finished && bestTrade && (
          <div className="space-y-5 text-center animate-slide-up">
            <div className="text-6xl">🎯</div>
            <h3 className="text-2xl font-black text-white">Best Opportunity Found</h3>

            <div className="rounded-xl border border-emerald-500/20 bg-slate-900 p-5 text-left">
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Market</span>
                <span className="font-bold text-cyan-400">{bestTrade.symbol}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-400">Direction</span>
                <span
                  className={`font-bold ${
                    bestTrade.recommendation === "RISE" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {bestTrade.recommendation}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-400">Trend</span>
                <span className="font-bold text-white">{bestTrade.trend}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-400">Confidence</span>
                <span
                  className={`font-bold ${
                    belowConfidenceThreshold ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {bestTrade.confidence.toFixed(1)}%
                </span>
              </div>
            </div>

            {belowConfidenceThreshold && (
              <p className="text-xs font-semibold text-amber-400">
                Confidence is below the {MIN_AUTO_TRADE_CONFIDENCE}% threshold required for
                auto-trading. Trade manually instead if you&apos;d like to proceed.
              </p>
            )}

            <Button
              onClick={handleAITrade}
              disabled={belowConfidenceThreshold}
              fullWidth
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:brightness-110 disabled:hover:brightness-100"
            >
              🤖 Trade with AI
            </Button>

            <Button variant="secondary" fullWidth onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
