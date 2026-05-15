"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { setToken } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { parseApiError } from "@/lib/api";
import type { RegisterResponse } from "@/lib/types";

interface PasswordRule {
  label: string;
  test:  (password: string) => boolean;
}

interface RegisterStat {
  value: string;
  label: string;
}

const passwordRules: PasswordRule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter",  test: (p) => /[A-Z]/.test(p) },
  { label: "One number",            test: (p) => /\d/.test(p) },
];

const stats: RegisterStat[] = [
  { value: "10k+",  label: "Reports generated" },
  { value: "500+",  label: "Leagues managed" },
  { value: "99.9%", label: "Uptime SLA" },
];

export default function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName]               = useState("");
  const [username, setUsername]               = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [mounted, setMounted]                 = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [errors, setErrors]                   = useState<string[]>([]);

  useEffect(() => setMounted(true), []);

  const passwordsMatch   = confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const allRulesPassed   = passwordRules.every((r) => r.test(password));

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordMismatch) return;
    setLoading(true);
    setErrors([]);

    try {
      const res = await fetch(`${API_URL}/api/account/signup`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ full_name: fullName, username, email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors(parseApiError(data, "Registration failed. Please try again."));
        return;
      }

      const data = await res.json() as RegisterResponse;
      if (data.access_token) {
        setToken(data.access_token, data.expires_in ?? 86400);
        router.push("/");
      } else {
        router.push("/login");
      }
    } catch {
      setErrors(["Unable to connect to the server. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#08080f] overflow-hidden flex">

      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] -left-20 w-[460px] h-[460px] rounded-full bg-indigo-600/15 blur-[100px]" />
        <div className="absolute top-[40%] left-[45%] w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[90px]" />
      </div>

      {/* Left branding */}
      <div className="relative z-10 hidden lg:flex w-1/2 flex-col justify-between p-16">
        <span className="text-white text-2xl font-bold tracking-tight">Dribl</span>

        <div>
          <h2 className="text-[2.6rem] font-bold text-white leading-tight mb-5">
            Your sports command<br />
            centre,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              starts here.
            </span>
          </h2>
          <p className="text-gray-400 text-base mb-12 leading-relaxed max-w-sm">
            Join thousands of leagues and clubs already using Dribl to run
            their reporting operations smarter and faster.
          </p>

          <div className="grid grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="border-l-2 border-indigo-500/30 pl-4">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-700 text-xs">© {new Date().getFullYear()} Dribl. All rights reserved.</p>
      </div>

      {/* Right: form card */}
      <div className="relative z-10 flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] border border-white/[0.06]">
          <div className="h-[3px] bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-400" />

          <div className="bg-white px-8 py-8">
            <span className="lg:hidden block text-gray-900 text-xl font-bold tracking-tight mb-6">Dribl</span>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-gray-500 text-sm mb-7">Get started — it only takes a minute</p>

            {/* Error banner */}
            {errors.length > 0 && (
              <div key={errors.join()} className="shake mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-50 border-2 border-red-300 text-red-700 text-xs shadow-sm shadow-red-100">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-red-600 mb-0.5">Registration failed</p>
                  {errors.length === 1 ? (
                    <p className="text-red-500">{errors[0]}</p>
                  ) : (
                    <ul className="space-y-0.5 text-red-500">
                      {errors.map((e, i) => <li key={i}>• {e}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl
                             placeholder:text-gray-400 text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="alexj"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl
                             placeholder:text-gray-400 text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl
                             placeholder:text-gray-400 text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-11 text-sm bg-gray-50 border border-gray-200 rounded-xl
                               placeholder:text-gray-400 text-gray-900
                               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {password.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {passwordRules.map((rule) => {
                      const passed = rule.test(password);
                      return (
                        <li key={rule.label} className={`flex items-center gap-1.5 text-xs transition-colors ${passed ? "text-emerald-600" : "text-gray-400"}`}>
                          <CheckCircle2 size={11} className={passed ? "opacity-100" : "opacity-30"} />
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-2.5 pr-11 text-sm bg-gray-50 border rounded-xl
                               placeholder:text-gray-400 text-gray-900
                               focus:outline-none focus:ring-2 focus:border-transparent transition
                               ${passwordMismatch ? "border-red-300 focus:ring-red-400"
                                 : passwordsMatch ? "border-emerald-300 focus:ring-emerald-400"
                                 : "border-gray-200 focus:ring-indigo-500"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {passwordMismatch && <p className="mt-1.5 text-xs text-red-500">Passwords do not match</p>}
                {passwordsMatch   && <p className="mt-1.5 text-xs text-emerald-600">Passwords match ✓</p>}
              </div>

              <p className="text-xs text-gray-400 leading-relaxed pt-1">
                By creating an account you agree to our{" "}
                <button type="button" className="text-indigo-600 font-medium hover:underline underline-offset-2">Terms of Service</button>
                {" "}and{" "}
                <button type="button" className="text-indigo-600 font-medium hover:underline underline-offset-2">Privacy Policy</button>.
              </p>

              <button
                type="submit"
                disabled={!mounted || loading || passwordMismatch || !allRulesPassed}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white
                           bg-gradient-to-r from-violet-600 to-indigo-600
                           hover:from-violet-500 hover:to-indigo-500
                           active:from-violet-700 active:to-indigo-700
                           shadow-lg shadow-violet-500/25 transition-all duration-200
                           disabled:opacity-70 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <hr className="flex-1 border-gray-100" />
              <span className="text-xs text-gray-400">or</span>
              <hr className="flex-1 border-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
