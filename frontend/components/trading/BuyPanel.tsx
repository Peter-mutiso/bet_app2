"use client";

import { useMemo, useState, useEffect } from "react";
import { buyTrade } from "@/lib/trades";
import { isLoggedIn } from "@/lib/auth";
import { useAITradeStore } from "@/store/aiTradeStore";
import LiveChart from "./LiveChart";
import BuySellButtons from "./BuySellButtons";
import DigitButtons from "../market/DigitButtons";
import LoginRequiredModal from "@/components/modals/LoginRequiredModal";

import { useTradeStore } from "@/store/tradeStore";
import { useMarketStore } from "@/store/marketStore";
import { useWalletStore } from "@/store/walletStore";
import { usePositionsStore } from "@/store/positionsStore";

export default function BuyPanel() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isPlacingTrade, setIsPlacingTrade] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);

  const {
    symbol,
    stake,
    setStake,
    numberOfTicks,
    setNumberOfTicks,
    contractType,
    prediction,
    setPrediction,
  } = useMarketStore();

  const {
    currency,
    hasSufficientBalance,
    deductBalance,
  } = useWalletStore();

  const addTrade = useTradeStore((state) => state.addTrade);

  const addPosition = usePositionsStore(
    (state) => state.addPosition
  );

  const isRiseFall = ["RISE", "FALL"].includes(
    contractType
  );

  const payoutMultiplier = useMemo(() => {
    if (isRiseFall) return 1.95;

    switch (contractType) {
      case "DIGIT_MATCH":
        return 8.85;

      case "DIGIT_DIFFERS":
        return 1.09;

      case "DIGIT_OVER":
      case "DIGIT_UNDER":
        if (
          prediction === null ||
          prediction === undefined
        )
          return 1.45;

        return contractType === "DIGIT_OVER"
          ? Number(
              (9 / (9 - prediction)).toFixed(2)
            )
          : Number((9 / prediction).toFixed(2));

      default:
        return 1.95;
    }
  }, [contractType, prediction, isRiseFall]);

  const estimatedPayout = useMemo(
    () => stake * payoutMultiplier,
    [stake, payoutMultiplier]
  );
  const aiTrade =
useAITradeStore(
(state)=>state.tradeRequest
);


const clearAITrade =
useAITradeStore(
(state)=>state.clearTrade
);
  const getContractTypeForAction = (
    side: "primary" | "secondary"
  ): string => {
    if (isRiseFall)
      return side === "primary"
        ? "RISE"
        : "FALL";

    if (
      ["EVEN", "ODD"].includes(contractType)
    )
      return side === "primary"
        ? "EVEN"
        : "ODD";

    if (
      ["DIGIT_OVER", "DIGIT_UNDER"].includes(
        contractType
      )
    )
      return side === "primary"
        ? "DIGIT_OVER"
        : "DIGIT_UNDER";

    return side === "primary"
      ? "DIGIT_MATCH"
      : "DIGIT_DIFFERS";
  };




