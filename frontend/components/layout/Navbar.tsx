"use client";

export default function Navbar() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        <div className="text-2xl font-bold text-blue-500">
          BetPro
        </div>

        <nav className="flex gap-8 text-zinc-300">
          <button className="hover:text-white">
            Trading
          </button>

          <button className="hover:text-white">
            Wallet
          </button>

          <button className="hover:text-white">
            History
          </button>

          <button className="hover:text-white">
            Profile
          </button>
        </nav>

        <div className="rounded-lg bg-green-700 px-4 py-2 font-semibold">
          KES 10,000
        </div>

      </div>
    </header>
  );
}