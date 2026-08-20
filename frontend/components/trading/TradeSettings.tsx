"use client";

import { useState } from "react";

export default function TradeSettings() {
  const [stake, setStake] = useState(100);

  const [ticks, setTicks] = useState(5);

  const [bulk, setBulk] = useState(1);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">

      <div className="grid grid-cols-3 gap-4">

        <div>

          <label className="text-xs text-zinc-400">
            Ticks
          </label>

          <input
            type="number"
            value={ticks}
            onChange={(e) =>
              setTicks(Number(e.target.value))
            }
            className="mt-2 w-full rounded-lg bg-zinc-800 p-3"
          />

        </div>

        <div>

          <label className="text-xs text-zinc-400">
            Stake
          </label>

          <input
            type="number"
            value={stake}
            onChange={(e) =>
              setStake(Number(e.target.value))
            }
            className="mt-2 w-full rounded-lg bg-zinc-800 p-3"
          />

        </div>

        <div>

          <label className="text-xs text-zinc-400">
            Bulk Trades
          </label>

          <input
            type="number"
            value={bulk}
            onChange={(e) =>
              setBulk(Number(e.target.value))
            }
            className="mt-2 w-full rounded-lg bg-zinc-800 p-3"
          />

        </div>

      </div>

    </div>
  );
}