"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "", remember: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, register } = useAuth();

  const isRegister = mode === "register";

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = isRegister
        ? await register(form.name, form.email, form.password)
        : await login(form.email, form.password);
      router.push(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isRegister ? "Registration failed. Please try again." : "Login failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background Magazine Cover */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/sugar times magazine.jpg"
          alt="Sugar Times Magazine"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-emerald-950/45 to-black/60 backdrop-blur-[2px]" />
      </div>

      {/* Decorative glow */}
      <div className="absolute -top-40 -right-40 w-[520px] h-[520px] bg-emerald-500/20 rounded-full blur-3xl z-0" />
      <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] bg-teal-500/20 rounded-full blur-3xl z-0" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 md:p-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <Link href="/" className="transition-transform hover:scale-105">
              <Image
                src="/sugar times main logo.png"
                alt="Sugar Times"
                width={160}
                height={70}
                className="h-16 w-auto object-contain"
                priority
              />
            </Link>
            <p className="text-slate-500 mt-3 text-xs font-bold uppercase tracking-[0.2em]">
              {isRegister ? "Create your account" : "Sign in to continue"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (register only) */}
            {isRegister && (
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all bg-white"
                  />
                </div>
              </div>
            )}

            {/* Email / Member Number */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                Email  <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot (login only) */}
            {!isRegister && (
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                />
                <span className="text-xs font-semibold">Remember Me</span>
              </label>
              <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                Forgot password?
              </a>
            </div>
            )}

            {/* Continue */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white font-black uppercase tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isRegister ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>
                  {isRegister ? "Create Account" : "Continue"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <Link href="/policy" className="text-xs font-semibold text-slate-500 hover:text-emerald-600 hover:underline">
              Privacy Policy
            </Link>
            <div className="w-full h-px bg-slate-100" />
            <div className="text-xs text-slate-500">
              {isRegister ? "Already have an account?" : "No account?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-emerald-600 font-bold hover:underline"
              >
                {isRegister ? "Sign in" : "Register"}
              </button>
              {!isRegister && (
                <>
                  {" "}or{" "}
                  <Link href="/subscription" className="text-emerald-600 font-bold hover:underline">Subscribe</Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Brand Strip */}
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-white/70 mt-6 drop-shadow-md">
          Sugar Times &middot; India&apos;s #1 Sugar Industry Monthly
        </p>
      </div>
    </div>
  );
}
