"use client";

import { useEffect } from "react";
import { useMarketStore } from "@/store/marketStore";
import { usePositionsStore } from "@/store/positionsStore";
import { getSocket } from "@/lib/socket";

export function useMarketData() {
  const setTick = useMarketStore((state) => state.setTick);
  const symbol = useMarketStore((state) => state.symbol);

  useEffect(() => {
    const socket = getSocket();

    const handleTick = (data: { price: number; digit: number }) => {
      // Update market
      setTick(data.price, data.digit);

      // Reduce remaining ticks for every open trade
      usePositionsStore.getState().decrementTicks();

      // Read fresh state here rather than subscribing to the positions
      // store reactively — decrementTicks() returns a new openPositions
      // array reference on every tick, and this handler used to be
      // recreated (subscribing/unsubscribing the socket "tick" listener)
      // on every single tick because openPositions was in this effect's
      // dependency array. Reading via getState() keeps the socket
      // subscription stable across renders while still checking every
      // open position's remaining ticks on every tick, same as before.
      const { openPositions, closePosition } = usePositionsStore.getState();

      // Check only open positions
      openPositions.forEach((trade) => {
        if (
          trade.status === "open" &&
          trade.remainingTicks <= 0
        ) {
          // TODO:
          // Replace this with your real settlement logic.
          const isWin = Math.random() > 0.5;

          const finalPnl = isWin
            ? trade.stake * 0.9
            : -trade.stake;

          closePosition(
            trade.id,
            isWin ? "won" : "lost",
            finalPnl
          );

          console.log(
            `Trade ${trade.id} settled`
          );
        }
      });
    };

    socket.on("tick", handleTick);
    socket.emit("subscribeTicks", { symbol });

    return () => {
      socket.off("tick", handleTick);
      socket.emit("unsubscribeTicks", { symbol });
    };
  }, [symbol, setTick]);
}