useEffect(() => {

  if (!aiTrade)
    return;


  const trade = aiTrade;


  async function executeAITrade() {

    console.log(
      "Executing AI Trade",
      trade
    );


    await handleBuy(
      trade.contractType
    );


    clearAITrade();

  }


  executeAITrade();


}, [aiTrade, clearAITrade]);
  async function handleBuy(type: string) {
    // Require login
    if (!isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }

    // Prevent duplicate submissions while a trade is in flight
    if (isPlacingTrade) return;

    // Check balance
    if (!hasSufficientBalance(stake)) {
      setTradeError("Insufficient balance for this stake.");
      return;
    }

    setTradeError(null);
    setIsPlacingTrade(true);

    try {
      const response = await buyTrade({
        symbol: symbol || "R_100",
        contractType: type,
        prediction:
          prediction ?? undefined,
        barrier:
          prediction ?? undefined,
        tickDuration: numberOfTicks,
        stake,
      });

      deductBalance(stake);

      addTrade({
        id: response.id,
        symbol: response.symbol,
        contractType:
          response.contractType,
        stake: Number(response.stake),
        entryPrice: Number(
          response.entryPrice
        ),
        tickDuration:
          response.tickDuration,
        remainingTicks:
          response.tickDuration,
        payout:
          response.payout ??
          estimatedPayout,
        prediction:
          response.prediction ??
          prediction ??
          undefined,
        status: "OPEN",
      });

      addPosition({
        id: response.id,

        asset: symbol || "R_100",

        symbol: response.symbol,

        contractType:
          response.contractType,

        prediction:
          response.prediction ??
          prediction ??
          undefined,

        payout:
          response.payout ??
          estimatedPayout,

        entryPrice: Number(
          response.entryPrice
        ),

        currentPrice: Number(
          response.entryPrice
        ),

        tickDuration:
          response.tickDuration,

        type:
          type === "RISE" ||
          type === "DIGIT_OVER"
            ? "Rise"
            : "Fall",

        stake,

        pnl: -stake,

        status: "open",

        duration: `${numberOfTicks} ticks`,

        remainingTicks:
          numberOfTicks,
      });
    } catch (error) {
      console.error(
        "Trade execution failed",
        error
      );
      setTradeError("We couldn't place that trade. Please try again.");
    } finally {
      setIsPlacingTrade(false);
    }
  }

  return (
    <>
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() =>
          setShowLoginModal(false)
        }
      />

      <div className="flex h-full min-h-0 flex-col gap-[var(--section-gap)]">
        {/* Chart (Rise/Fall) or digit-prediction keypad — shown first so the
            user sees what they're trading before committing a stake.
            shrink-0: the keypad's 10 digits must always be fully visible,
            same guarantee as stake/ticks/Over-Under below. overflow-hidden
            here is just for the rounded corners, not a clip boundary. */}
        <div className="shrink-0 rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 shadow-lg overflow-hidden">
  {isRiseFall ? (
    <div className="p-[var(--panel-p)]">
      <LiveChart />
    </div>
  ) : (
    <>
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/70 px-3 py-1.5 [@media(max-height:680px)]:py-1 [@media(max-height:480px)]:py-0.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
          Pick a digit
        </p>
      </div>

      {/* Buttons */}
      <div className="p-[var(--panel-p)]">
        <DigitButtons
          selected={prediction}
          onSelect={setPrediction}
        />
      </div>

      {/* Selected digit */}
      {prediction !== null && prediction !== undefined && (
        <div className="border-t border-slate-700 bg-slate-800/40 px-2.5 py-0.5 flex items-center justify-between [@media(max-height:480px)]:py-px">
          <span className="text-[9px] uppercase tracking-wider text-slate-500">
            Selected
          </span>

          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[9px] font-black text-slate-950">
            {prediction}
          </div>
        </div>
      )}
    </>
  )}
</div>

        <div className="grid shrink-0 grid-cols-2 gap-1.5 [@media(max-height:480px)]:gap-1">
          <div>
            <label htmlFor="stake-input" className="mb-0.5 block text-[8px] font-bold uppercase text-slate-500">
              Stake
            </label>

            <div className="relative">
              <input
                id="stake-input"
                type="number"
                min={1}
                inputMode="decimal"
                value={stake}
                onChange={(e) =>
                  setStake(
                    Math.max(
                      1,
                      Number(e.target.value)
                    )
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 py-1 pl-2 pr-9 text-[11px] font-bold text-white outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 [@media(max-height:480px)]:py-0.5"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold uppercase text-slate-500">
                {currency}
              </span>
            </div>

            {/* Convenience shortcut, not essential — the stake input above
                covers the same function, so this is the first thing to give
                up space on extremely short viewports. */}
            <div className="mt-1 flex gap-1 [@media(max-height:480px)]:hidden">
              {[1, 5, 10, 25].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setStake(amount)}
                  className={`flex-1 rounded-md border py-0.5 text-[8px] font-bold transition-colors ${
                    stake === amount
                      ? "border-teal-500 bg-teal-500/10 text-teal-300"
                      : "border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="ticks-input" className="mb-0.5 block text-[8px] font-bold uppercase text-slate-500">
              Ticks
            </label>

            <div className="relative">
              <input
                id="ticks-input"
                type="number"
                min={1}
                inputMode="numeric"
                value={numberOfTicks}
                onChange={(e) =>
                  setNumberOfTicks(
                    Math.max(
                      1,
                      Number(e.target.value)
                    )
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 py-1 pl-2 pr-9 text-[11px] font-bold text-white outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 [@media(max-height:480px)]:py-0.5"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold uppercase text-slate-500">
                {numberOfTicks === 1 ? "tick" : "ticks"}
              </span>
            </div>
          </div>
        </div>

        {tradeError && (
          <div
            role="alert"
            className="shrink-0 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-950/30 px-2.5 py-1.5 text-xs text-rose-300"
          >
            {tradeError}
          </div>
        )}

        <div className="shrink-0">
          <BuySellButtons
            contractType={contractType}
            payout={estimatedPayout}
            currency={currency}
            loading={isPlacingTrade}
            onBuyPrimary={() =>
              handleBuy(
                getContractTypeForAction(
                  "primary"
                )
              )
            }
            onBuySecondary={() =>
              handleBuy(
                getContractTypeForAction(
                  "secondary"
                )
              )
            }
          />
        </div>
      </div>
    </>
  );
}