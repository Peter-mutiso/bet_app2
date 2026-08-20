import { create } from "zustand";

export interface DigitStat {
  digit: number;
  count: number;
  percent: number;
}

interface MarketState {
  // Market Selection
  selectedMarket: string;
  symbol: string;
  tradeType: string;
  contractType: string;
  numberOfTicks: number;
  analysisTicks: number;
  stake: number;
  bulkTradesCount: number;
  prediction: number | null;
  barrier: number | null;

  // Real-time Data
  price: number;
  previousPrice: number;
  priceDirection: "UP" | "DOWN" | "NONE";
  digit: number;
  ticks: number[];
  priceHistory: number[];
  digitStats: DigitStat[];
  evenPercent: number;
  oddPercent: number;

  // Heartbeat / Display State
  displayDigit: number;
  displayPrice: number;
  // Queue of every real tick's digit received since the last heartbeat —
  // NOT a single slot. A single slot would silently drop every tick but
  // the last one when ticks arrive faster than the 2s heartbeat, which
  // corrupts digitStats (it must reflect every real tick, not a sample).
  tickBuffer: number[];

  // Actions
  setSelectedMarket: (marketName: string, symbolCode?: string) => void;
  setTradeType: (type: string) => void;
  setContractType: (contractType: string) => void;
  setNumberOfTicks: (count: number) => void;
  setAnalysisTicks: (count: number) => void;
  setStake: (stake: number) => void;
  setBulkTradesCount: (count: number) => void;
  setPrediction: (prediction: number | null) => void;
  setBarrier: (barrier: number | null) => void;
  setTick: (price: number, digit?: number) => void;
  processBuffer: () => void;
  resetMarketData: () => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  // Defaults
  selectedMarket: "Volatility 100 Index",
  symbol: "R_100",
  tradeType: "EVEN_ODD",
  contractType: "EVEN",
  numberOfTicks: 5,
  analysisTicks: 100,
  stake: 10,
  bulkTradesCount: 1,
  prediction: 5,
  barrier: null,

  // Stream State
  price: 0,
  previousPrice: 0,
  priceDirection: "NONE",
  digit: 0,
  ticks: [],
  priceHistory: [],
  
  // UI Display State
  displayDigit: 0,
  displayPrice: 0,
  tickBuffer: [],

  digitStats: Array.from({ length: 10 }, (_, i) => ({
    digit: i,
    count: 0,
    percent: 10.0,
  })),
  evenPercent: 50.0,
  oddPercent: 50.0,

  // Actions
  setSelectedMarket: (selectedMarket, symbolCode) =>
    set((state) => ({
      selectedMarket,
      symbol: symbolCode || state.symbol,
      ticks: [],
      priceHistory: [],
      price: 0,
      previousPrice: 0,
      evenPercent: 50.0,
      oddPercent: 50.0,
      tickBuffer: [],
      displayDigit: 0,
      displayPrice: 0,
    })),

  setTradeType: (type) => {
    let defaultContract = "EVEN";
    if (type === "RISE_FALL") defaultContract = "RISE";
    else if (type === "EVEN_ODD") defaultContract = "EVEN";
    else if (type === "MATCH_DIFFERS") defaultContract = "DIGIT_MATCH";
    else if (type === "OVER_UNDER") defaultContract = "DIGIT_OVER";
    set({ tradeType: type, contractType: defaultContract });
  },

  setContractType: (contractType) => set({ contractType }),
  setNumberOfTicks: (numberOfTicks) => set({ numberOfTicks }),
  setAnalysisTicks: (analysisTicks) => set({ analysisTicks }),
  setStake: (stake) => set({ stake: Math.max(0.1, stake) }),
  setBulkTradesCount: (bulkTradesCount) => set({ bulkTradesCount: Math.max(1, bulkTradesCount) }),
  setPrediction: (prediction) => set({ prediction }),
  setBarrier: (barrier) => set({ barrier }),

  // 1. RAW TICK INGESTION
  setTick(price, inputDigit) {
    let digit = inputDigit;
    if (digit === undefined || digit === null) {
      const priceStr = price.toFixed(2);
      const lastChar = priceStr.slice(-1);
      const parsed = parseInt(lastChar, 10);
      digit = isNaN(parsed) ? 0 : parsed;
    }

    set((state) => ({
      price,
      tickBuffer: [...state.tickBuffer, digit],
    }));
  },

  // 2. THE HEARTBEAT PROCESSOR
  processBuffer: () => {
    set((state) => {
      if (state.tickBuffer.length === 0) return state;

      // Every real tick queued since the last heartbeat — not just the
      // latest one — so digitStats reflects the true frequency of all of
      // them, while the display digit still shows only the most recent.
      const queuedDigits = state.tickBuffer;
      const newDigit = queuedDigits[queuedDigits.length - 1];
      const windowSize = Math.max(state.analysisTicks, 10);

      const updatedTicks = [...state.ticks, ...queuedDigits].slice(-windowSize);
      const updatedPriceHistory = [...state.priceHistory, state.price].slice(-windowSize);

      const counts = Array(10).fill(0);
      let evenCount = 0;
      updatedTicks.forEach((d) => {
        counts[d]++;
        if (d % 2 === 0) evenCount++;
      });

      const total = updatedTicks.length || 1;
      const digitStats = counts.map((count, i) => ({
        digit: i,
        count,
        percent: Number(((count / total) * 100).toFixed(1)),
      }));

      const evenPercent = Number(((evenCount / total) * 100).toFixed(1));
      const oddPercent = Number((100 - evenPercent).toFixed(1));

      // FIX: Persist the previous direction if price hasn't moved
      let priceDirection = state.priceDirection;
      if (state.price > state.previousPrice) priceDirection = "UP";
      else if (state.price < state.previousPrice) priceDirection = "DOWN";

      return {
        previousPrice: state.price,
        ticks: updatedTicks,
        priceHistory: updatedPriceHistory,
        digitStats,
        evenPercent,
        oddPercent,
        
        // UI UPDATES
        displayDigit: newDigit,
        displayPrice: state.price,
        priceDirection: priceDirection, // Arrow will now stay UP/DOWN
        tickBuffer: [],
      };
    });
  },

  resetMarketData: () =>
    set({
      price: 0,
      previousPrice: 0,
      priceDirection: "NONE",
      digit: 0,
      ticks: [],
      priceHistory: [],
      tickBuffer: [],
      displayDigit: 0,
      displayPrice: 0,
      evenPercent: 50.0,
      oddPercent: 50.0,
    }),
}));