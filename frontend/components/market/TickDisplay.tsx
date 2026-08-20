"use client";

import { useMarketStore } from "@/store/marketStore";

interface Props {
  digit: number;
}

export default function DigitDisplay({
  digit,
}: Props) {

  const stats = useMarketStore(
    (state) => state.digitStats
  );

  return (

    <div className="mt-8">

      <div className="flex justify-center gap-3">

        {stats.map((item) => {

          let color = "bg-red-500";

          if (item.percent >= 20)
            color = "bg-green-600";
          else if (item.percent >= 15)
            color = "bg-green-500";
          else if (item.percent >= 10)
            color = "bg-yellow-500";
          else if (item.percent >= 5)
            color = "bg-orange-500";

          return (

            <div
              key={item.digit}
              className="flex flex-col items-center"
            >

              <div
                className={`
                  relative
                  h-14
                  w-14
                  rounded-full
                  border-2
                  flex
                  items-center
                  justify-center
                  text-xl
                  font-bold
                  transition-all
                  duration-300
                  ${
                    digit === item.digit
                      ? "border-white scale-125 shadow-2xl"
                      : "border-zinc-500"
                  }
                `}
              >

                {item.digit}

                {digit === item.digit && (

                  <div
                    className="
                    absolute
                    -top-5
                    text-2xl
                    animate-bounce
                    "
                  >
                    ▼
                  </div>

                )}

              </div>

              <div
                className={`
                  mt-2
                  h-2
                  w-10
                  rounded-full
                  ${color}
                `}
              />

            </div>

          );

        })}

      </div>

    </div>

  );

}