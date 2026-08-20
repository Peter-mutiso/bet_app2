"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useMarketStore } from "@/store/marketStore";
import { useTradeStore } from "@/store/tradeStore";

export default function MarketListener() {
  useEffect(() => {
    const socket = getSocket();

    console.log("🚀 MarketListener mounted");

    const handleConnect = () => {
      console.log("✅ Socket connected");
      console.log("Socket ID:", socket.id);
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected");
    };

    const handleTick = (tick: any) => {
      if (!tick || tick.symbol !== "R_100") {
        return;
      }

      
      // Fetch latest store action directly to avoid re-render dependency loops
      useMarketStore.getState().setTick(
        Number(tick.price),
        Number(tick.digit)
      );
    };

    const handleSettlement = (result: any) => {
      if (!result) return;

      console.log("🏁 Settlement:", result);

      // Fetch latest store action directly to avoid re-render dependency loops
      useTradeStore.getState().settleTrade(
        result.tradeId,
        result.status,
        Number(result.profit ?? 0)
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("tick", handleTick);
    socket.on("settlement", handleSettlement);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("tick", handleTick);
      socket.off("settlement", handleSettlement);
    };
  }, []); // Empty dependency array ensures listener attaches once on mount

  return null;
}