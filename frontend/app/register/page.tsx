"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password Strength
  const passwordStrength = useMemo(() => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  }, [password]);

  const strengthLabel = useMemo(() => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "Very weak";
      case 2:
        return "Weak";
      case 3:
        return "Medium";
      case 4:
        return "Strong";
      case 5:
        return "Very strong";
      default:
        return "";
    }
  }, [passwordStrength]);

  const passwordsMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const canSubmit =
    username.trim() !== "" &&
    email.trim() !== "" &&
    passwordStrength >= 4 &&
    passwordsMatch &&
    agreeTerms;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setError(null);

    if (!agreeTerms) {
      setError("You must agree to the Terms & Conditions.");
      return;
    }

    if (passwordStrength < 4) {
      setError("Please choose a stronger password.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const backendMessage = data.message;
        const errorMessage = Array.isArray(backendMessage)
          ? backendMessage[0]
          : backendMessage || "Registration failed. Please try again.";

        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
      }

      router.push("/login");
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const strengthColor =
    passwordStrength <= 1
      ? "text-rose-400"
      : passwordStrength === 2
      ? "text-orange-400"
      : passwordStrength === 3
      ? "text-amber-400"
      : "text-emerald-400";

  const strengthBarColor = (level: number) =>
    passwordStrength >= level
      ? passwordStrength <= 2
        ? "bg-rose-500"
        : passwordStrength === 3
        ? "bg-amber-500"
        : "bg-emerald-500"
      : "bg-slate-800";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 py-10">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500 text-2xl font-black text-slate-950 shadow-lg shadow-teal-500/20">
              Q
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tight text-white">
                QUANT<span className="text-teal-400">TRADER</span>
              </h1>
              <p className="text-sm text-slate-400">Professional Trading Platform</p>
            </div>
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-2xl sm:p-8">
          <h2 className="text-2xl font-black text-white sm:text-3xl">Create your account</h2>
          <p className="mt-2 mb-6 text-sm text-slate-400 sm:mb-8">
            Register to start trading synthetic indices.
          </p>

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-rose-500/40 bg-rose-900/20 p-3.5 text-sm text-rose-300"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="reg-username" className="mb-1.5 block text-sm font-bold text-slate-300">
                Username
              </label>
              <input
                id="reg-username"
                required
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3.5 text-white placeholder-slate-500 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-sm font-bold text-slate-300">
                Email address
              </label>
              <input
                id="reg-email"
                required
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3.5 text-white placeholder-slate-500 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="mb-1.5 block text-sm font-bold text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby="password-strength"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3.5 pr-16 text-white placeholder-slate-500 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-400 transition-colors hover:text-teal-300"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Password Strength */}
            <div id="password-strength" className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-slate-400">Password strength</span>
                <span className={`font-bold ${strengthColor}`}>{strengthLabel}</span>
              </div>

              <div className="mb-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div key={level} className={`h-1.5 flex-1 rounded-full transition-colors ${strengthBarColor(level)}`} />
                ))}
              </div>

              <ul className="space-y-1 text-xs">
                <li className={password.length >= 8 ? "text-emerald-400" : "text-slate-500"}>
                  {password.length >= 8 ? "✓" : "·"} At least 8 characters
                </li>
                <li className={/[A-Z]/.test(password) ? "text-emerald-400" : "text-slate-500"}>
                  {/[A-Z]/.test(password) ? "✓" : "·"} One uppercase letter
                </li>
                <li className={/[a-z]/.test(password) ? "text-emerald-400" : "text-slate-500"}>
                  {/[a-z]/.test(password) ? "✓" : "·"} One lowercase letter
                </li>
                <li className={/\d/.test(password) ? "text-emerald-400" : "text-slate-500"}>
                  {/\d/.test(password) ? "✓" : "·"} One number
                </li>
                <li className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-400" : "text-slate-500"}>
                  {/[^A-Za-z0-9]/.test(password) ? "✓" : "·"} One special character
                </li>
              </ul>
            </div>

            <div>
              <label htmlFor="reg-confirm-password" className="mb-1.5 block text-sm font-bold text-slate-300">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="reg-confirm-password"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-xl border bg-slate-900 p-3.5 pr-16 text-white placeholder-slate-500 outline-none transition focus:ring-1 ${
                    confirmPassword.length === 0
                      ? "border-slate-700 focus:border-teal-500 focus:ring-teal-500"
                      : passwordsMatch
                      ? "border-emerald-500 focus:ring-emerald-500"
                      : "border-rose-500 focus:ring-rose-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-400 transition-colors hover:text-teal-300"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <p className={`mt-1.5 text-xs font-semibold ${passwordsMatch ? "text-emerald-400" : "text-rose-400"}`}>
                  {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 accent-teal-500"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="font-semibold text-teal-400 hover:underline">
                  Terms &amp; Conditions
                </Link>
              </span>
            </label>

            {/* Privacy */}
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 accent-teal-500"
              />
              <span>
                I have read the{" "}
                <Link href="/privacy" className="font-semibold text-teal-400 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              disabled={!canSubmit}
              loading={loading}
              fullWidth
              size="lg"
              className="mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
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
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-teal-400 transition hover:text-teal-300 hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
