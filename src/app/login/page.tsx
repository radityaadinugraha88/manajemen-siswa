"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Semua field wajib diisi.");
      return;
    }

    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat masuk.");
    }
  };

  const handleAutofillDemo = () => {
    setEmail("admin@sekolah.com");
    setPassword("admin123");
    setError("");
  };

  const handleDirectDemoLogin = async () => {
    setError("");
    try {
      await login("admin@sekolah.com", "admin123");
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Gagal masuk menggunakan akun demo.");
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#ebf3fc] via-[#f1f6fc] to-[#e4eef9] p-4 font-sans antialiased">
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/40 p-8 md:p-10 w-full max-w-[440px] flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_20px_50px_rgba(150,180,220,0.3)]">
        
        {/* Avatar Icon */}
        <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/20 mb-5 relative group overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight text-center mb-1">
          Welcome Back
        </h1>
        <p className="text-slate-500 text-sm text-center mb-6">
          Sign in to your account
        </p>

        {/* Demo Alert Box */}
        <button
          type="button"
          onClick={handleAutofillDemo}
          className="w-full bg-[#f0f6ff] hover:bg-[#e4efff] border border-blue-100/80 rounded-2xl py-3 px-4 flex items-center justify-center gap-1.5 text-xs text-blue-600 font-medium transition-all duration-200 cursor-pointer select-none mb-6 group outline-none focus:ring-2 focus:ring-blue-400"
        >
          <span>Akun demo:</span>
          <span className="font-bold underline">admin@sekolah.com</span>
          <span>/</span>
          <span className="font-bold underline">admin123</span>
          <span className="text-blue-400 group-hover:text-blue-600 transition-colors ml-0.5">
            (Klik untuk isi)
          </span>
        </button>

        {/* Error message */}
        {error && (
          <div className="w-full bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl py-3 px-4 mb-4 flex items-start gap-2 animate-shake">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          {/* Email input */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[13px] font-semibold text-slate-600 ml-1">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                disabled={loading}
                placeholder="Your email address"
                className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 text-[15px]"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[13px] font-semibold text-slate-600 ml-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                disabled={loading}
                placeholder="Your password"
                className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-2xl pl-11 pr-11 py-3.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 text-[15px]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl py-3.5 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Demo Button */}
        <button
          type="button"
          onClick={handleDirectDemoLogin}
          disabled={loading}
          className="w-full mt-3 bg-white hover:bg-slate-50 text-blue-600 font-semibold border border-blue-200/80 rounded-2xl py-3.5 shadow-sm active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          Use Demo Account (admin@sekolah.com)
        </button>

        {/* Register link */}
        <div className="mt-8 text-sm text-slate-500 text-center font-medium">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors font-bold"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
