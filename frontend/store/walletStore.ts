import { create } from "zustand";
import { api } from "@/lib/api"; // Import your custom fetch utility

interface WalletStore {
  balance: number;
  currency: string;
  accountType: "demo" | "real";
  isLoading: boolean;
  setBalance: (balance: number) => void;
  setCurrency: (currency: string) => void;
  setAccountType: (type: "demo" | "real") => void;
  syncWallet: (balance: number, currency?: string) => void;
  updateBalance: (amount: number) => void;
  deductBalance: (amount: number) => void;
  hasSufficientBalance: (amount: number) => boolean;
  resetBalance: () => void;
  fetchWallet: () => Promise<void>;
  processDeposit: (amount: number, description?: string) => Promise<boolean>;
  processWithdraw: (amount: number, description?: string) => Promise<boolean>;
}

const safeRound = (val: number): number => {
  if (isNaN(val) || !isFinite(val)) return 0;
  return Math.round((val + Number.EPSILON) * 100) / 100;
};

export const useWalletStore = create<WalletStore>((set, get) => ({
  balance: 10000,
  currency: "USD",
  accountType: "demo",
  isLoading: false,

  setBalance: (balance) => set({ balance: safeRound(balance) }),
  setCurrency: (currency) => set({ currency: currency || "USD" }),
  
  setAccountType: (type) => {
    set({ accountType: type });
    if (type === "real") get().fetchWallet();
    else set({ balance: 0.00 });
  },

  syncWallet: (balance, currency) =>
    set((state) => ({ balance: safeRound(balance), currency: currency || state.currency })),

  updateBalance: (amount) =>
    set((state) => ({ balance: safeRound(state.balance + amount) })),

  deductBalance: (amount) =>
    set((state) => ({ balance: safeRound(Math.max(0, state.balance - amount)) })),

  hasSufficientBalance: (amount) => {
    const currentBalance = get().balance;
    return typeof amount === "number" && amount > 0 && currentBalance >= amount;
  },

  resetBalance: () => set({ balance: 0, currency: "USD" }),

  // src/store/walletStore.ts

  fetchWallet: async () => {
    // 1. Only fetch if account is 'real'
    if (get().accountType !== "real") return;

    // 2. Only fetch if a token exists
    const token = localStorage.getItem("token");
    if (!token) return;

    set({ isLoading: true });
    try {
      const data = await api<{ balance: number; currency: string }>("/wallet");
      set({ balance: Number(data.balance), currency: data.currency });
    } catch (error: any) {
      // 3. Handle specific Auth error
      if (error.message.includes("Unauthorized")) {
        console.warn("Session expired. Redirecting to login...");
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/login"; // Force redirect
        }
      } else {
        console.error("Failed to fetch wallet:", error);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  processDeposit: async (amount, description = "Deposit") => {
    set({ isLoading: true });
    try {
      await api("/wallet/deposit", {
        method: "POST",
        body: JSON.stringify({ amount, description }),
      });
      await get().fetchWallet();
      return true;
    } catch (error) {
      console.error("Deposit failed", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  processWithdraw: async (amount, description = "Withdrawal") => {
    set({ isLoading: true });
    try {
      await api("/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount, description }),
      });
      await get().fetchWallet();
      return true;
    } catch (error) {
      console.error("Withdrawal failed", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));