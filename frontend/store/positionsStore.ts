import { create } from "zustand";

export interface Position {
  id: string;
  asset: string;
  type: string;
  stake: number;
  pnl: number;
  status: "open" | "won" | "lost";
  duration: string;
  remainingTicks: number;

  symbol?: string;
  contractType?: string;
  prediction?: number;
  payout?: number;
  tickDuration?: number;
  entryPrice?: number;
  currentPrice?: number;
}

interface PositionsStore {
  // Positions
  openPositions: Position[];
  closedPositions: Position[];

  // Panel State
  showPanel: boolean;
  activeTab: "open" | "closed";

  // Actions
  addPosition: (pos: Position) => void;

  closePosition: (
    id: string,
    status: "won" | "lost",
    finalPnl: number
  ) => void;

  decrementTicks: () => void;

  removeClosedPosition: (id: string) => void;

  clearClosed: () => void;

  showPositionsPanel: () => void;

  hidePositionsPanel: () => void;

  setActiveTab: (tab: "open" | "closed") => void;
}

export const usePositionsStore = create<PositionsStore>((set) => ({
  // ===========================
  // Initial State
  // ===========================
  openPositions: [],
  closedPositions: [],

  showPanel: false,
  activeTab: "open",

  // ===========================
  // Add Position
  // ===========================
  addPosition: (pos) =>
    set((state) => ({
      openPositions: [pos, ...state.openPositions],
      showPanel: true,
      activeTab: "open",
    })),

  // ===========================
  // Tick Countdown
  // ===========================
  decrementTicks: () =>
    set((state) => ({
      openPositions: state.openPositions.map((p) => {
        if (p.status !== "open") return p;

        return {
          ...p,
          remainingTicks: Math.max(0, p.remainingTicks - 1),
        };
      }),
    })),

  // ===========================
  // Close Position
  // ===========================
  closePosition: (id, status, finalPnl) =>
    set((state) => {
      const trade = state.openPositions.find((p) => p.id === id);

      if (!trade) return state;

      const updated: Position = {
        ...trade,
        status,
        pnl: finalPnl,
        remainingTicks: 0,
      };

      const remainingOpen = state.openPositions.filter(
        (p) => p.id !== id
      );

      return {
        openPositions: remainingOpen,

        closedPositions: [
          updated,
          ...state.closedPositions,
        ],

        // Keep the panel open so the user can
        // immediately see the result.
        showPanel: true,

        // If no more open trades remain,
        // automatically switch to Closed.
        activeTab:
          remainingOpen.length > 0
            ? "open"
            : "closed",
      };
    }),

  // ===========================
  // Remove One Closed Position
  // ===========================
  removeClosedPosition: (id) =>
    set((state) => ({
      closedPositions: state.closedPositions.filter(
        (p) => p.id !== id
      ),
    })),

  // ===========================
  // Clear Closed Positions
  // ===========================
  clearClosed: () =>
    set({
      closedPositions: [],
    }),

  // ===========================
  // Panel Controls
  // ===========================
  showPositionsPanel: () =>
    set({
      showPanel: true,
    }),

  hidePositionsPanel: () =>
    set({
      showPanel: false,
    }),

  setActiveTab: (tab) =>
    set({
      activeTab: tab,
    }),
}));