"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  ArrowRight, 
  Shield, 
  CheckCircle, 
  RefreshCw, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  KeyRound
} from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STEP_EMAIL    = "email";
const STEP_OTP      = "otp";
const STEP_PASSWORD = "password";
const STEP_SUCCESS  = "success";

export default function ForgotPasswordPage() {
  const [step, setStep]                   = useState(STEP_EMAIL);
  const [email, setEmail]                 = useState("");
  const [otp, setOtp]                     = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [resendTimer, setResendTimer]     = useState(0);
  const [resetToken, setResetToken]       = useState("");
  const [shake, setShake]                 = useState(false);

  const otpRefs = useRef([]);
  const router  = useRouter();

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

  // ── Step 1: Send Reset OTP ──────────────────────────────────────────────────

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
      const res = await axios.post(`${API}/auth/forgot-password`, { email: email.trim() });
      setStep(STEP_OTP);
      setResendTimer(60);
      toast.success("Verification code sent to your email!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to initiate reset. Please try again.";
      setError(msg);
      toast.error(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: OTP Handlers ───────────────────────────────────────────────────

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
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
    }
  };

  const handleVerifyOtp = async (code) => {
    const otpCode = code || otp.join("");
    if (otpCode.length < 6) return setError("Please enter the complete 6-digit OTP.");
    
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/verify-reset-otp`, {
        email: email.trim(),
        otp: otpCode,
      });
      setResetToken(res.data.resetToken);
      setStep(STEP_PASSWORD);
      toast.success("Verification successful! Now create your new password.");
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

  // ── Step 3: Reset Password ─────────────────────────────────────────────────

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      triggerShake();
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      triggerShake();
      return;
    }

    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/auth/reset-password`, {
        resetToken,
        newPassword,
      });
      setStep(STEP_SUCCESS);
      toast.success("Password updated successfully!");
      setTimeout(() => router.push("/admin/login"), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password.";
      setError(msg);
      toast.error(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend ─────────────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (resendTimer > 0 || loading) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email: email.trim() });
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
      `}</style>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className={`bg-white rounded-2xl shadow-2xl p-8 md:p-10 transition-all duration-300 ${shake ? "animate-shake" : ""}`}>
            
            {/* Logo */}
            <div className="flex flex-col items-center mb-7">
              <Link href="/" className="transition-transform hover:scale-105">
                <Image
                  src="/sugar times main logo.png"
                  alt="Sugar Times"
                  width={160} height={70}
                  className="h-16 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 fade-up flex gap-2">
                <Shield size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* ── STEP 1: Email ── */}
            {step === STEP_EMAIL && (
              <form onSubmit={handleSendOtp} className="space-y-5 fade-up">
                <div className="text-center mb-1">
                  <div className="w-13 h-13 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ width: "3.25rem", height: "3.25rem" }}>
                    <KeyRound size={24} className="text-purple-600" />
                  </div>
                  <p className="text-slate-800 font-black text-lg text-center">Reset Password</p>
                  <p className="text-slate-400 text-xs mt-1 text-center">Enter your admin email to receive a reset code</p>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                    Admin Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sugartimes.co.in"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.includes('@')}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black uppercase tracking-wider py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-500/20"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                  ) : (
                    <><span>Send Reset Code</span><ArrowRight size={16} /></>
                  )}
                </button>

                <div className="text-center">
                  <Link href="/admin/login" className="text-xs text-slate-400 hover:text-purple-600 font-bold transition-colors flex items-center justify-center gap-1">
                    <ArrowLeft size={12} /> Back to Admin Login
                  </Link>
                </div>
              </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === STEP_OTP && (
              <div className="space-y-5 fade-up">
                <div className="text-center mb-1">
                  <div className="w-13 h-13 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ width: "3.25rem", height: "3.25rem" }}>
                    <Shield size={24} className="text-purple-600" />
                  </div>
                  <p className="text-slate-800 font-black text-lg">Verify Reset Code</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Code sent to <span className="font-bold text-slate-700">{maskEmail(email)}</span>
                  </p>
                </div>

                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 text-center text-xl font-black border-2 border-slate-300 rounded-lg bg-white text-slate-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                      style={{ width: "2.75rem", height: "3.25rem" }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otp.join("").length < 6}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black uppercase tracking-wider py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-500/20"
                >
                  {loading ? "Verifying…" : "Verify Code"}
                </button>

                <div className="flex items-center justify-between text-xs">
                  <button onClick={() => setStep(STEP_EMAIL)} className="text-slate-400 hover:text-slate-700 font-semibold">
                    ← Change Email
                  </button>
                  <button onClick={handleResend} disabled={resendTimer > 0 || loading} className="text-purple-600 hover:text-purple-700 font-bold disabled:opacity-40">
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Create Password ── */}
            {step === STEP_PASSWORD && (
              <form onSubmit={handleResetPassword} className="space-y-5 fade-up">
                <div className="text-center mb-1">
                  <div className="w-13 h-13 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ width: "3.25rem", height: "3.25rem" }}>
                    <Lock size={24} className="text-purple-600" />
                  </div>
                  <p className="text-slate-800 font-black text-lg">Create New Password</p>
                  <p className="text-slate-400 text-xs mt-1 text-center">Set a strong password for your account</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none bg-white pr-11 text-slate-800"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none bg-white text-slate-800"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || newPassword.length < 6}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black uppercase tracking-wider py-3 rounded-lg transition-all shadow-lg shadow-purple-500/20"
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            )}

            {/* ── STEP 4: Success ── */}
            {step === STEP_SUCCESS && (
              <div className="flex flex-col items-center py-6 scale-in">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={38} className="text-purple-500" />
                </div>
                <p className="text-slate-800 font-black text-lg text-center">Password Changed!</p>
                <p className="text-slate-400 text-sm mt-1 text-center">Your password has been updated. Redirecting to login…</p>
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mt-5" />
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
