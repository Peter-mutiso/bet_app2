"use client";

import { useEffect } from "react";
import { useMarketStore } from "@/store/marketStore";

export const useMarketHeartbeat = () => {
  useEffect(() => {
    // This interval ensures the UI only updates every 2 seconds
    const interval = setInterval(() => {
      useMarketStore.getState().processBuffer();
    }, 2000);

    return () => clearInterval(interval);
  }, []);
};