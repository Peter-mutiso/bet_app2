"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { useWalletStore } from "@/store/walletStore";
import AmountModal from "@/components/ui/AmountModal";

export default function BalanceCard() {

  const balance =
    useWalletStore(
      (state) => state.balance
    );

  const setBalance =
    useWalletStore(
      (state) => state.setBalance
    );

  const [loading, setLoading] =
    useState(false);

  const [depositOpen, setDepositOpen] =
    useState(false);

  const [withdrawOpen, setWithdrawOpen] =
    useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {

    try {

      const wallet =
        await api<any>("/wallet");

      setBalance(
        Number(wallet.balance)
      );

    } catch (error) {

      console.error(
        "Failed to load wallet",
        error
      );

    }

  }

  async function deposit(amount: number) {

    try {

      setLoading(true);

      const wallet =
        await api<any>(
          "/wallet/deposit",
          {
            method: "PATCH",
            body: JSON.stringify({
              amount,
            }),
          }
        );

      setBalance(
        Number(wallet.balance)
      );

    } catch (error) {

      console.error(error);

      alert("Deposit failed.");

    } finally {

      setLoading(false);

    }

  }

  async function withdraw(amount: number) {

    try {

      setLoading(true);

      const wallet =
        await api<any>(
          "/wallet/withdraw",
          {
            method: "PATCH",
            body: JSON.stringify({
              amount,
            }),
          }
        );

      setBalance(
        Number(wallet.balance)
      );

    } catch (error) {

      console.error(error);

      alert("Withdrawal failed.");

    } finally {

      setLoading(false);

    }

  }

  return (

    <>

      <AmountModal
        open={depositOpen}
        title="Deposit Funds"
        buttonText="Deposit"
        loading={loading}
        onClose={() => setDepositOpen(false)}
        onConfirm={deposit}
      />

      <AmountModal
        open={withdrawOpen}
        title="Withdraw Funds"
        buttonText="Withdraw"
        loading={loading}
        onClose={() => setWithdrawOpen(false)}
        onConfirm={withdraw}
      />

      <div
        className="
        rounded-xl
        border
        border-zinc-800
        bg-zinc-900
        p-5
        shadow-lg
        "
      >

        <div
          className="
          flex
          items-center
          justify-between
          "
        >

          <p
            className="
            text-sm
            text-zinc-400
            "
          >
            Demo Balance
          </p>

          <span
            className="
            rounded-full
            bg-green-900
            px-2
            py-1
            text-xs
            text-green-300
            "
          >
            DEMO
          </span>

        </div>

        <h2
          className="
          mt-3
          text-3xl
          font-bold
          text-green-400
          "
        >
          KES{" "}
          {balance.toLocaleString("en-KE")}
        </h2>

        <div
          className="
          mt-6
          grid
          grid-cols-2
          gap-3
          "
        >

          <button
            onClick={() =>
              setDepositOpen(true)
            }
            className="
            rounded-lg
            bg-green-600
            py-2
            font-semibold
            hover:bg-green-500
            "
          >
            Deposit
          </button>

          <button
            onClick={() =>
              setWithdrawOpen(true)
            }
            className="
            rounded-lg
            bg-red-600
            py-2
            font-semibold
            hover:bg-red-500
            "
          >
            Withdraw
          </button>

        </div>

      </div>

    </>

  );

}