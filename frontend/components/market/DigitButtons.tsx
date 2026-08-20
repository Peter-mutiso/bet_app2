"use client";

interface Props {
  selected: number | null;
  onSelect: (digit: number) => void;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function DigitButtons({ selected, onSelect }: Props) {
  return (
    <div
      className="grid grid-cols-5 gap-1.5 [@media(max-height:680px)]:gap-1 [@media(max-height:480px)]:gap-0.5"
      role="group"
      aria-label="Select a digit to predict"
    >
      {DIGITS.map((digit) => {
        const isSelected = selected === digit;

        return (
          <button
            key={digit}
            type="button"
            onClick={() => onSelect(digit)}
            aria-pressed={isSelected}
            aria-label={`Predict digit ${digit}${isSelected ? " (selected)" : ""}`}
            className={`
              aspect-square w-full max-w-11 mx-auto flex items-center justify-center
              rounded-lg border font-bold text-xs transition-all duration-150
              [@media(max-height:680px)]:max-w-8 [@media(max-height:680px)]:text-[10px]
              [@media(max-height:480px)]:max-w-6 [@media(max-height:480px)]:text-[9px]
              active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100
              ${
                isSelected
                  ? "border-teal-400 bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/30"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:border-teal-500 hover:bg-slate-700 hover:text-white"
              }
            `}
          >
            {digit}
          </button>
        );
      })}
    </div>
  );
}
