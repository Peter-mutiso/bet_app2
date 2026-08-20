import { create } from "zustand";
import { MarketAnalysis } from "@/lib/ai/marketScanner";

interface AIScannerState {
  scanning: boolean;
  results: MarketAnalysis[];
  bestTrade: MarketAnalysis | null;

  startScan: () => void;
  stopScan: () => void;

  setResults: (
    results: MarketAnalysis[]
  ) => void;
}

export const useAIScannerStore =
  create<AIScannerState>((set) => ({

    scanning: false,

    results: [],

    bestTrade: null,

    startScan() {
      set({
        scanning: true,
      });
    },

    stopScan() {
      set({
        scanning: false,
      });
    },

    setResults(results) {

      const sorted =
        [...results].sort(
          (a, b) => b.score - a.score
        );

      set({
        results,
        bestTrade: sorted[0] ?? null,
      });
    },
}));
