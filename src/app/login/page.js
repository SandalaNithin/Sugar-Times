"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Shield, CheckCircle, RefreshCw } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STEP_EMAIL   = "email";
const STEP_OTP     = "otp";
const STEP_SUCCESS = "success";

export default function LoginPage() {
  const [step, setStep]                   = useState(STEP_EMAIL);
  const [email, setEmail]                 = useState("");
  const [otp, setOtp]                     = useState(["", "", "", "", "", ""]);
  const [normalizedEmail, setNormalizedEmail] = useState("");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [resendTimer, setResendTimer]     = useState(0);
  const [shake, setShake]                 = useState(false);

  const otpRefs = useRef([]);
  const router  = useRouter();
  const { login } = useAuth(); // If using AuthContext for global state

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Auto-focus first OTP box on step change
  useEffect(() => {
    if (step === STEP_OTP) setTimeout(() => otpRefs.current[0]?.focus(), 120);
  }, [step]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const maskEmail = (mail) => {
    const [user, domain] = mail.split('@');
    if (!domain) return mail;
    const maskedUser = user.length > 2 ? `${user.slice(0, 2)}${"*".repeat(user.length - 2)}` : user;
    return `${maskedUser}@${domain}`;
  };

  // ── Step 1: Send Email OTP ──────────────────────────────────────────────────

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address.");
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/send-email-otp`, { email: email.trim() });
      const eData = res.data.email;
      setNormalizedEmail(eData);
      setStep(STEP_OTP);
      setResendTimer(60);
      toast.success("Verification code sent to your email!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP. Please try again.";
      setError(msg);
      toast.error(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: OTP input ──────────────────────────────────────────────────────

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (val && idx === 5 && next.every((d) => d !== "")) {
      handleVerifyOtp(next.join(""));
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      otpRefs.current[5]?.focus();
      setTimeout(() => handleVerifyOtp(text), 50);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────

  const handleVerifyOtp = async (code) => {
    const otpCode = code || otp.join("");
    if (otpCode.length < 6) return setError("Please enter the complete 6-digit OTP.");
    
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/verify-email-otp`, {
        email: normalizedEmail,
        otp: otpCode,
      });
      
      const { token, user } = res.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      setStep(STEP_SUCCESS);
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = user.role === "admin" ? "/admin/dashboard" : "/dashboard";
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed. Please try again.";
      setError(msg);
      toast.error(msg);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (resendTimer > 0 || loading) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setLoading(true);
    try {
      await axios.post(`${API}/auth/send-email-otp`, { email: normalizedEmail || email });
      setResendTimer(60);
      toast.success("A new verification code was sent!");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend OTP.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          15%{transform:translateX(-8px)}
          30%{transform:translateX(8px)}
          45%{transform:translateX(-6px)}
          60%{transform:translateX(6px)}
          75%{transform:translateX(-3px)}
          90%{transform:translateX(3px)}
        }
        .animate-shake { animation: shake 0.55s ease; }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(14px)}
          to{opacity:1;transform:translateY(0)}
        }
        .fade-up { animation: fadeUp 0.38s ease both; }
        @keyframes scaleIn {
          from{opacity:0;transform:scale(0.82)}
          to{opacity:1;transform:scale(1)}
        }
        .scale-in { animation: scaleIn 0.4s cubic-bezier(.34,1.56,.64,1) both; }
        .otp-box { transition: border-color 0.15s, box-shadow 0.15s; }
        .otp-box:focus { box-shadow: 0 0 0 3px rgba(16,185,129,0.3); border-color: #10b981; outline: none; }
      `}</style>

      <div className="relative min-h-screen flex items-center justify-center px-2 sm:px-3 md:px-4 py-6 md:py-8 lg:py-12 overflow-hidden">
        <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/sugar times magazine.jpg"
            alt="Sugar Times Magazine"
            fill priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-emerald-950/50 to-black/65 backdrop-blur-[2px]" />
        </div>
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl z-0" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-3xl z-0" />

        <div className="relative z-10 w-full max-w-sm sm:max-w-md">
          {/* Card */}
          <div className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-5 sm:p-6 md:p-8 lg:p-10 transition-all duration-300 ${shake ? "animate-shake" : ""}`}>

            {/* Logo */}
            <div className="flex flex-col items-center mb-5 sm:mb-6 md:mb-7">
              <Link href="/" className="transition-transform hover:scale-105">
                <Image
                  src="/sugar times main logo.png"
                  alt="Sugar Times"
                  width={160} height={70}
                  className="h-12 sm:h-14 md:h-16 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 mb-4 sm:mb-5 fade-up flex gap-2">
                <Shield size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div className="text-justify">
                  <p>{error}</p>
                  {error.toLowerCase().includes("not registered") && (
                    <span className="block mt-1.5">
                      <Link href="/subscription" className="font-bold underline text-emerald-600">
                        Subscribe here →
                      </Link>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 1: Email ── */}
            {step === STEP_EMAIL && (
              <form onSubmit={handleSendOtp} className="space-y-4 sm:space-y-5 fade-up">
                <div className="text-center mb-1">
                  <div className="w-12 sm:w-13 h-12 sm:h-13 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3" style={{ width: "3rem" }}>
                    <Mail size={20} className="text-emerald-600 sm:w-6 sm:h-6" />
                  </div>
                  <p className="text-slate-800 font-bold text-sm sm:text-base">Sign in with Email</p>
                  <p className="text-slate-400 text-[11px] sm:text-xs mt-1 text-justify">Enter your registered email address</p>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5 sm:mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all bg-white"
                    autoComplete="email"
                  />
                </div>

                <button
                  id="send-otp-btn"
                  type="submit"
                  disabled={loading || !email.includes('@')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider py-2.5 sm:py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
                >
                  {loading ? (
                    <><div className="w-3.5 sm:w-4 h-3.5 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> <span className="text-xs sm:text-sm">Sending Code…</span></>
                  ) : (
                    <><span className="text-xs sm:text-sm">Send Verification Code</span><ArrowRight size={15} /></>
                  )}
                </button>

                <p className="text-center text-[10px] sm:text-xs text-slate-400 pt-1 text-justify">
                  No account?{" "}
                  <Link href="/subscription" className="text-emerald-600 font-bold hover:underline">
                    Subscribe now
                  </Link>
                </p>
              </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === STEP_OTP && (
              <div className="space-y-5 fade-up">
                <div className="text-center mb-1">
                  <div className="w-13 h-13 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ width: "3.25rem", height: "3.25rem" }}>
                    <Shield size={24} className="text-emerald-600" />
                  </div>
                  <p className="text-slate-800 font-bold text-base">Check your Inbox</p>
                  <p className="text-slate-400 text-xs mt-1">
                    6-digit code sent to{" "}
                    <span className="font-mono font-bold text-slate-700">{maskEmail(normalizedEmail)}</span>
                  </p>
                </div>

                {/* 6-box OTP */}
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-box-${idx}`}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="otp-box w-11 text-center text-xl font-black border-2 border-slate-200 rounded-xl bg-white text-slate-800 caret-transparent"
                      style={{ height: "3.25rem" }}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                <button
                  id="verify-otp-btn"
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otp.join("").length < 6}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/30"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying…</>
                  ) : (
                    <><Shield size={15} /><span>Verify &amp; Login</span></>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep(STEP_EMAIL); setOtp(["","","","","",""]); setError(""); }}
                    className="text-slate-400 hover:text-slate-700 font-semibold transition-colors"
                  >
                    ← Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendTimer > 0 || loading}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw size={11} />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Success ── */}
            {step === STEP_SUCCESS && (
              <div className="flex flex-col items-center py-6 scale-in">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={38} className="text-emerald-500" />
                </div>
                <p className="text-slate-800 font-black text-lg">Login Successful!</p>
                <p className="text-slate-400 text-sm mt-1">Redirecting to your dashboard…</p>
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mt-5" />
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <Link href="/privacy-policy" className="text-xs font-semibold text-slate-400 hover:text-emerald-600 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>

          <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-white/70 mt-6 drop-shadow-md">
            Sugar Times · India's #1 Sugar Industry Monthly
          </p>
        </div>
      </div>
    </>
  );
}
