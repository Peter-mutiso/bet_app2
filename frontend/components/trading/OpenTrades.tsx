"use client";

import { useEffect } from "react";
import { useTradeStore } from "@/store/tradeStore";

export default function OpenTrades() {

  const trades =
    useTradeStore(
      (state) => state.openTrades
    );

  const removeTrade =
    useTradeStore(
      (state) => state.removeTrade
    );

  useEffect(() => {

    const timers: NodeJS.Timeout[] = [];

    trades
      .filter(
        (trade) =>
          trade.status !== "OPEN"
      )
      .forEach((trade) => {

        timers.push(

          setTimeout(() => {

            removeTrade(
              trade.id
            );

          }, 4000)

        );

      });

    return () => {

      timers.forEach(
        clearTimeout
      );

    };

  }, [trades, removeTrade]);

  return (

    <div
      className="
      rounded-xl
      border
      border-zinc-800
      bg-zinc-900
      p-5
      text-white
      "
    >

      <h2
        className="
        mb-5
        text-lg
        font-semibold
        "
      >
        Open Trades
      </h2>

      {
        trades.length === 0

        ?

        (

          <div
            className="
            rounded-lg
            border
            border-dashed
            border-zinc-700
            p-6
            text-center
            text-zinc-500
            "
          >

            No active trades

          </div>

        )

        :

        (

          <div className="space-y-4">

            {

              trades.map((trade) => {

                const progress =

                  (trade.remainingTicks /
                    trade.tickDuration) * 100;

                return (

                  <div
                    key={trade.id}
                    className="
                    rounded-xl
                    bg-zinc-800
                    p-4
                    shadow
                    "
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <h3 className="font-semibold">

                          {trade.symbol}

                        </h3>

                        <p className="text-xs text-zinc-400">

                          {trade.contractType}

                        </p>

                      </div>

                      <span
                        className={`

                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-bold

                        ${
                          trade.status === "OPEN"

                            ? "bg-yellow-700 text-yellow-200"

                            : trade.status === "WON"

                            ? "bg-green-700 text-green-200"

                            : "bg-red-700 text-red-200"

                        }

                        `}
                      >

                        {trade.status}

                      </span>

                    </div>

                    <div
                      className="
                      mt-4
                      grid
                      grid-cols-2
                      gap-y-2
                      text-sm
                      "
                    >

                      <span className="text-zinc-400">

                        Stake

                      </span>

                      <span>

                        KES{" "}

                        {Number(
                          trade.stake
                        ).toLocaleString("en-KE")}

                      </span>

                      <span className="text-zinc-400">

                        Entry

                      </span>

                      <span>

                        {Number(
                          trade.entryPrice
                        ).toFixed(4)}

                      </span>

                      <span className="text-zinc-400">

                        Remaining

                      </span>

                      <span className="text-yellow-400 font-semibold">

                        {trade.remainingTicks} ticks

                      </span>

                    </div>

                    {
                      trade.status === "OPEN"

                      &&

                      <>

                        <div
                          className="
                          mt-4
                          h-2
                          overflow-hidden
                          rounded-full
                          bg-zinc-700
                          "
                        >

                          <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                      </>

                    }

                    {

                      trade.status !== "OPEN"

                      &&

                      <div
                        className={`

                        mt-4
                        rounded-lg
                        p-3
                        text-center
                        font-bold

                        ${
                          trade.status === "WON"

                            ? "bg-green-900 text-green-300"

                            : "bg-red-900 text-red-300"

                        }

                        `}
                      >

                        {

                          trade.status === "WON"

                            ? "🎉 Trade Won"

                            : "❌ Trade Lost"

                        }

                        {

                          trade.profit !== undefined

                          &&

                          <div className="mt-2">

                            {

                              trade.profit >= 0

                                ? "+"

                                : ""

                            }

                            KES{" "}

                            {Number(
                              trade.profit
                            ).toLocaleString("en-KE")}

                          </div>

                        }

                      </div>

                    }

                  </div>

                );

              })

            }

          </div>

        )

      }

    </div>

  );

}