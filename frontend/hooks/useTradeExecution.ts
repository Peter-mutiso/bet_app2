"use client";

import { useState } from "react";
import { useMarketStore } from "@/store/marketStore";
import { useWalletStore } from "@/store/walletStore";
import { useTradeStore } from "@/store/tradeStore";
import { getSocket } from "@/lib/socket";

export function useTradeExecution() {
  const [loading, setLoading] = useState(false);

  const { selectedMarket, tradeType, stake, bulkTradesCount, price } = useMarketStore();
  const { hasSufficientBalance, deductBalance } = useWalletStore();
  const addTrade = useTradeStore((s) => s.addTrade);

  const executeTrade = async (prediction: "EVEN" | "ODD" | "RISE" | "FALL") => {
    // 1. Balance validation check
    const totalStake = stake * bulkTradesCount;
    if (!hasSufficientBalance(totalStake)) {
      alert("Insufficient wallet balance for this trade!");
      return;
    }

    try {
      setLoading(true);
      const socket = getSocket();

      // 2. Loop for bulk trades count
      for (let i = 0; i < bulkTradesCount; i++) {
        const tradeId = `TRD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        // Deduct stake from local wallet store immediately
        deductBalance(stake);

        // Record trade in open trades store
        addTrade({
          id: tradeId,
          symbol: selectedMarket,
          contractType: prediction,
          stake: stake,
          payout: Number((stake * 1.82).toFixed(2)),
          entryPrice: price,
          tickDuration: 1,
          remainingTicks: 1,
          status: "OPEN",
          createdAt: new Date().toISOString(),
        });

        // Emit trade event through backend socket
        socket.emit("execute_trade", {
          tradeId,
          symbol: selectedMarket,
          tradeType,
          prediction,
          stake,
        });
      }
    } catch (error) {
      console.error("Trade execution error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    executeTrade,
  };
}