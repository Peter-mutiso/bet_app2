import { create } from "zustand";

interface AccountState {
  balance: number;
  currency: string;
  accountType: "DEMO" | "REAL";
  isLoading: boolean;
  
  // Actions
  setBalance: (amount: number) => void;
  setAccountType: (type: "DEMO" | "REAL") => void;
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  balance: 0.00,
  currency: "USD",
  accountType: "DEMO",
  isLoading: false,

  setBalance: (amount) => set({ balance: amount }),
  setAccountType: (type) => set({ accountType: type }),

  deposit: async (amount) => {
    set({ isLoading: true });
    // API CALL HERE
    // await api.post('/wallet/deposit', { amount });
    const newBalance = get().balance + amount;
    set({ balance: newBalance, isLoading: false });
  },

  withdraw: async (amount) => {
    if (get().balance < amount) throw new Error("Insufficient funds");
    set({ isLoading: true });
    // API CALL HERE
    // await api.post('/wallet/withdraw', { amount });
    const newBalance = get().balance - amount;
    set({ balance: newBalance, isLoading: false });
  },
}));