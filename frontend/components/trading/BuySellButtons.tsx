"use client";

interface BuySellButtonsProps {
  contractType?: string;
  payout?: number;
  currency?: string;
  loading?: boolean;
  onBuyPrimary?: () => void;
  onBuySecondary?: () => void;
}

export default function BuySellButtons({
  contractType = "RISE",
  payout = 0,
  currency = "USD",
  loading = false,
  onBuyPrimary,
  onBuySecondary,
}: BuySellButtonsProps) {
  const formattedPayout = Number.isNaN(Number(payout)) ? "0.00" : Number(payout).toFixed(2);

  // 1. Define UI configuration (Labels and hardcoded Tailwind classes)
  const getConfig = (type: string) => {
    switch (type) {
      case "RISE":
      case "FALL":
        return { 
          p: { label: "Higher (Rise)", class: "bg-emerald-600 hover:bg-emerald-500 border-emerald-400" },
          s: { label: "Lower (Fall)", class: "bg-rose-600 hover:bg-rose-500 border-rose-400" } 
        };
      case "EVEN":
      case "ODD":
        return { 
          p: { label: "Even", class: "bg-blue-600 hover:bg-blue-500 border-blue-400" },
          s: { label: "Odd", class: "bg-indigo-600 hover:bg-indigo-500 border-indigo-400" } 
        };
      case "DIGIT_OVER":
      case "DIGIT_UNDER":
        return { 
          p: { label: "Over", class: "bg-teal-600 hover:bg-teal-500 border-teal-400" },
          s: { label: "Under", class: "bg-amber-600 hover:bg-amber-500 border-amber-400" } 
        };
      case "DIGIT_MATCH":
      case "DIGIT_DIFFERS":
      default:
        return { 
          p: { label: "Match", class: "bg-purple-600 hover:bg-purple-500 border-purple-400" },
          s: { label: "Differs", class: "bg-orange-600 hover:bg-orange-500 border-orange-400" } 
        };
    }
  };

  const { p, s } = getConfig(contractType);

  // Reusable base styles
  const baseBtn = "group relative cursor-pointer overflow-hidden rounded-lg px-2.5 py-1.5 text-left font-sans text-white transition-all duration-150 shadow active:scale-[0.98] border disabled:opacity-50 disabled:cursor-not-allowed [@media(max-height:680px)]:px-2 [@media(max-height:680px)]:py-1 [@media(max-height:480px)]:py-0.5";

  return (
    <div className="grid grid-cols-2 gap-1.5 w-full [@media(max-height:680px)]:gap-1">
      {/* PRIMARY BUTTON */}
      <button
        type="button"
        onClick={onBuyPrimary}
        disabled={loading}
        className={`${baseBtn} ${p.class}`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-black tracking-wide">{p.label}</span>
          {loading ? (
            <span className="h-3 w-3 shrink-0 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <span className="text-xs shrink-0">▲</span>
          )}
        </div>
        <span className="text-[9px] font-bold opacity-80">
          {currency} {formattedPayout}
        </span>
      </button>

      {/* SECONDARY BUTTON */}
      <button
        type="button"
        onClick={onBuySecondary}
        disabled={loading}
        className={`${baseBtn} ${s.class}`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-black tracking-wide">{s.label}</span>
          {loading ? (
            <span className="h-3 w-3 shrink-0 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <span className="text-xs shrink-0">▼</span>
          )}
        </div>
        <span className="text-[9px] font-bold opacity-80">
          {currency} {formattedPayout}
        </span>
      </button>
    </div>
  );
}