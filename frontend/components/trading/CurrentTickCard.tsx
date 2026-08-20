"use client";

import { useMarketStore } from "@/store/marketStore";

export default function CurrentTickCard() {
  const price = useMarketStore((state) => state.price);
  const digit = useMarketStore((state) => state.digit);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">

      <p className="text-xs uppercase tracking-widest text-zinc-500">
        Current Tick
      </p>

      <div className="mt-3 flex items-end justify-between">

        <div>

          <h2 className="text-5xl font-bold text-cyan-400">
            {price.toFixed(2)}
          </h2>

          <p className="mt-2 text-zinc-400">
            Volatility 100 Index
          </p>

        </div>

        <div
          className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-cyan-500
          text-3xl
          font-bold
          text-white
          "
        >
          {digit}
        </div>

      </div>

    </div>
  );
}