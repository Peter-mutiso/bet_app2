"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket"; // Adjust path as needed
import { useMarketStore } from "@/store/marketStore";

export const useSocketListeners = () => {
  useEffect(() => {
    const socket = getSocket();

    // THIS IS THE BRIDGE: 
    // It takes the raw data and immediately sends it to the store's 'setTick'
    const handleTick = (data: { quote: number; digit: number }) => {
      useMarketStore.getState().setTick(data.quote, data.digit);
    };

    socket.on("tick", handleTick);

    return () => {
      socket.off("tick", handleTick);
    };
  }, []);
};