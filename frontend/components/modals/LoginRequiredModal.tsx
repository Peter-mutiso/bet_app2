"use client";

import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginRequiredModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" labelledBy="login-required-title">
      <div className="p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-teal-500/10 text-teal-400">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>

        <h2 id="login-required-title" className="text-lg font-extrabold text-white">
          Login required
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          You need to be signed in to place trades, deposit funds, or manage your trading
          account.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="success"
            className="w-full sm:w-auto"
            onClick={() => {
              onClose();
              router.push("/login");
            }}
          >
            Log in
          </Button>
        </div>
      </div>
    </Modal>
  );
}
