"use client";

import { useMarketStore } from "@/store/marketStore";

export default function DigitDisplay() {
  const currentDigit = useMarketStore(
    (state) => state.digit
  );

  const stats = useMarketStore(
    (state) => state.digitStats
  );

  const max = Math.max(
    ...stats.map((s) => s.percent)
  );

  const min = Math.min(
    ...stats.map((s) => s.percent)
  );

  function getColor(percent: number) {

    const ratio =
      max === min
        ? 0.5
        : (percent - min) / (max - min);

    if (ratio > 0.8)
      return "bg-green-500";

    if (ratio > 0.6)
      return "bg-lime-500";

    if (ratio > 0.4)
      return "bg-yellow-500";

    if (ratio > 0.2)
      return "bg-orange-500";

    return "bg-red-500";
  }

  return (

    <div className="mt-8">

      <div className="flex justify-center gap-3 flex-wrap">

        {stats.map((item) => {

          const active =
            item.digit === currentDigit;

          return (

            <div
              key={item.digit}
              className={`
                relative
                h-14
                w-14
                rounded-full
                flex
                items-center
                justify-center
                text-lg
                font-bold
                text-white
                transition-all
                duration-300
                ${getColor(item.percent)}
                ${
                  active
                    ? "scale-125 ring-4 ring-white shadow-[0_0_30px_rgba(255,255,255,.8)]"
                    : ""
                }
              `}
            >
              {item.digit}

              <div
                className="
                absolute
                -bottom-6
                text-[10px]
                text-zinc-400
                "
              >
                {item.percent.toFixed(0)}%
              </div>

            </div>

          );

        })}

      </div>

    </div>

  );
}