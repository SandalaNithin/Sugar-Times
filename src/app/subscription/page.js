"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, Star, Award, Zap, Shield, Globe, Bell, Mail,
  Newspaper, Smartphone, ArrowRight, ChevronDown, Phone, MapPin,
  CreditCard, Building2, Banknote, MessageSquare, Loader2, X, Download
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { paymentsAPI, subscriptionsAPI } from "@/lib/api";

/* ─── Pricing Data ──────────────────────────────────────────────────── */
const PLANS = [
  {
    key: "1year", label: "1 Year", tagline: "Best for newcomers",
    printPrice: 2000, digitalPrice: 1000,
    badge: null, color: "emerald",
  },
  {
    key: "2year", label: "2 Years", tagline: "Most popular choice",
    printPrice: 3600, digitalPrice: 1600,
    badge: "Popular", color: "amber",
    savings: "Save ₹400",
  },
  {
    key: "3year", label: "3 Years", tagline: "Best value per year",
    printPrice: 5000, digitalPrice: 2000,
    badge: "Best Value", color: "sky",
    savings: "Save ₹1000",
  },
  {
    key: "life", label: "Lifetime", tagline: "Never pay again",
    printPrice: 15000, digitalPrice: 8000,
    badge: "Lifetime", color: "violet",
  },
];

const BENEFITS = [
  { icon: Newspaper, text: "Monthly print magazine delivered by courier / registered post" },
  { icon: Smartphone, text: "Digital E-Magazine access via web & mobile" },
  { icon: Bell, text: "Priority news updates via WhatsApp" },
  { icon: Mail, text: "Newsletter with industry highlights every month" },
  { icon: Globe, text: "Full access to sugartimes.co.in premium content" },
  { icon: Star, text: "Mill data, ethanol news, policy updates, market trends" },
];

const PAYMENT_METHODS = [
  {
    id: "online", icon: Smartphone, title: "Online / UPI",
    color: "from-emerald-500 to-teal-600",
    desc: "Pay instantly via UPI, cards, or net banking.",
    detail: "UPI ID: 8756062435@okbizaxis",
  },
  {
    id: "neft", icon: Building2, title: "Bank Transfer / NEFT",
    color: "from-sky-500 to-blue-600",
    desc: "NEFT / RTGS to our current account.",
    detail: "UCO Bank · A/C: 16110210000861 · IFSC: UCBA0001611 · Mumfordganj, Prayagraj",
  },
  {
    id: "cheque", icon: CreditCard, title: "Cheque / DD",
    color: "from-violet-500 to-purple-600",
    desc: "Draw cheque / DD in favour of \"Sugar Times\".",
    detail: "Payable at Allahabad. Courier: 485, Mumfordganj, Prayagraj – 211002",
  },
  {
    id: "cash", icon: Banknote, title: "Cash at Office",
    color: "from-amber-500 to-orange-600",
    desc: "Walk in during office hours.",
    detail: "485, Mumfordganj (Opp. Shivaji Park), Prayagraj – 211002",
  },
];

/* ─── Colour mapping ─────────────────────────────────────────────────── */
const COLOR = {
  emerald: {
    ring: "ring-emerald-400",
    badge: "bg-emerald-500 text-white",
    btn: "bg-emerald-600 hover:bg-emerald-700",
    glow: "shadow-emerald-200",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-400",
  },
  amber: {
    ring: "ring-amber-400",
    badge: "bg-amber-500 text-white",
    btn: "bg-amber-500 hover:bg-amber-600",
    glow: "shadow-amber-200",
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-400",
  },
  sky: {
    ring: "ring-sky-400",
    badge: "bg-sky-500 text-white",
    btn: "bg-sky-600 hover:bg-sky-700",
    glow: "shadow-sky-200",
    text: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-400",
  },
  violet: {
    ring: "ring-violet-400",
    badge: "bg-violet-600 text-white",
    btn: "bg-violet-600 hover:bg-violet-700",
    glow: "shadow-violet-200",
    text: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-400",
  },
};

