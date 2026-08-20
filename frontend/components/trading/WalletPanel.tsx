"use client";

import { useEffect, useState } from "react";
import { useWalletStore } from "@/store/walletStore";

export default function WalletPanel() {
  const { balance, fetchWallet, processDeposit, processWithdraw, isLoading } = useWalletStore();
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-bold text-slate-500 uppercase">Available Balance</h3>
      <p className="text-3xl font-black text-slate-900 mb-4">KES {balance.toFixed(2)}</p>

      <div className="flex gap-2">
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded text-sm"
          placeholder="Amount"
        />
        <button 
          onClick={() => processDeposit(Number(amount))}
          className="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-bold"
          disabled={isLoading}
        >
          Deposit
        </button>
        <button 
          onClick={() => processWithdraw(Number(amount))}
          className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold"
          disabled={isLoading}
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}