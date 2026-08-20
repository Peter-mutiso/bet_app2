import { create } from "zustand";

export interface Trade {
  id: string;
  symbol: string;
  contractType: string; // e.g., "RISE", "FALL"
  prediction?: number;
  barrier?: number;
  stake: number;
  payout?: number;
  entryPrice?: number;
  entryTick?: number;
  exitPrice?: number;
  exitTick?: number;
  currentPrice?: number;
  ticksHistory?: number[];
  tickDuration: number;
  remainingTicks: number;
  status: "OPEN" | "WON" | "LOST";
  profit?: number;
  createdAt?: string;
  settledAt?: string;
}

export type OpenTrade = Trade;

interface TradeStore {
  openTrades: Trade[];
  tradeHistory: Trade[];

  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, data: Partial<Trade>) => void;
  processTick: (symbol: string, currentPrice: number) => void;
  settleTrade: (id: string, status: "WON" | "LOST", profit: number, exitPrice?: number) => void;
  removeTrade: (id: string) => void;
  clearCompletedTrades: () => void;
  resetTrades: () => void;
}

export const useTradeStore = create<TradeStore>((set, get) => ({
  openTrades: [],
  tradeHistory: [],

  addTrade: (trade) =>
    set((state) => {
      const exists = state.openTrades.some((item) => item.id === trade.id);
      if (exists) return state;

      const newTrade: Trade = {
        ...trade,
        status: "OPEN",
        entryPrice: trade.entryPrice ?? trade.currentPrice,
        remainingTicks: trade.remainingTicks ?? trade.tickDuration,
        ticksHistory: trade.ticksHistory || (trade.entryPrice ? [trade.entryPrice] : []),
        createdAt: trade.createdAt || new Date().toISOString(),
      };

      return { openTrades: [newTrade, ...state.openTrades] };
    }),

  updateTrade: (id, data) =>
    set((state) => ({
      openTrades: state.openTrades.map((trade) =>
        trade.id === id ? { ...trade, ...data } : trade
      ),
    })),

  processTick: (symbol, currentPrice) => {
    // 1. Update all trades first
    set((state) => ({
      openTrades: state.openTrades.map((trade) => {
        if (trade.symbol !== symbol || trade.status !== "OPEN") return trade;

        const newRemaining = Math.max(0, trade.remainingTicks - 1);
        
        return {
          ...trade,
          currentPrice,
          remainingTicks: newRemaining,
          ticksHistory: [...(trade.ticksHistory || []), currentPrice],
        };
      }),
    }));

    // 2. Check for trades that hit 0 and Settle them
    const { openTrades, settleTrade } = get();
    
    openTrades.forEach((trade) => {
      if (trade.symbol === symbol && trade.status === "OPEN" && trade.remainingTicks === 0) {
        
        // --- WIN/LOSS Logic ---
        let status: "WON" | "LOST" = "LOST";
        const entry = trade.entryPrice || 0;
        
        if (trade.contractType === "RISE") {
          status = currentPrice > entry ? "WON" : "LOST";
        } else if (trade.contractType === "FALL") {
          status = currentPrice < entry ? "WON" : "LOST";
        }
        
        const profit = status === "WON" ? (trade.payout || trade.stake * 0.8) : -trade.stake;
        
        // Trigger settlement
        settleTrade(trade.id, status, profit, currentPrice);
      }
    });
  },

  settleTrade: (id, status, profit, exitPrice) => {
    const state = get();
    const existingTrade = state.openTrades.find((t) => t.id === id);

    if (!existingTrade) return;

    const settledTrade: Trade = {
      ...existingTrade,
      status,
      profit,
      exitPrice: exitPrice ?? existingTrade.currentPrice,
      settledAt: new Date().toISOString(),
    };

    set((s) => ({
      openTrades: s.openTrades.map((t) => (t.id === id ? settledTrade : t)),
      tradeHistory: s.tradeHistory.some((t) => t.id === id)
        ? s.tradeHistory
        : [settledTrade, ...s.tradeHistory].slice(0, 50),
    }));

    // Auto-remove settled trade from display after 4 seconds
    setTimeout(() => {
      set((s) => ({
        openTrades: s.openTrades.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeTrade: (id) =>
    set((state) => ({
      openTrades: state.openTrades.filter((trade) => trade.id !== id),
    })),

  clearCompletedTrades: () =>
    set((state) => ({
      openTrades: state.openTrades.filter((trade) => trade.status === "OPEN"),
    })),

  resetTrades: () =>
    set({
      openTrades: [],
      tradeHistory: [],
    }),
}));