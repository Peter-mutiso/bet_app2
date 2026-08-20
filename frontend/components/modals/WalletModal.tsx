"use client";

import { useEffect, useState } from "react";
import { useWalletStore } from "@/store/walletStore";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { CheckCircleIcon, CloseIcon, WalletIcon, XCircleIcon } from "@/components/ui/icons";

const QUICK_AMOUNTS = [50, 100, 250, 500];

type Status = "idle" | "success" | "error";

export default function WalletModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { balance, currency, processDeposit, processWithdraw, isLoading } = useWalletStore();
  const [activeTab, setActiveTab] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // Reset transient state whenever the modal is re-opened.
  useEffect(() => {
    if (isOpen) {
      setStatus("idle");
      setAmount("");
    }
  }, [isOpen]);

  const numericAmount = Number(amount);
  const isValidAmount = amount.trim() !== "" && numericAmount > 0;
  const exceedsBalance = activeTab === "WITHDRAW" && numericAmount > balance;

  async function handleSubmit() {
    if (!isValidAmount || exceedsBalance) return;

    const success =
      activeTab === "DEPOSIT"
        ? await processDeposit(numericAmount)
        : await processWithdraw(numericAmount);

    setStatus(success ? "success" : "error");
    if (success) setAmount("");
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" labelledBy="wallet-modal-title">
      <div className="p-6">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-400">
              <WalletIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 id="wallet-modal-title" className="text-base font-extrabold text-white">
                Wallet
              </h2>
              <p className="font-mono text-xs text-slate-400">
                Balance: <span className="text-slate-200">{currency} {balance.toFixed(2)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close wallet"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-8 text-center animate-zoom-in">
            <CheckCircleIcon className="h-10 w-10 text-emerald-400" />
            <div>
              <p className="text-sm font-bold text-emerald-300">
                {activeTab === "DEPOSIT" ? "Deposit" : "Withdrawal"} submitted
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Your new balance is {currency} {balance.toFixed(2)}.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex gap-2 rounded-lg bg-slate-900 p-1">
              {(["DEPOSIT", "WITHDRAW"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setStatus("idle");
                  }}
                  className={`flex-1 rounded-md py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                    activeTab === tab
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab === "DEPOSIT" ? "Deposit" : "Withdraw"}
                </button>
              ))}
            </div>

            <label htmlFor="wallet-amount" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">
              Amount ({currency})
            </label>
            <input
              id="wallet-amount"
              type="number"
              min={0}
              inputMode="decimal"
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 font-mono text-lg font-bold text-white outline-none transition focus:border-teal-500"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setStatus("idle");
              }}
            />

            <div className="mt-2.5 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setAmount(String(quick))}
                  className="rounded-md border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300 transition-colors hover:border-teal-500 hover:text-white"
                >
                  {currency} {quick}
                </button>
              ))}
            </div>

            {exceedsBalance && (
              <p className="mt-2.5 text-xs font-semibold text-amber-400">
                Amount exceeds your available balance.
              </p>
            )}

            {status === "error" && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-950/30 px-3 py-2.5 text-xs text-rose-300">
                <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  We couldn&apos;t process this {activeTab === "DEPOSIT" ? "deposit" : "withdrawal"}.
                  Please try again in a moment.
                </span>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!isValidAmount || exceedsBalance}
              loading={isLoading}
              variant={activeTab === "DEPOSIT" ? "success" : "danger"}
              fullWidth
              className="mt-5"
            >
              {isLoading ? "Processing..." : `Confirm ${activeTab === "DEPOSIT" ? "deposit" : "withdrawal"}`}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
