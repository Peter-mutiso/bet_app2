"use client";

import Link from "next/link";
import { TrendingUpIcon, WalletIcon, CheckCircleIcon } from "@/components/ui/icons";

const FEATURES = [
  {
    icon: TrendingUpIcon,
    title: "Real-time market data",
    description: "Live tick-by-tick pricing streamed straight from the market.",
  },
  {
    icon: CheckCircleIcon,
    title: "Instant execution",
    description: "Trades are placed and confirmed in real time, no delays.",
  },
  {
    icon: WalletIcon,
    title: "Simple wallet management",
    description: "Deposit, withdraw, and track your balance with full clarity.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-white">
      <div className="max-w-3xl animate-slide-up space-y-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-400" />
          </span>
          Live markets, open now
        </div>

        <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500 sm:text-5xl md:text-6xl">
          Advanced Market Trading
        </h1>

        <p className="text-base text-slate-400 sm:text-lg md:text-xl">
          Execute fast, secure trades on your favorite synthetic indices. Real-time data,
          instant execution, and professional analysis.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/trading"
            className="rounded-xl bg-emerald-600 px-8 py-4 text-lg font-bold shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-500"
          >
            Start Trading Now
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-slate-700 bg-slate-800 px-8 py-4 text-lg font-bold transition-all hover:-translate-y-0.5 hover:bg-slate-700"
          >
            Log In to Account
          </Link>
        </div>

        <div className="text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-teal-400 hover:underline">
            Register here
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-slate-700"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10 text-teal-400">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
