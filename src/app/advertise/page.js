"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Factory,
  FlaskConical,
  Sprout,
  Landmark,
  Building2,
  Microscope,
  TrendingUp,
  Wrench,
  Newspaper,
  Globe,
  Share2,
  MessageCircle,
  Gift,
  FileImage,
  Mail,
  CheckCircle2,
  CreditCard,
  Phone,
  MapPin,
  Clock,
  Send,
  Loader2,
  AlertCircle,
  Sparkles,
  Users,
  Target,
  Award,
} from "lucide-react";
import { contactAPI } from "@/lib/api";

const AUDIENCE = [
  { icon: Factory, title: "Sugar Mills & Cooperatives", detail: "UP, Maharashtra, Karnataka, Bihar, AP, TN" },
  { icon: FlaskConical, title: "Distilleries & Ethanol Producers", detail: "Bio-energy sector leaders" },
  { icon: Sprout, title: "Sugarcane Farmers", detail: "Large-scale growers & cane societies" },
  { icon: Landmark, title: "Molasses & ENA Traders", detail: "Domestic & export network" },
  { icon: Building2, title: "Sugar Federations", detail: "ISMA, AISTA, UPSMA, DSTA, state depts" },
  { icon: Microscope, title: "Research Institutes", detail: "NSI Kanpur, ICAR-IISR, VSI" },
  { icon: TrendingUp, title: "Financial Analysts", detail: "Investors tracking listed sugar cos." },
  { icon: Wrench, title: "Equipment & Tech Suppliers", detail: "Chemical & service providers" },
];

const REACH_STATS = [
  { value: "10,700+", label: "Monthly Copies", icon: Newspaper },
  { value: "9,800+", label: "YouTube Subscribers", icon: Users },
  { value: "5,700+", label: "Facebook Followers", icon: Share2 },
  { value: "#1", label: "Hindi Sugar Monthly", icon: Award },
];

