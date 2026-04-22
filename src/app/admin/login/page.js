"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(form.email, form.password);
      if (user.role !== "admin") {
        logout();
        setError("Access denied. Admin accounts only.");
        return;
      }
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-start justify-center px-4 pt-8 pb-12 overflow-hidden">
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
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[340px]">
        <div className="bg-white rounded-xl shadow-2xl p-6">

          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Link href="/" className="transition-transform hover:scale-105">
              <Image
                src="/sugar times main logo.png"
                alt="Sugar Times"
                width={120}
                height={50}
                className="h-11 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Email/Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 pr-9 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-400"
              />
              <span className="text-xs">Remember Me</span>
            </label>

            {/* Continue */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-2 rounded-md transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          {/* Privacy Policy */}
          <div className="mt-4 text-center">
            <Link href="/privacy-policy" className="text-xs text-purple-600 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
