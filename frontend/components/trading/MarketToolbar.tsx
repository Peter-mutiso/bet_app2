"use client";

import { useMarketStore } from "@/store/marketStore";

const MARKET_OPTIONS = [
  { label: "Volatility 10 Index", value: "R_10" },
  { label: "Volatility 25 Index", value: "R_25" },
  { label: "Volatility 50 Index", value: "R_50" },
  { label: "Volatility 75 Index", value: "R_75" },
  { label: "Volatility 100 Index", value: "R_100" },
];

const SELECT_CLASSES =
  "w-full appearance-none cursor-pointer rounded-lg border border-slate-700 bg-slate-900 py-1.5 px-2.5 pr-8 text-xs font-semibold text-slate-100 shadow-sm transition focus:border-teal-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 [@media(max-height:680px)]:py-1 [@media(max-height:480px)]:py-0.5";

function SelectChevron() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function MarketToolbar() {
  const { symbol, tradeType, setSelectedMarket, setTradeType } = useMarketStore();

  const handleMarketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSymbol = e.target.value;
    const selectedOption = MARKET_OPTIONS.find((m) => m.value === newSymbol);

    if (selectedOption) {
      // setSelectedMarket triggers the state update which
      // is picked up by your useMarketData hook to switch the socket.
      setSelectedMarket(selectedOption.label, newSymbol);
    }
  };

  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
      {/* MARKET SELECTOR */}
      <div className="relative">
        <select
          id="market-select"
          aria-label="Market"
          value={symbol}
          onChange={handleMarketChange}
          className={SELECT_CLASSES}
        >
          {MARKET_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>

      {/* TRADE TYPE SELECTOR */}
      <div className="relative">
        <select
          id="trade-type-select"
          aria-label="Trade type"
          value={tradeType}
          onChange={(e) => setTradeType(e.target.value)}
          className={SELECT_CLASSES}
        >
          <option value="EVEN_ODD">Even / Odd</option>
          <option value="RISE_FALL">Rise / Fall</option>
          <option value="MATCH_DIFFERS">Matches / Differs</option>
          <option value="OVER_UNDER">Over / Under</option>
        </select>
        <SelectChevron />
      </div>
    </div>
  );
}
