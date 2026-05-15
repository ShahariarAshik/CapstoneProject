"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, BarChart2, Shield, Zap, AlertCircle, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { setToken } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { parseApiError } from "@/lib/api";
import type { LoginResponse } from "@/lib/types";

interface Feature {
  icon:  LucideIcon;
  label: string;
}

const features: Feature[] = [
  { icon: BarChart2, label: "Real-time match analytics" },
  { icon: Shield,    label: "Role-based access control" },
  { icon: Zap,       label: "AI-powered report generation" },
];

export default function LoginForm() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [errors, setErrors]             = useState<string[]>([]);

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const res = await fetch(`${API_URL}/api/account/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors(parseApiError(data, "Invalid credentials. Please try again."));
        setLoading(false);
        return;
      }

      const data = await res.json() as LoginResponse;
      setToken(data.access_token, data.expires_in);
      window.location.href = "/";
      // keep loading=true — page is navigating away, no flash
    } catch {
      setErrors(["Unable to connect to the server. Please try again."]);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#08080f] overflow-hidden flex">

      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[560px] h-[560px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[480px] h-[480px] rounded-full bg-violet-700/15 blur-[100px]" />
        <div className="absolute top-[55%] left-[38%] w-[320px] h-[320px] rounded-full bg-blue-500/10 blur-[90px]" />
      </div>

      {/* Left branding */}
      <div className="relative z-10 hidden lg:flex w-1/2 flex-col justify-between p-16">
        <span className="text-white text-2xl font-bold tracking-tight">Dribl</span>

        <div>
          <h2 className="text-[2.6rem] font-bold text-white leading-tight mb-5">
            Professional sports
            <br />
            reporting,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              reimagined.
            </span>
          </h2>
          <p className="text-gray-400 text-base mb-12 leading-relaxed max-w-sm">
            Manage leagues, track matches, and generate intelligent reports —
            all in one platform built for the modern era.
          </p>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-4 text-gray-300 text-sm">
                <span className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-indigo-400" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-gray-700 text-xs">© {new Date().getFullYear()} Dribl. All rights reserved.</p>
      </div>

      {/* Right: form card */}
      <div className="relative z-10 flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] border border-white/[0.06]">
          <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400" />

          <div className="bg-white px-8 py-10">
            <span className="lg:hidden block text-gray-900 text-xl font-bold tracking-tight mb-8">Dribl</span>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-500 text-sm mb-8">Sign in to your account to continue</p>

            {/* Error banner */}
            {errors.length > 0 && (
              <div key={errors.join()} className="shake mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-50 border-2 border-red-300 text-red-700 text-xs shadow-sm shadow-red-100">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-red-600 mb-0.5">Login failed</p>
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

            <form onSubmit={handleSubmit} className="space-y-5">
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
              </div>

              <button
                type="submit"
                disabled={!mounted || loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white
                           bg-gradient-to-r from-indigo-600 to-violet-600
                           hover:from-indigo-500 hover:to-violet-500
                           active:from-indigo-700 active:to-violet-700
                           shadow-lg shadow-indigo-500/25 transition-all duration-200
                           disabled:opacity-70 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <hr className="flex-1 border-gray-100" />
              <span className="text-xs text-gray-400">or</span>
              <hr className="flex-1 border-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
