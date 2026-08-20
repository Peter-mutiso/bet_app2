"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setToken = useAuthStore((state) => state.setToken);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("error") === "google_auth_failed") {
      setErrorMessage("Google sign-in failed. Please try again or use your email and password.");
    }
  }, [searchParams]);

  async function login() {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const result = await api<{
        accessToken: string;
        user: any;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const { accessToken, user } = result;

      setToken(accessToken);

      if (rememberMe) {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", accessToken);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      router.push("/trading");
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;

      if (Array.isArray(backendMessage)) {
        setErrorMessage(backendMessage[0]);
      } else if (typeof backendMessage === "string") {
        setErrorMessage(backendMessage);
      } else {
        setErrorMessage("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="mb-8 text-center">

          <Link
            href="/"
            className="inline-flex items-center gap-3"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500 text-2xl font-black text-slate-950 shadow-lg">
              Q
            </div>

            <div className="text-left">
              <h1 className="text-2xl font-black text-white tracking-tight">
                QUANT
                <span className="text-teal-400">
                  TRADER
                </span>
              </h1>

              <p className="text-sm text-slate-400">
                Professional Trading Platform
              </p>
            </div>
          </Link>

        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-2xl sm:p-8">

          <h2 className="text-2xl font-black text-white sm:text-3xl">
            Welcome back 👋
          </h2>

          <p className="mt-2 mb-6 text-slate-400 sm:mb-8">
            Sign in to continue trading your favorite synthetic indices.
          </p>

          {errorMessage && (
            <div role="alert" className="mb-6 rounded-xl border border-rose-500/40 bg-rose-900/20 p-4 text-sm text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* Email */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-bold text-slate-300">
              Email Address
            </label>

            <div className="relative">

              <input
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white placeholder-slate-500 outline-none transition focus:border-teal-500"
              />

              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12H8m8-4H8m8 8H8"
                />
              </svg>

            </div>

          </div>
                    {/* Password */}

          <div className="mb-4">

            <label className="mb-2 block text-sm font-bold text-slate-300">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Enter your password"
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    login();
                  }
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-4 pr-16 text-white placeholder-slate-500 outline-none transition focus:border-teal-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

          {/* Remember Me & Forgot Password */}

          <div className="mb-6 flex items-center justify-between">

            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-teal-500"
              />

              Remember me

            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-teal-400 transition hover:text-teal-300 hover:underline"
            >
              Forgot password?
            </Link>

          </div>

          {/* Login Button */}

          <Button
            onClick={login}
            disabled={!email.trim() || !password.trim()}
            loading={loading}
            fullWidth
            size="lg"
            rightIcon={
              !loading && (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )
            }
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-800" />
            <span className="px-3 text-xs font-semibold text-slate-500">OR CONTINUE WITH</span>
            <div className="flex-1 border-t border-slate-800" />
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
            }}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900 py-3.5 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
          >
            <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 15 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2c-2.1 1.6-4.6 2.4-7.3 2.4-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.5 16.3 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.3 5.3-6.1 6.8l6.2 5.2C39.1 36.6 44 31 44 24c0-1.3-.1-2.3-.4-3.5z"
              />
            </svg>
            Continue with Google
          </button>
                    {/* Register Link */}

          <div className="mt-8 text-center">

            <p className="text-slate-400">
              Don&apos;t have an account?
            </p>

            <Link
              href="/register"
              className="mt-2 inline-block font-bold text-teal-400 transition hover:text-teal-300 hover:underline"
            >
              Create your account
            </Link>

          </div>

          {/* Divider */}

          <div className="my-8 flex items-center gap-4">

            <div className="h-px flex-1 bg-slate-800" />

            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Navigation
            </span>

            <div className="h-px flex-1 bg-slate-800" />

          </div>

          {/* Back Home */}

          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 font-semibold text-slate-300 transition hover:border-teal-500 hover:bg-slate-900 hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>

            Back to Home
          </Link>

          {/* Security Notice */}

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">

            <div className="flex items-start gap-3">

              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">

                <svg
                  className="h-5 w-5 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11c0 .53-.21 1.04-.59 1.41A2 2 0 0110 13a2 2 0 01-1.41-.59A2 2 0 018 11V8a4 4 0 118 0v3zm6 0v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-7"
                  />
                </svg>

              </div>

              <div>

                <h3 className="font-bold text-white">
                  Secure Login
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  Your credentials are encrypted during transmission.
                  Never share your password or verification codes with anyone.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Footer */}

        <p className="mt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-slate-400">
            QuantTrader
          </span>
          . All rights reserved.
        </p>

      </div>

    </main>
  );
}