/* ─── Helpers ────────────────────────────────────────────────────────── */
function formatINR(n) {
  return "₹" + n.toLocaleString("en-IN");
}

/* ─── Load Razorpay script ───────────────────────────────────────────── */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════ */
export default function SubscriptionPage() {
  const { user, isSubscribed, fetchSubscription, guestRegister } = useAuth();
  const router = useRouter();

  const [subType, setSubType] = useState("print"); // "print" | "digital"
  const [selectedPlan, setSelectedPlan] = useState(null); // plan key
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [generatedCreds, setGeneratedCreds] = useState(null); // { email, password } for guest accounts
  const formRef = useRef(null);

  const handlePlanSelect = (key) => {
    setSelectedPlan(key);
    // Smooth scroll to the form section slightly after state updates
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const [form, setForm] = useState({
    subscriberName: user?.name || "",
    designation: "",
    organisation: "",
    address: "",
    pincode: "",
    email: user?.email || "",
    mobile: "",
    dateOfBirth: "",
    plan: "",
    subscriptionType: "print",
    paymentMode: "online",
    chequeTransactionNo: "",
    dateOfPayment: "",
  });

  // Pre-fill user info when auth loads
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        subscriberName: user.name || prev.subscriberName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Pre-fill plan from URL search params (client-side only)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const plan = searchParams.get("plan");
      const type = searchParams.get("type");

      if (plan) {
        setSelectedPlan(plan);
        setForm((prev) => ({ ...prev, plan }));
        // Scroll to form with slight delay
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
      if (type && (type === "print" || type === "digital")) {
        setSubType(type);
        setForm((prev) => ({ ...prev, subscriptionType: type }));
      }
    } catch (e) {
      // Silently ignore errors during SSR
    }
  }, []);

  // Sync form subType with toggle
  useEffect(() => {
    setForm((prev) => ({ ...prev, subscriptionType: subType }));
  }, [subType]);

  // Sync form plan with card selection
  useEffect(() => {
    if (selectedPlan) setForm((prev) => ({ ...prev, plan: selectedPlan }));
  }, [selectedPlan]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Sync plan & type back to state if changed from form selects
    if (name === "subscriptionType") setSubType(value);
    if (name === "plan") setSelectedPlan(value);
  };

  /* ── Razorpay Checkout flow ────────────────────────────────────────── */
  const handlePay = async (e) => {
    e.preventDefault();
    setError("");

    const planObj = PLANS.find((p) => p.key === form.plan);
    if (!planObj) { setError("Please select a plan."); return; }

    const amount = subType === "print" ? planObj.printPrice : planObj.digitalPrice;

    setProcessing(true);

    try {
      // ── Basic validation ──────────────────────────────────────────────
      if (!user && (!form.subscriberName || !form.email)) {
        setError("Please fill in your name and email to proceed.");
        setProcessing(false);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Razorpay SDK failed to load. Check your connection.");

      // 1. Create Razorpay order on backend (public route — supports guests)
      const { data: orderData } = await paymentsAPI.createOrder({ amount, currency: "INR" });

      // 2. Open Razorpay Checkout
      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          order_id: orderData.orderId,
          name: "Sugar Times Magazine",
          description: `${planObj.label} ${subType === "print" ? "Print" : "Digital"} Subscription`,
          image: "/logo.png",
          prefill: {
            name: form.subscriberName,
            email: form.email,
            contact: form.mobile,
          },
          notes: {
            plan: form.plan,
            subscriptionType: form.subscriptionType,
          },
          theme: { color: "#16a34a" },
          handler: async (response) => {
            try {
              // 3. Verify signature server-side
              await paymentsAPI.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              // 4. Create subscription record with all form data
              // This now handles auto-registration on the backend if the user is a guest.
              const subsResponse = await subscriptionsAPI.create({
                ...form,
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              });

              // 5. If a new account was created, show credentials
              if (subsResponse.data?.isNewUser && subsResponse.data?.generatedPassword) {
                setGeneratedCreds({ 
                  email: form.email, 
                  password: subsResponse.data.generatedPassword 
                });
              }

              // 6. Refresh auth subscription status (using userId returned from backend if guest)
              const finalUserId = user?.id || user?._id || subsResponse.data?.subscription?.userId;
              if (finalUserId) {
                await fetchSubscription(finalUserId);
              }
              
              resolve();
              setSuccess(true);
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled.")),
          },
          onerror: async (error) => {
            try {
              await paymentsAPI.handleFailure({
                razorpay_order_id: error.metadata?.order_id || orderData.orderId,
                error_code: error.code || "UNKNOWN_ERROR",
                error_description: error.description || "Payment failed",
              });
            } catch (err) {
              console.error("Failed to record failure:", err);
            }
            reject(new Error(error.description || "Payment failed."));
          },
        });
        rzp.open();
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  /* ── Success screen ─────────────────────────────────────────────────── */
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 text-center max-w-md w-full border border-emerald-100 animate-fade-in">
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <CheckCircle2 className="w-8 sm:w-10 h-8 sm:h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">You&apos;re subscribed!</h2>
          <p className="text-slate-500 mb-2 text-sm text-justify">Welcome to the Sugar Times family.</p>
          <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6 text-justify">
            Your magazine will be delivered as per your selected plan. Check your email for confirmation.
          </p>

          {/* Show generated credentials for guest users */}
          {generatedCreds && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:p-5 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-amber-600" />
                <span className="text-xs sm:text-sm font-black text-amber-800">Your Account Credentials</span>
              </div>
              <p className="text-[10px] sm:text-xs text-amber-700 mb-3 text-justify">
                An account has been created for you automatically. Please save these credentials to manage your subscription.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 border border-amber-200">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">Email</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">{generatedCreds.email}</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 border border-amber-200">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">Password</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">{generatedCreds.password}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-amber-200">
                <a 
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Sugar Times Subscription Confirmation\n\nYour account has been created!\nEmail: ${generatedCreds.email}\nPassword: ${generatedCreds.password}\n\nLogin: https://sugartimes.co.in/login`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                >
                  <MessageSquare className="w-3 sm:w-4 h-3 sm:h-4" />
                  Save to WhatsApp
                </a>
              </div>

              <p className="text-[10px] sm:text-xs text-amber-600 mt-3 flex items-center justify-center gap-1">
                <Mail className="w-3 h-3" />
                A copy has also been sent to your email.
              </p>
            </div>
          )}

          <Link href="/dashboard"
            className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 sm:py-3.5 rounded-2xl transition-colors text-center text-sm sm:text-base">
            Go to Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  const currentPlanObj = PLANS.find((p) => p.key === selectedPlan);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white">
        {/* decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-20 md:py-28 text-center">
          {/* Bilingual tag */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 sm:px-4 py-1.5 mb-4 sm:mb-6 text-xs sm:text-sm font-medium">
            <Award className="w-3 sm:w-4 h-3 sm:h-4 text-amber-300" />
            Subscribe to Sugar Times
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight mb-2 sm:mb-3 px-2">
            Monthly News Magazine on<br />
            <span className="text-emerald-300">Sugar and Biofuel</span> Industry
          </h1>
          <p className="text-xs sm:text-base md:text-lg lg:text-xl text-emerald-100 mb-2 font-medium px-2 sm:px-4 text-justify">
            India&apos;s Leading Publication for the Sugar, Ethanol &amp; Bio-Energy Sector
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 mt-6 sm:mt-10">
            {[
              { value: "10,700+", label: "Subscribers across India" },
              { value: "Since 2015", label: "Established" },
              { value: "12", label: "Issues per year" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-3 sm:px-6 py-2 sm:py-4 text-center min-w-[110px] sm:min-w-[130px]">
                <div className="text-xl sm:text-2xl font-black text-emerald-300">{s.value}</div>
                <div className="text-[10px] sm:text-xs text-emerald-100 mt-0.5 text-center">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Offline Form Download */}
          <div className="flex justify-center mt-6 sm:mt-10">
            <a
              href="/subscription-form.jpg"
              download="SugarTimes_Subscription_Form.jpg"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-emerald-300/30 text-emerald-50 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all hover:scale-105 shadow-xl"
            >
              <Download className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-300" /> <span className="hidden sm:inline">Prefer offline? Download Form</span><span className="sm:hidden">Download Form</span>
            </a>
          </div>

          {/* Scroll cue */}
          <div className="flex flex-col items-center mt-8 sm:mt-12 gap-1 opacity-60 animate-bounce">
            <span className="text-[10px] sm:text-xs tracking-widest uppercase">Choose your plan</span>
            <ChevronDown className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
        </div>
      </section>

      {/* ── ACTIVE SUBSCRIPTION BANNER ─────────────────────────────────── */}
      {isSubscribed && (
        <div className="bg-emerald-600 text-white text-center py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          You have an active Sugar Times subscription. Thank you for your support!
        </div>
      )}

      {/* ── PRICING SECTION ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-16" id="plans">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2">Choose Your Plan</h2>
          <p className="text-slate-500 text-xs sm:text-sm md:text-base px-2 text-justify">Save more with longer subscriptions. Two-year and three-year plans offer significant savings.</p>

          {/* Print / Digital Toggle */}
          <div className="inline-flex items-center mt-6 bg-slate-200 rounded-full p-1">
            {["print", "digital"].map((t) => (
              <button
                key={t}
                onClick={() => setSubType(t)}
                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 capitalize ${subType === t
                    ? "bg-white shadow text-emerald-700"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {t === "print" ? "📰 Print" : "📱 Digital"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {PLANS.map((plan) => {
            const c = COLOR[plan.color];
            const price = subType === "print" ? plan.printPrice : plan.digitalPrice;
            const isSelected = selectedPlan === plan.key;
            return (
              <div
                key={plan.key}
                onClick={() => handlePlanSelect(plan.key)}
                className={`relative cursor-pointer rounded-3xl border-2 bg-white p-4 sm:p-5 lg:p-7 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isSelected ? `${c.border} ${c.glow} shadow-2xl ring-2 ${c.ring}` : "border-slate-200 hover:border-slate-300"
                  }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-black px-2 sm:px-4 py-0.5 sm:py-1 rounded-full ${c.badge} shadow`}>
                    {plan.badge}
                  </div>
                )}
                {plan.savings && (
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-green-100 text-green-700 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {plan.savings}
                  </div>
                )}

                <div className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 ${c.text}`}>{plan.label}</div>
                <p className="text-[10px] sm:text-xs text-slate-400 mb-2 sm:mb-4">{plan.tagline}</p>

                <div className="mb-4 sm:mb-6">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">{formatINR(price)}</span>
                  <span className="text-slate-400 text-[10px] sm:text-xs ml-1">/{plan.label.toLowerCase()}</span>
                </div>

                {/* Pill detail */}
                <div className={`text-[10px] sm:text-xs rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 mb-4 sm:mb-5 ${c.bg} ${c.text} font-medium text-justify`}>
                  {subType === "print"
                    ? `Delivered by Courier / Regd. Post`
                    : `Digital access on all devices`}
                </div>

                <div
                  className={`mt-auto w-full py-2 sm:py-2.5 rounded-2xl text-white text-xs sm:text-sm font-bold text-center transition-colors ${c.btn} ${isSelected ? "ring-2 ring-offset-2 " + c.ring : ""
                    }`}
                >
                  {isSelected ? "✓ Selected" : "Select Plan"}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── BENEFITS ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-3 sm:px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-2 sm:mb-3">What You Get</h2>
          <p className="text-center text-emerald-200 text-xs sm:text-sm px-2 text-justify mb-8 sm:mb-10">Everything you need to stay ahead in India&apos;s sugar industry</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 sm:gap-4 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 sm:p-5 hover:bg-white/10 transition-colors">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-300" />
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed text-justify">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO SUBSCRIBE ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 text-center mb-2">How to Subscribe</h2>
        <p className="text-slate-500 text-xs sm:text-sm text-center px-2 text-justify mb-8 sm:mb-10">Choose any payment method convenient to you</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {PAYMENT_METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.id} className="rounded-3xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                <div className={`bg-gradient-to-br ${m.color} p-4 sm:p-5 flex items-center gap-2 sm:gap-3`}>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-white text-xs sm:text-sm text-justify">{m.title}</span>
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-slate-600 text-[11px] sm:text-xs mb-2 leading-relaxed text-justify">{m.desc}</p>
                  <p className="text-slate-400 text-[10px] sm:text-[11px] leading-relaxed text-justify">{m.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SUBSCRIPTION FORM ─────────────────────────────────────────── */}
      <section className="bg-white border-t border-slate-100 py-12 sm:py-16" id="subscribe-form" ref={formRef}>
        <div className="max-w-3xl mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              <Shield className="w-4 h-4" />
              Secure Subscription Form
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2">Fill Your Details</h2>
            <p className="text-slate-500 text-xs sm:text-sm px-2 text-justify">All fields marked * are required. Your data is safe with us.</p>
          </div>

          {/* Selected plan summary */}
          {currentPlanObj && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <span className="text-xs text-emerald-600 font-semibold uppercase">Selected</span>
                <div className="font-black text-slate-900 text-sm sm:text-base">
                  {currentPlanObj.label} — {subType === "print" ? "Print" : "Digital"}
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {formatINR(subType === "print" ? currentPlanObj.printPrice : currentPlanObj.digitalPrice)}
              </div>
            </div>
          )}

          <form ref={formRef} onSubmit={handlePay} className="space-y-4 sm:space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Full Name *" name="subscriberName" value={form.subscriberName} onChange={handleFormChange} required placeholder="e.g. Rajesh Kumar" />
              <Field label="Designation" name="designation" value={form.designation} onChange={handleFormChange} placeholder="e.g. Mill Manager" />
            </div>

            {/* Row 2 */}
            <Field label="Organisation / Mill Name" name="organisation" value={form.organisation} onChange={handleFormChange} placeholder="e.g. XYZ Sugar Mills Pvt. Ltd." />

            {/* Row 3 */}
            <Field label="Complete Address *" name="address" value={form.address} onChange={handleFormChange} required placeholder="House/Shop No., Street, City, State" as="textarea" rows={3} />

            {/* Row 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Field label="Pin Code *" name="pincode" value={form.pincode} onChange={handleFormChange} required placeholder="e.g. 211002" maxLength={6} />
              <Field label="Email *" name="email" type="email" value={form.email} onChange={handleFormChange} required placeholder="yourname@example.com" />
              <Field label="Mobile Number *" name="mobile" type="tel" value={form.mobile} onChange={handleFormChange} required placeholder="+91 9XXXXXXXXX" />
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleFormChange} />
              {/* Plan Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Subscription Plan *</label>
                <select name="plan" value={form.plan} onChange={handleFormChange} required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none bg-white transition-shadow">
                  <option value="">Select Plan</option>
                  {PLANS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Type *</label>
                <select name="subscriptionType" value={form.subscriptionType} onChange={handleFormChange} required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none bg-white transition-shadow">
                  <option value="print">Print (Courier / Regd. Post)</option>
                  <option value="digital">E-Magazine (Digital)</option>
                </select>
              </div>
              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Payment Mode *</label>
                <select name="paymentMode" value={form.paymentMode} onChange={handleFormChange} required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none bg-white transition-shadow">
                  <option value="online">Online / UPI</option>
                  <option value="rtgs">RTGS / NEFT</option>
                  <option value="cheque">Cheque / DD</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              {/* Cheque/Txn No */}
              <Field label="Cheque / Transaction No." name="chequeTransactionNo" value={form.chequeTransactionNo} onChange={handleFormChange} placeholder="Optional" />
            </div>

            {/* Row 7
            <Field label="Date of Payment" name="dateOfPayment" type="date" value={form.dateOfPayment} onChange={handleFormChange} /> */}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 sm:gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                <X className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-justify">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={processing || !form.plan}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 sm:py-4 rounded-2xl text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              {processing ? (
                <><Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" /><span className="text-xs sm:text-sm">Processing…</span></>
              ) : (
                <>
                  <Zap className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="text-xs sm:text-sm">{form.plan
                    ? `Pay ${formatINR(
                      (() => {
                        const p = PLANS.find((x) => x.key === form.plan);
                        return p ? (form.subscriptionType === "print" ? p.printPrice : p.digitalPrice) : 0;
                      })()
                    )} via Razorpay`
                    : "Select a plan to continue"}</span>
                  <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
                </>
              )}
            </button>

            <p className="text-center text-[10px] sm:text-xs text-slate-400 flex flex-wrap items-center justify-center gap-1.5 pt-1 px-2 text-justify">
              <Shield className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              <span>Secured by Razorpay · 256-bit SSL encryption</span>
              {!user && (
                <span>
                  {" "}·{" "}
                  <span>Account created automatically</span>
                </span>
              )}
            </p>
          </form>
        </div>
      </section>

      {/* ── CONTACT / HELP ────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white py-10 sm:py-12">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 text-center">
          <h3 className="text-xl sm:text-2xl font-black mb-2">Need Help?</h3>
          <p className="text-emerald-200 text-xs sm:text-sm px-2 text-justify mb-6 sm:mb-8">Contact our subscription team — we&apos;re happy to assist.</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <a href="tel:+917355453462" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-[11px] sm:text-sm font-semibold transition-colors whitespace-nowrap">
              <MessageSquare className="w-3 sm:w-4 h-3 sm:h-4 text-emerald-300 flex-shrink-0" /><span className="hidden sm:inline">WhatsApp / Call: </span>+91 7355453462
            </a>
            <a href="tel:+919415305911" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-[11px] sm:text-sm font-semibold transition-colors whitespace-nowrap">
              <Phone className="w-3 sm:w-4 h-3 sm:h-4 text-emerald-300 flex-shrink-0" />+91 9415305911
            </a>
            <a href="mailto:info@sugartimes.co.in" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-[11px] sm:text-sm font-semibold transition-colors truncate">
              <Mail className="w-3 sm:w-4 h-3 sm:h-4 text-emerald-300 flex-shrink-0" /><span className="truncate">info@sugartimes.co.in</span>
            </a>
            <a href="https://sugartimes.co.in/subscribe" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-[11px] sm:text-sm font-semibold transition-colors hidden sm:flex">
              <Globe className="w-3 sm:w-4 h-3 sm:h-4 text-emerald-300 flex-shrink-0" />sugartimes.co.in/subscribe
            </a>
          </div>
          <div className="flex items-center justify-center gap-2 mt-5 sm:mt-6 text-[10px] sm:text-xs text-emerald-300 px-2">
            <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" />
            <span className="text-justify">485, Mumfordganj (Opp. Shivaji Park), Prayagraj – 211002</span>
          </div>
          <p className="mt-3 text-[10px] sm:text-xs text-emerald-400 px-2 text-justify">
            Magazine is delivered by courier / registered post. Please provide your complete address with pin code.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ─── Reusable Field Component ───────────────────────────────────────── */
function Field({ label, name, value, onChange, required, placeholder, type = "text", as, rows, maxLength }) {
  const baseClass =
    "w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-700 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none bg-white transition-shadow placeholder:text-slate-300";
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 sm:mb-1.5 uppercase tracking-wide">{label}</label>
      {as === "textarea" ? (
        <textarea name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={rows} className={baseClass + " resize-none text-justify"} />
      ) : (
        <input name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} maxLength={maxLength} className={baseClass} />
      )}
    </div>
  );
}
