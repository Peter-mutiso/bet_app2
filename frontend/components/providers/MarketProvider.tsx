"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useMarketStore } from "@/store/marketStore";

export default function MarketProvider() {
  const setTick = useMarketStore((state) => state.setTick);

  useEffect(() => {
    const socket = getSocket();

    socket.on("tick", (tick) => {
      setTick(
        tick.price,
        tick.digit
      );
    });

    return () => {
      socket.off("tick");
    };
  }, [setTick]);

  return null;
}