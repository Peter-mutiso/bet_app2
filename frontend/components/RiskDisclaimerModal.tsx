"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/icons";

interface RiskDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RiskDisclaimerModal({
  isOpen,
  onClose,
}: RiskDisclaimerModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" labelledBy="risk-disclaimer-title" className="p-6 text-slate-100">
      <>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400"></span>
            <h3 id="risk-disclaimer-title" className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
              Risk Disclaimer & Regulatory Warning
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            aria-label="Close disclaimer"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="rounded-lg bg-amber-950/40 border border-amber-500/30 p-3 text-amber-200/90 font-medium">
            <strong>High-Risk Investment Warning:</strong> Trading binary options, synthetic indices, and digital contracts carries a substantial risk of loss and is not suitable for all investors.
          </div>

          <p>
            You should carefully consider your investment objectives, level of experience, and risk appetite before deciding to trade. There is a possibility that you could sustain a loss of some or all of your initial investment.
          </p>

          <p>
            Past performance is not indicative of future results. All trading strategies executed on this platform are at your own discretion and risk.
          </p>
        </div>

        {/* Footer Action */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            I Understand
          </Button>
        </div>
      </>
    </Modal>
  );
}