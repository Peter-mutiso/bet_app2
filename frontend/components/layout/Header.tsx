"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/store/walletStore";
import { useAuthStore } from "@/store/authStore";
import { isLoggedIn } from "@/lib/auth";
import LoginRequiredModal from "@/components/modals/LoginRequiredModal";

interface HeaderProps {
  onOpenWallet: () => void;
}

export default function Header({ onOpenWallet }: HeaderProps) {
  const router = useRouter();

  const {
    balance,
    currency,
    accountType,
    setAccountType,
  } = useWalletStore();

  // Zustand logout action
  const logout = useAuthStore((state) => state.logout);

  const [showLoginModal, setShowLoginModal] =
    useState(false);

  const requireLogin = (action: () => void) => {
    if (!isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }

    action();
  };

  function handleLogout() {
    // Clear authentication
    logout();

    // Remove any remaining stored data
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Redirect to landing page
    router.replace("/");
  }

  return (
    <>
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-[#090f1a] px-4 py-2.5 text-white shadow-md">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-lg font-black text-slate-950 shadow-sm">
            A
          </div>

          <div>
            <h1 className="flex items-center gap-1.5 text-sm font-extrabold tracking-wide text-slate-100">
              APEX TRADER

              <span className="rounded border border-teal-500/30 bg-teal-950 px-1.5 py-0.5 text-[10px] font-bold text-teal-400">
                PRO
              </span>
            </h1>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Demo / Real */}
          <div className="flex rounded-lg border border-slate-700/80 bg-slate-900 p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() =>
                requireLogin(() =>
                  setAccountType("demo")
                )
              }
              className={`rounded-md px-2.5 py-1 transition-all ${
                accountType === "demo"
                  ? "bg-amber-500 font-extrabold text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              DEMO
            </button>

            <button
              type="button"
              onClick={() =>
                requireLogin(() =>
                  setAccountType("real")
                )
              }
              className={`rounded-md px-2.5 py-1 transition-all ${
                accountType === "real"
                  ? "bg-emerald-500 font-extrabold text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              REAL
            </button>
          </div>

          {/* Balance */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Balance:
            </span>

            <span className="text-sm font-extrabold tracking-tight text-emerald-400">
              {currency}{" "}
              {balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                requireLogin(onOpenWallet)
              }
              className="rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-teal-500"
            >
              Deposit
            </button>

            {isLoggedIn() && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-500"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}