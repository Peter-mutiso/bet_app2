"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The backend puts the token in the URL fragment (#token=...), not a
    // query string, so it's never sent to any server or logged in a Referer
    // header. It only ever lives in the browser.
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;

    const params = new URLSearchParams(hash);
    const token = params.get("token");

    if (!token) {
      setError("We couldn't complete Google sign-in. Please try again.");
      return;
    }

    setToken(token);
    // Clear the token out of the visible URL immediately.
    window.history.replaceState(null, "", "/auth/callback");

    (async () => {
      try {
        const user = await api<{ id: string; username: string; email: string; role: string }>(
          "/auth/me"
        );
        localStorage.setItem("user", JSON.stringify(user));
      } catch (err) {
        console.error("Failed to load profile after Google sign-in", err);
      } finally {
        router.replace("/trading");
      }
    })();
  }, [router, setToken]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      {error ? (
        <div className="w-full max-w-sm rounded-2xl border border-rose-500/30 bg-rose-950/30 p-6 text-center">
          <p className="text-sm font-bold text-rose-300">Sign-in failed</p>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <Link
            href="/login"
            className="mt-5 inline-block rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Spinner size="lg" />
          <p className="text-sm font-semibold">Finishing Google sign-in...</p>
        </div>
      )}
    </main>
  );
}
