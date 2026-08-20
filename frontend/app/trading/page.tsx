"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useMarketData } from "@/hooks/useMarketData";
import { useMarketHeartbeat } from "@/hooks/useMarketHeartbeat";
import MarketToolbar from "@/components/trading/MarketToolbar";
import DigitTicker from "@/components/trading/DigitTicker";
import DigitProbabilityRow from "@/components/trading/DigitProbabilityRow";
import RiskDisclaimerModal from "@/components/RiskDisclaimerModal";
import BuyPanel from "@/components/trading/BuyPanel";

const PANEL_CLASSES =
  "rounded-2xl border border-slate-800 bg-[#0d1626] p-[var(--panel-p)] shadow-sm";

export default function TradingPage() {
  useAuthGuard();
  useMarketData();
  useMarketHeartbeat();

  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  return (
    <DashboardLayout>
      {/* Locked to the viewport (DashboardLayout's shell is h-dvh/overflow-
          hidden, <main> is flex-1 min-h-0/overflow-hidden). The previous
          attempt at this made every container min-h-0 with NOTHING to
          contain the overflow, so when a panel was squeezed smaller than
          its content, that content painted on top of whatever came next in
          the page instead of scrolling or being clipped — that's what
          caused the digit-prediction keypad and the digit-distribution
          circles to visually overlap. The fix: min-h-0 (so a container CAN
          shrink) is only ever paired with overflow-hidden on the same
          element (so if it's genuinely squeezed, the excess is clipped
          within its own box, not spilled onto neighbors). Individual cards
          inside each column keep their natural min-height — only the
          column itself is the clip boundary, so in the rare case content
          doesn't fully fit, at most the bottom of the last section in a
          column is trimmed, never an overlap. */}
      <div className="flex w-full min-h-0 flex-1 flex-col gap-[var(--section-gap)]">
        {/* Market / trade-type selectors. No explicit flex-grow/shrink here —
            the browser default (0 1 auto, min-height:auto) already means
            this renders at its natural size and only compresses toward its
            real content floor (native <select> rows don't have much give)
            if something else genuinely needs the room. */}
        <div className={`${PANEL_CLASSES} shrink-0`}>
          <MarketToolbar />
        </div>

        {/* Workspace: stacked on mobile, CSS Grid side-by-side from md up. */}
        <div className="flex min-h-0 flex-1 flex-col gap-[var(--section-gap)] md:grid md:grid-cols-3">
          {/* LEFT: live price + digit distribution. overflow-hidden here is
              the clip boundary — never overflow-y-auto/scroll. Risk
              Disclaimer lives here (left side of the page), as a small
              button that only takes the width it needs. */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-[var(--section-gap)] overflow-hidden md:col-span-2 md:pr-1">
            <div className={`${PANEL_CLASSES} shrink-0`}>
              <DigitTicker />
            </div>
            {/* flex-1 (no min-h-0 here): this card grows to fill whatever
                EXTRA height is left over in the left column, but — unlike
                min-h-0 — can never be squeezed smaller than its own content
                needs. That distinction matters: a version of this that also
                had min-h-0 let the grid's real content escape a
                too-small box with nothing to contain it, which is what
                caused the two rows of circles to overlap. */}
            <div className={`${PANEL_CLASSES} flex flex-1 flex-col`}>
              <DigitProbabilityRow />
            </div>

            <button
              type="button"
              onClick={() => setIsDisclaimerOpen(true)}
              className="flex shrink-0 items-center gap-1 self-start rounded-md border border-amber-500/25 bg-amber-950/20 px-2 py-0.5 text-[10px] font-bold text-amber-300/90 transition-colors hover:border-amber-500/50 hover:bg-amber-950/30"
            >
              <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                />
              </svg>
              Risk Disclaimer
            </button>
          </div>

          {/* RIGHT: trade controls (stake, keypad, Over/Under). Every
              element in BuyPanel is now shrink-0 (protected, always full
              size) — the digit-prediction keypad is compact enough on its
              own that it no longer needs to be a sacrificial/clippable
              element. overflow-hidden remains a safety-net clip boundary,
              not something that should normally ever engage. */}
          <div className="min-h-0 min-w-0 overflow-hidden md:col-span-1 md:pl-0.5">
            <BuyPanel />
          </div>
        </div>
      </div>

      <RiskDisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </DashboardLayout>
  );
}