const BENEFITS = [
  {
    icon: Newspaper,
    title: "Print Magazine",
    description: "Featured in the monthly printed edition, distributed to 10,700+ readers across India.",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Globe,
    title: "Digital / Website",
    description: "Your ad appears on digital news posts at sugartimes.co.in for the entire ad period.",
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    icon: Share2,
    title: "Social Media Push",
    description: "Promoted across Facebook, YouTube, Twitter, LinkedIn, and WhatsApp.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Network",
    description: "Your contact is added to WhatsApp groups of related sugar companies & pros.",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

const ADVERTISERS = [
  "Excel",
  "Bottmac",
  "Spray Engineering Devices",
  "Avant Garde",
  "PP Boilers",
  "Meru Industries",
  "Isha Agro",
  "Prompt Spray",
  "Tayaltech Consultancy",
  "Stitch Experts India",
  "Dhampur Bio Organics",
];

const SPECS = [
  { label: "Artwork Format", value: "JPG or CDR (CorelDraw)" },
  { label: "Send Artwork To", value: "info@sugartimes.co.in" },
  { label: "Artwork Approval", value: "Every month, prior to going for print" },
  { label: "Payment Terms", value: "100% advance along with release of PO / WO" },
  { label: "Cheque / DD In Favour Of", value: '"Sugar Times" — Payable at Allahabad' },
];

const AD_TYPES = ["Full Page", "Half Page", "Cover", "Digital Only", "Package"];
const DURATIONS = ["1 Month", "3 Months", "6 Months", "12 Months"];

export default function AdvertisePage() {
  const [form, setForm] = useState({
    fullName: "",
    designation: "",
    organisation: "",
    email: "",
    contactNo: "",
    adType: AD_TYPES[0],
    duration: DURATIONS[0],
    commentsOrMessage: "",
  });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contactNo") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length > 10) return;
      setForm((prev) => ({ ...prev, [name]: digitsOnly }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await contactAPI.send({
        fullName: form.fullName,
        designation: form.designation,
        email: form.email,
        contactNo: form.contactNo,
        subject: `Advertising Enquiry — ${form.adType} / ${form.duration}`,
        commentsOrMessage: `Organisation: ${form.organisation}\nAd Type: ${form.adType}\nDuration: ${form.duration}\n\n${form.commentsOrMessage}`,
      });
      setStatus("success");
      setForm({
        fullName: "",
        designation: "",
        organisation: "",
        email: "",
        contactNo: "",
        adType: AD_TYPES[0],
        duration: DURATIONS[0],
        commentsOrMessage: "",
      });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.message || err.message || "Failed to send. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50/50 to-white font-sans">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0b1c13] via-emerald-900 to-teal-900 py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-[0.2em] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Advertise With Us
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-5 leading-tight tracking-tight">
            Advertise in <span className="text-emerald-300">Sugar Times</span>
          </h1>
          <p className="text-lg md:text-xl text-emerald-200/90 mb-4 font-medium">
            Reach India&apos;s Sugar Industry Decision-Makers — Every Month
          </p>
          <p className="text-base md:text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
            Sugar Times is India&apos;s leading monthly news magazine for the sugar and bio-energy sector, with
            over <span className="font-bold text-emerald-300">10,700+ copies</span> distributed every month. Put
            your brand directly in front of the professionals who make purchasing, policy, and investment decisions.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <a
              href="#media-kit"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-6 py-3 rounded-full transition-all hover:scale-105 shadow-xl"
            >
              <Send className="w-4 h-4" />
              Request Media Kit
            </a>
            <a
              href="#specifications"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-emerald-300/30 text-emerald-50 text-sm font-bold px-6 py-3 rounded-full transition-all hover:scale-105"
            >
              <FileImage className="w-4 h-4 text-emerald-300" />
              View Specifications
            </a>
          </div>
        </div>
      </section>

      {/* REACH STATS STRIP */}
      <section className="relative -mt-10 z-10 max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {REACH_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center hover:shadow-lg transition-all">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-slate-900">{stat.value}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-[0.2em] mb-3">
            <Target className="w-4 h-4" />
            Who Will See Your Ad
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Your Audience</h2>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
            Strong geographic hold in northern India — especially Uttar Pradesh, the country&apos;s largest sugarcane-producing state.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AUDIENCE.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.title} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-lg transition-all group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-black text-slate-900 text-sm mb-1">{a.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{a.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm mb-1">Special Discounts Available</h3>
            <p className="text-sm text-slate-600">
              Existing Sugar Times associates and long-term advertisers get preferred pricing.
              <a href="#media-kit" className="font-bold text-amber-700 hover:underline ml-1">Contact us for a personalised quote.</a>
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">What You Get</h2>
            <p className="text-slate-500 text-sm md:text-base">A 360° exposure package across print, digital, and social channels</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className={`relative ${b.bg} rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-black text-lg text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{b.description}</p>
                </div>
              );
            })}
          </div>

          <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white flex flex-col md:flex-row items-center gap-4 shadow-xl">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200 mb-1">Bonus Offer</div>
              <h3 className="font-black text-lg md:text-xl">
                1-Year Complimentary Sugar Times Subscription
              </h3>
              <p className="text-sm text-emerald-100/90">
                Worth ₹2,000/- — free with every annual advertisement booking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OUR PATRONS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-[0.2em] mb-3">
            <Award className="w-4 h-4" />
            Trusted By Industry Leaders
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Our Patrons</h2>
          <p className="text-slate-500 text-sm md:text-base">Leading brands and organizations that support Sugar Times</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="relative w-full h-auto">
            <Image
              src="/SED logo.jpg"
              alt="SED — Spray Engineering Devices, Our Patron"
              width={1400}
              height={700}
              className="w-full h-auto object-contain p-8 md:p-12"
              priority
            />
          </div>
        </div>
      </section>

      {/* SPECIFICATIONS + PAYMENT */}
      <section id="specifications" className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-6">
          {/* Specs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center gap-3">
              <FileImage className="w-5 h-5 text-emerald-400" />
              <h3 className="text-white font-black text-lg">Advertisement Specifications</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {SPECS.map((spec) => (
                <div key={spec.label} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">{spec.label}</div>
                  <div className="text-sm font-bold text-slate-900">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-5 flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-emerald-200" />
              <h3 className="text-white font-black text-lg">Payment Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">Bank</div>
                <div className="text-sm font-bold text-slate-900">UCO Bank, Mumfordganj Branch, Prayagraj</div>
              </div>
              <div>
                <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">Current A/C No.</div>
                <div className="text-sm font-bold text-slate-900 font-mono">16110210000861</div>
              </div>
              <div>
                <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">IFSC Code</div>
                <div className="text-sm font-bold text-slate-900 font-mono">UCBA0001611</div>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-xs uppercase font-bold text-emerald-700 tracking-wider mb-1">UPI ID</div>
                <div className="text-sm font-black text-emerald-900 font-mono">8756062435@okbizaxis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEDIA KIT FORM */}
      <section id="media-kit" className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white px-6 md:px-8 py-5 border-b border-slate-200">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-1">Request a Media Kit / Get a Quote</h2>
              <p className="text-sm text-slate-500">We typically respond within 24 hours on working days.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              {status === "success" && (
                <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Thank you — your enquiry has been sent. Our team will get back to you shortly.</span>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-2 tracking-wide">Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-2 tracking-wide">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="e.g., Marketing Head"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-2 tracking-wide">Company / Organisation</label>
                  <input
                    type="text"
                    name="organisation"
                    value={form.organisation}
                    onChange={handleChange}
                    placeholder="Your company name"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-2 tracking-wide">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-2 tracking-wide">
                    Phone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactNo"
                    required
                    value={form.contactNo}
                    onChange={handleChange}
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-2 tracking-wide">Type of Advertisement</label>
                  <select
                    name="adType"
                    value={form.adType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 bg-white transition-all"
                  >
                    {AD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-2 tracking-wide">Duration</label>
                  <select
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 bg-white transition-all"
                  >
                    {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-2 tracking-wide">Message / Special Requirements</label>
                  <textarea
                    name="commentsOrMessage"
                    value={form.commentsOrMessage}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell us about your campaign goals, creative preferences, or any questions..."
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Request Media Kit
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Aside */}
          <aside className="lg:col-span-2 space-y-4">
            <div className="bg-gradient-to-br from-[#0b1c13] via-emerald-900 to-teal-900 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300 mb-3">Contact for Advertising</div>
              <h3 className="text-xl font-black mb-1">Ms. Shashi Yogeshwar</h3>
              <p className="text-sm text-emerald-200/90 mb-5">Business Manager, Sugar Times Magazine</p>

              <div className="space-y-4">
                <a href="tel:+917355453462" className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/30 transition-colors">
                    <Phone className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-300/70 font-bold">Phone / WhatsApp</div>
                    <div className="text-sm font-bold">+91 7355453462</div>
                  </div>
                </a>
                <a href="mailto:info@sugartimes.co.in" className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/30 transition-colors">
                    <Mail className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-300/70 font-bold">Email</div>
                    <div className="text-sm font-bold break-all">info@sugartimes.co.in</div>
                  </div>
                </a>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-300/70 font-bold">Office</div>
                    <div className="text-sm font-bold leading-relaxed">
                      485, Mumfordganj<br />(Opp. Shivaji Park)<br />Prayagraj – 211002
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">Quick Response</div>
                <p className="text-xs text-slate-500 mt-1">We typically respond to advertising inquiries within 24 hours on working days.</p>
              </div>
            </div>

            <Link href="/contact" className="block bg-slate-900 hover:bg-slate-800 text-white rounded-2xl p-5 text-center transition-colors">
              <div className="text-xs font-black uppercase tracking-widest text-emerald-300 mb-1">Have general questions?</div>
              <div className="text-sm font-bold">Visit our Contact Page →</div>
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
