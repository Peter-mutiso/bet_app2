"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useWalletStore } from "@/store/walletStore";
import { useAuthStore } from "@/store/authStore";

import WalletModal from "@/components/modals/WalletModal";
import PositionsPanel from "@/components/trading/PositionsPanel";
import TradeResultToastWrapper from "@/components/trading/TradeResultToastWrapper";
import LoginRequiredModal from "@/components/modals/LoginRequiredModal";

import { isLoggedIn } from "@/lib/auth";

interface Props {
  children: React.ReactNode;
}

const navItems = [{ name: "Trading", href: "/trading", icon: "candlestick" }];

export default function DashboardLayout({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = useAuthStore((state) => state.logout);

  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Auth state is only known after client hydration, to avoid a mismatch flash.
  const [loggedIn, setLoggedIn] = useState(false);

  const { balance, currency, accountType, setAccountType, fetchWallet } = useWalletStore();

  useEffect(() => {
    setLoggedIn(isLoggedIn());

    const token = localStorage.getItem("token");
    if (token) fetchWallet();
  }, [fetchWallet]);

  function requireLogin(action: () => void) {
    if (!loggedIn) {
      setShowLoginModal(true);
      return;
    }
    action();
  }

  function handleLogout() {
    logout();

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setLoggedIn(false);
    router.replace("/");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased">
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
      <PositionsPanel />

      <header className="shrink-0 border-b border-slate-800 bg-[#090f1a]/95 text-white shadow-[var(--shadow-elevated)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-slate-800/80 px-2.5 py-1 sm:px-3 [@media(max-height:680px)]:py-0.5 [@media(max-height:480px)]:py-0">
          {/* LOGO */}
          <div className="flex items-center gap-2.5">
            <Link href="/trading" className="group flex items-center gap-1.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-500 text-xs font-black text-slate-950 shadow-sm shadow-teal-500/30 transition-colors group-hover:bg-teal-400 [@media(max-height:480px)]:h-5 [@media(max-height:480px)]:w-5">
                Q
              </div>

              <span className="text-xs font-extrabold leading-none tracking-tight text-white">
                QUANT<span className="text-teal-400">TRADER</span>
              </span>
            </Link>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3">
            {/* ACCOUNT TYPE */}
            <div
              className="flex items-center rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-[11px]"
              role="group"
              aria-label="Account type"
            >
              <button
                type="button"
                aria-pressed={accountType === "demo"}
                onClick={() => requireLogin(() => setAccountType("demo"))}
                className={`rounded-md px-2 py-1 font-bold transition-all ${
                  accountType === "demo"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Demo
              </button>

              <button
                type="button"
                aria-pressed={accountType === "real"}
                onClick={() => requireLogin(() => setAccountType("real"))}
                className={`rounded-md px-2 py-1 font-bold transition-all ${
                  accountType === "real"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Real
              </button>

              <div className="flex items-baseline gap-1 px-2.5 font-mono font-bold text-slate-100">
                <span className="text-[9px] font-semibold uppercase text-slate-500">
                  {currency}
                </span>
                {balance.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => requireLogin(() => setIsWalletOpen(true))}
                className="rounded-md bg-teal-500 px-2.5 py-1 text-[11px] font-bold text-slate-950 transition-colors hover:bg-teal-400"
              >
                Deposit
              </button>

              {loggedIn && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-rose-500"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="scrollbar-none w-full overflow-x-auto bg-[#0b1320]">
          <nav className="flex min-w-max items-center px-2 py-0 text-[11px] font-semibold">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-t-md px-2.5 py-1 transition-colors [@media(max-height:680px)]:py-0.5 [@media(max-height:480px)]:py-0 ${
                    isActive
                      ? "bg-teal-600 font-bold text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <NavIcon name={item.icon} className="h-3 w-3" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto flex w-full min-h-0 max-w-[1400px] min-w-0 flex-1">
        <main className="flex w-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 sm:p-4 [@media(max-height:680px)]:p-2 [@media(max-height:480px)]:p-1.5">
          {children}
        </main>
      </div>

      <TradeResultToastWrapper />
    </div>
  );
}

function NavIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "candlestick":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 4v16M17 4v16M3 8h8v8H3zm10-2h8v10h-8z"
          />
        </svg>
      );

    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      );
  }
}
