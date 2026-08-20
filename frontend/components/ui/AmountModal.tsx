"use client";

import { useState } from "react";

interface AmountModalProps {
  open: boolean;
  title: string;
  buttonText: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void> | void;
}

export default function AmountModal({
  open,
  title,
  buttonText,
  loading = false,
  onClose,
  onConfirm,
}: AmountModalProps) {

  const [amount, setAmount] = useState(100);

  if (!open) return null;

  async function submit() {

    if (amount <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    await onConfirm(amount);

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

      <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-bold text-white">
          {title}
        </h2>

        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) =>
            setAmount(Number(e.target.value))
          }
          className="mt-5 w-full rounded-lg bg-zinc-800 p-3 text-white outline-none"
        />

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-700 px-4 py-2"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={submit}
            className="rounded-lg bg-green-600 px-4 py-2 font-semibold hover:bg-green-500 disabled:opacity-50"
          >
            {buttonText}
          </button>

        </div>

      </div>

    </div>
  );
}