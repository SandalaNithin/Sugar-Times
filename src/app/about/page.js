import React from "react";
import Link from "next/link";
import Image from "next/image";
import TeamPhotoCard from "./TeamPhotoCard";

export const metadata = {
  title: "About Sugar Times Magazine — India's Voice for the Sugar & Bio-Energy Industry",
  description:
    "Learn about Sugar Times Magazine — India's leading monthly news magazine for the sugar industry, ethanol sector, sugarcane farming, and bio-energy industries since 2016.",
};

async function getMagazines() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/magazines`);
    const data = res.ok ? await res.json() : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return `${apiUrl}${url}`;
};

// ─── Static Data ──────────────────────────────────────────────────────────────

const COVERAGE_AREAS = [
  {
    icon: "🏭",
    title: "Sugar Industry News",
    desc: "We track sugar mill operations, production and crushing data, sugar prices, levy and quota policies, and all major developments from ISMA, AISTA, DFPD, and state sugar departments.",
    colorBar: "#10b981",
    bg: "#f0fdf4",
    borderHover: "#bbf7d0",
  },
  {
    icon: "⚡",
    title: "Ethanol & Bio-Energy",
    desc: "India's ethanol blending programme is one of the most significant energy policy stories of our time. Sugar Times covers distillery announcements, KLPD capacities, biofuel policy changes, and India's march toward E20 and beyond.",
    colorBar: "#f59e0b",
    bg: "#fffbeb",
    borderHover: "#fde68a",
  },
  {
    icon: "🌾",
    title: "Farmer / किसान",
    desc: "Sugarcane farmers are the backbone of the industry. We cover SAP and FRP rates, state-wise cane pricing, government schemes, and agri-technology innovations relevant to millions of farmers across India.",
    colorBar: "#84cc16",
    bg: "#f7fee7",
    borderHover: "#d9f99d",
  },
  {
    icon: "📊",
    title: "Market & International Trade",
    desc: "We track global sugar prices, India's export and import position, international molasses and ENA trade, and the shifting dynamics of the world sugar market — from Brazil to Thailand to the EU.",
    colorBar: "#3b82f6",
    bg: "#eff6ff",
    borderHover: "#bfdbfe",
  },
  {
    icon: "🔬",
    title: "Technology, Research & Innovation",
    desc: "From processing techniques at the mill to biogas from filter cake, from low-GI sugar development at NSI Kanpur to bioplastic policies — Sugar Times covers the science and innovation driving the sector.",
    colorBar: "#8b5cf6",
    bg: "#f5f3ff",
    borderHover: "#ddd6fe",
  },
  {
    icon: "🍯",
    title: "Jaggery & Sugar Food",
    desc: "India's jaggery sector is a world unto itself. We cover artisanal and industrial jaggery, health and nutrition stories related to sugar and its alternatives, and food-sector developments linked to the cane industry.",
    colorBar: "#ec4899",
    bg: "#fdf2f8",
    borderHover: "#f9a8d4",
  },
];

const READERSHIP = [
  "Sugar mills and co-operative societies across UP, Maharashtra, Karnataka, Bihar, AP, TN & Gujarat",
  "Distillery owners and operators tracking ethanol policy and production updates",
  "Sugarcane farmers in Hindi and English, across all major cane-growing states",
  "Molasses traders and ENA exporters following market and regulatory developments",
  "Government officials at state sugar departments and central ministries",
  "Research institutions including NSI Kanpur, ICAR-IISR Lucknow, IITs, and Vasantdada Sugar Institute",
  "Sugar industry federations including ISMA, AISTA, UPSMA, and DSTA",
  "Financial analysts and investors tracking listed sugar and ethanol companies",
  "Equipment suppliers, chemical companies, and service providers to the industry",
];

const STATS = [
  { value: "10+", label: "Years of Reporting" },
  { value: "2016", label: "Founded" },
  { value: "100K+", label: "Monthly Readers" },
  { value: "6", label: "Coverage Verticals" },
];

const TEAM = [
  {
    name: "PS Mishra",
    role: "Managing Editor",
    image: "/about/ps-mishra.jpg",
    desc: "A veteran journalist and industry insider who founded Sugar Times in 2016 with a vision to fill the information gap in India's sugar and bio-energy sector.",
  },
  {
    name: "Rajesh Kumar Chaubey",
    role: "Chief Editor",
    image: "/about/rajesh-chaubey.jpg",
    desc: "A seasoned editorial leader ensuring unparalleled journalistic standards in every issue of Sugar Times, covering critical policy and market developments.",
  },
  {
    name: "Pranav Mishra",
    role: "CEO",
    image: "/about/pranav-mishra.jpg",
    desc: "Driving the digital transformation of Sugar Times, expanding the platform's reach across print, web, and social media to serve the entire sugar value chain.",
  },
];

const PUB_DETAILS = [
  { label: "Publication Name", value: "Sugar Times Magazine" },
  { label: "Type", value: "Monthly News Magazine + Digital Portal" },
  { label: "Language", value: "English & Hindi" },
  { label: "Published From", value: "Prayagraj, Uttar Pradesh, India" },
  { label: "Website", value: "sugartimes.co.in" },
  { label: "Founded", value: "2016" },
];

// ─── Page Component ────────────────────────────────────────────────────────────

export default async function AboutPage() {
  const dbMagazines = await getMagazines();
  const magazines = dbMagazines.slice(0, 3);

  const getImgUrl = (url) => getImageUrl(url);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — HERO
          Magazine Collage (left) + Headline & Stats (right)
      ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: "linear-gradient(135deg, #0b1c13 0%, #0f2d1a 50%, #0b1c13 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial glow accent */}
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 60% 50% at 70% 50%, rgba(74,222,128,0.12) 0%, transparent 70%)",
          }}
        />
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.05,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-54 relative"
          style={{ zIndex: 10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── LEFT: Main Image Feature ── */}
            <div className="relative flex justify-center items-center h-full min-h-[500px] lg:min-h-[700px]">
              {/* Giant soft glow behind the collage */}
              <div
                className="absolute"
                style={{
                  width: "200%", height: "400%",
                  maxHeight: "800px",
                  borderRadius: "100%",
                  background: "radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 100%)",
                  filter: "blur(50px)",
                }}
              />
              
              {/* Image Frame */}
              <div
                className="relative z-15 group mx-auto flex items-center justify-center transition-transform hover:scale-[1.02] duration-700 w-full"
                style={{ maxWidth: "850px" }} // Increased from 600px
              >
                <img
                  src="/about/magazine-collage.png"
                  alt="Sugar Times Magazine Collection"
                  className="w-full h-auto lg:h-full lg:object-contain relative z-20 drop-shadow-[0_30px_45px_rgba(0,0,0,0.65)]"
                  style={{ display: "block" }}
                />
                
                {/* Est. Badge attached directly to the image container */}
                <div
                  className="absolute z-30 transform group-hover:-translate-y-2 transition-transform duration-500"
                  style={{
                    bottom: "-10px", right: "20px",
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "900",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    padding: "5px 22px",
                    borderRadius: "999px",
                    boxShadow: "0 10px 30px rgba(34,197,94,0.5)",
                    border: "2px solid rgba(255,255,255,0.2)"
                  }}
                >
                  Est. 2016
                </div>
              </div>
            </div>

            {/* ── RIGHT: Hero Text & Stats ── */}
            <div className="space-y-7 text-center lg:text-left">
              {/* Brand Logo */}
              <div className="flex justify-center lg:justify-start">
                <div className="bg-white rounded-2xl p-4 shadow-2xl inline-block">
                  <Image
                    src="/sugar times main logo.png"
                    alt="Sugar Times"
                    width={220}
                    height={80}
                    priority
                    className="h-16 w-auto object-contain"
                  />
                </div>
              </div>

              {/* Label badge */}
              <div className="flex justify-center lg:justify-start">
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "rgba(74,222,128,0.1)",
                    border: "1px solid rgba(74,222,128,0.25)",
                    color: "#4ade80",
                    fontSize: "11px", fontWeight: "900",
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    padding: "8px 18px",
                    borderRadius: "999px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "6px", height: "6px",
                      borderRadius: "50%", background: "#4ade80",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  About Sugar Times
                </span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  fontWeight: "900",
                  color: "white",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                India&apos;s{" "}
                <span
                  style={{
                    background: "linear-gradient(to right, #4ade80, #86efac)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Trusted Voice
                </span>{" "}
                for the Sugar & Bio-Energy Industry
              </h1>

              <p style={{ color: "#cbd5e1", fontSize: "16px", lineHeight: "1.7", maxWidth: "500px" }}
                className="mx-auto lg:mx-0">
                Sugar Times is a monthly news magazine and digital media platform
                dedicated to India&apos;s sugar industry, ethanol sector, sugarcane farming,
                and allied bio-energy industries. From breaking policy news to
                ground-level farmer stories — Sugar Times covers it all, in one place.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link
                  href="/subscription"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "#22c55e", color: "white",
                    fontWeight: "900", textTransform: "uppercase",
                    letterSpacing: "0.12em", fontSize: "12px",
                    padding: "14px 28px",
                    borderRadius: "999px",
                    boxShadow: "0 8px 30px rgba(34,197,94,0.35)",
                    textDecoration: "none",
                    transition: "all 0.3s",
                  }}
                >
                  Subscribe Now
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/contact"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    border: "1px solid rgba(148,163,184,0.5)",
                    color: "#cbd5e1",
                    fontWeight: "700", textTransform: "uppercase",
                    letterSpacing: "0.12em", fontSize: "12px",
                    padding: "14px 28px",
                    borderRadius: "999px",
                    textDecoration: "none",
                    transition: "all 0.3s",
                  }}
                >
                  Contact Us
                </Link>
              </div>

              {/* Stats Row */}
              <div
                style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "16px", paddingTop: "24px",
                  borderTop: "1px solid rgba(71,85,105,0.6)",
                }}
              >
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: "900", color: "white" }}>
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: "9px", fontWeight: "700",
                        textTransform: "uppercase", letterSpacing: "0.15em",
                        color: "#64748b", lineHeight: "1.3", marginTop: "2px",
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — OUR STORY
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#f8faf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Text */}
            <div className="space-y-6 order-2 lg:order-1">
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-green-600 mb-3 block">
                  Our Story
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                  Born from a <span className="text-green-600">Mission</span> to Inform
                </h2>
              </div>
              <div className="space-y-4 text-slate-600 leading-relaxed text-[15px]">
                <p>
                  Sugar Times was founded in <strong className="text-slate-800">2016</strong> with a single, clear
                  purpose: to fill the information gap in India&apos;s sugar and bio-energy sector.
                  At a time when industry stakeholders — mill owners, cane farmers, distillery operators,
                  molasses traders — were scattered across sources with no single reliable publication
                  to turn to, Sugar Times stepped in.
                </p>
                <p>
                  What began as a print magazine published from{" "}
                  <strong className="text-slate-800">Prayagraj, Uttar Pradesh</strong> has grown into
                  a trusted multi-platform media brand. Today, Sugar Times reaches thousands of readers
                  every month through print, the website{" "}
                  <a
                    href="https://sugartimes.co.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline font-semibold"
                  >
                    sugartimes.co.in
                  </a>
                  , YouTube, WhatsApp updates, and active social media communities.
                </p>
                <p>
                  Over the years, we have covered landmark moments in the Indian sugar industry —
                  from the ethanol blending programme&apos;s rise to 15% and beyond, to historic
                  changes in FRP and SAP rates, to the expansion of distilleries across UP and Bihar,
                  to India&apos;s growing role in global sugar trade.
                </p>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="order-1 lg:order-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: "🗞️",
                  title: "Print Magazine",
                  desc: "Monthly print edition delivered across India's sugar belt states",
                },
                {
                  icon: "🌐",
                  title: "Digital Portal",
                  desc: "24/7 news coverage at sugartimes.co.in with real-time updates",
                },
                {
                  icon: "📺",
                  title: "YouTube Channel",
                  desc: "Video content covering industry events, interviews & mill tours",
                },
                {
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M16 31c8.284 0 15-6.716 15-15S24.284 1 16 1 1 7.716 1 16c0 2.826.787 5.465 2.152 7.717L1 31l7.534-1.936A14.935 14.935 0 0 0 16 31z" fill="#25D366"/>
                      <path d="M23.52 19.2c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.67-2.1-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.8.37s-1.05 1.02-1.05 2.5c0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.5.71.3 1.26.48 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" fill="white"/>
                    </svg>
                  ),
                  title: "WhatsApp & Social",
                  desc: "Instant news updates directly to industry professionals",
                },
              ].map((feat) => (
                <div
                  key={feat.title}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-300 group"
                >
                  <span className="text-3xl block mb-3">{feat.icon}</span>
                  <h3 className="font-black text-slate-900 text-[15px] mb-1.5 group-hover:text-green-700 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — WHAT WE COVER  (6-card grid)
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-green-600 mb-3 block">
              Editorial Coverage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">
              What We Cover
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Comprehensive, authoritative reporting across every segment of India&apos;s
              sugar and bio-energy value chain.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COVERAGE_AREAS.map((area) => (
              <div
                key={area.title}
                className="relative rounded-2xl p-6 border border-white hover:shadow-lg transition-all duration-300 group overflow-hidden"
                style={{ background: area.bg }}
              >
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ background: area.colorBar }}
                />
                {/* Icon */}
                <div
                  className="text-3xl mb-4 inline-block w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${area.colorBar}20` }}
                >
                  {area.icon}
                </div>
                <h3 className="font-black text-slate-900 text-[16px] mb-2">
                  {area.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{area.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — WHO READS SUGAR TIMES
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-20 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0b1c13 0%, #0f2d1a 100%)",
        }}
      >
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background:
              "radial-gradient(circle at 25% 25%, rgba(74,222,128,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(34,197,94,0.1) 0%, transparent 55%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative" style={{ zIndex: 10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Text */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-green-400 mb-3 block">
                  Our Readership
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  Who Reads{" "}
                  <span className="text-green-400">Sugar Times</span>
                </h2>
              </div>
              <p className="text-slate-300 leading-relaxed text-[15px]">
                Our readership spans every level of the sugar value chain —
                from the farmer in the field to the CEO in the boardroom.
              </p>
              <Link
                href="/subscription"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: "#22c55e", color: "white",
                  fontWeight: "900", textTransform: "uppercase",
                  letterSpacing: "0.12em", fontSize: "11px",
                  padding: "12px 24px",
                  borderRadius: "999px",
                  boxShadow: "0 8px 30px rgba(34,197,94,0.3)",
                  textDecoration: "none",
                }}
              >
                Join Our Readers
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Readership list */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {READERSHIP.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 border border-white/10 hover:border-green-500/40 rounded-xl px-4 py-3.5 transition-all duration-300 group"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all"
                    style={{
                      background: "rgba(74,222,128,0.15)",
                      border: "1px solid rgba(74,222,128,0.35)",
                      minWidth: "20px",
                    }}
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-slate-300 text-[13px] leading-snug">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — MISSION & VISION
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#f8faf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div
              className="relative bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300"
            >
              <div
                className="absolute top-0 left-0 rounded-l-3xl"
                style={{ width: "6px", height: "100%", background: "linear-gradient(to bottom, #10b981, #059669)" }}
              />
              <div className="pl-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 8px 25px rgba(16,185,129,0.3)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Our Mission</h3>
                <p className="text-slate-600 leading-relaxed text-[15px]">
                  To <strong className="text-slate-800">inform, connect, and empower</strong> every stakeholder
                  in India&apos;s sugar and bio-energy sector — from the farmer in the field to the CEO in the boardroom.
                </p>
                <p className="text-slate-500 mt-4 text-sm leading-relaxed">
                  We believe that accurate, timely, and accessible information is the foundation of
                  a stronger, more transparent, and more sustainable industry. Whether it is a policy
                  that affects crores of farmers, a distillery project that creates thousands of jobs,
                  or a research breakthrough that improves sugar recovery — we make sure the right people
                  hear about it.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div
              className="relative bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300"
            >
              <div
                className="absolute top-0 left-0 rounded-l-3xl"
                style={{ width: "6px", height: "100%", background: "linear-gradient(to bottom, #f59e0b, #f97316)" }}
              />
              <div className="pl-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 8px 25px rgba(245,158,11,0.3)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Our Vision</h3>
                <p className="text-slate-600 leading-relaxed text-[15px]">
                  To be the most{" "}
                  <strong className="text-slate-800">trusted, widely read, and respected publication</strong>{" "}
                  in the Indian sugar and bio-energy industry — in print and digital — serving readers
                  in India and internationally.
                </p>
                <p className="text-slate-500 mt-4 text-sm leading-relaxed">
                  We see a future where every stakeholder in the sugar value chain — from cooperatives
                  in Maharashtra to distilleries in UP — has access to the information they need to make
                  better decisions, build stronger businesses, and create a more sustainable industry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 6 — EDITORIAL TEAM  (uploaded person photos)
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-green-600 mb-3 block">
              Leadership
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">
              Our Editorial Team
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              The experienced journalists and media professionals behind India&apos;s most trusted
              sugar industry publication.
            </p>
          </div>

          {/* TeamPhotoCard is a client component to support onError */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {TEAM.map((member) => (
              <TeamPhotoCard key={member.name} member={member} />
            ))}
          </div>

          {/* Contributions Note */}
          <div
            className="mt-14 rounded-2xl px-6 sm:px-10 py-6 text-center max-w-3xl mx-auto"
            style={{
              background: "linear-gradient(to right, #f0fdf4, #ecfdf5)",
              border: "1px solid #bbf7d0",
            }}
          >
            <p className="text-slate-700 text-[14px] leading-relaxed">
              <strong className="text-slate-900">Sugar Times welcomes</strong> contributions, press releases,
              expert articles, and interviews from industry professionals. Write to us at{" "}
              <a
                href="mailto:info@sugartimes.co.in"
                className="text-green-600 hover:text-green-700 font-bold hover:underline transition-colors"
              >
                info@sugartimes.co.in
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 7 — PUBLICATION DETAILS + CONTACT
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#f8faf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Publication Details Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div
                className="px-6 py-5"
                style={{ background: "linear-gradient(to right, #0b1c13, #0f2d1a)" }}
              >
                <h3 className="text-white font-black text-lg">Publication Details</h3>
                <p className="text-slate-400 text-[12px] mt-1">
                  Magazine specifications and contact information
                </p>
              </div>
              <div className="divide-y divide-slate-50">
                {PUB_DETAILS.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      {detail.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 text-right">
                      {detail.label === "Website" ? (
                        <a 
                          href={`https://${detail.value}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors font-bold"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        detail.value
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Card */}
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-green-600 mb-3 block">
                  Get In Touch
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                  Reach Out to <span className="text-green-600">Sugar Times</span>
                </h2>
                <p className="text-slate-500 mt-4 text-[15px] leading-relaxed">
                  For subscriptions, advertisements, editorial contributions, or any other
                  queries, our team is always ready to assist you.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    ),
                    label: "Email",
                    value: "info@sugartimes.co.in",
                    href: "mailto:info@sugartimes.co.in",
                    external: false,
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
                        <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.214 6.347L4.05 28l6.91-1.816A11.93 11.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 21.5a9.43 9.43 0 0 1-4.78-1.294l-.343-.203-3.56.935.952-3.479-.223-.358A9.444 9.444 0 0 1 6.5 15c0-5.238 4.262-9.5 9.5-9.5s9.5 4.262 9.5 9.5-4.262 9.5-9.5 9.5zm5.197-7.115c-.285-.143-1.688-.833-1.95-.927-.262-.095-.453-.143-.644.143-.19.285-.738.927-.904 1.118-.167.19-.333.214-.617.071-.285-.143-1.202-.443-2.29-1.413-.846-.754-1.418-1.688-1.584-1.972-.166-.285-.018-.439.125-.581.128-.128.285-.333.428-.5.143-.166.19-.285.285-.476.095-.19.048-.357-.024-.5-.071-.143-.644-1.551-.882-2.122-.232-.553-.47-.477-.644-.486l-.548-.01c-.19 0-.5.072-.762.357-.262.285-1 .977-1 2.382s1.024 2.764 1.167 2.955c.143.19 2.016 3.078 4.885 4.316.683.295 1.215.47 1.63.602.685.218 1.308.187 1.802.113.55-.082 1.688-.69 1.927-1.356.238-.667.238-1.238.166-1.356-.071-.119-.262-.19-.548-.333z"/>
                      </svg>
                    ),
                    label: "WhatsApp",
                    value: "+91 73554 53462",
                    href: "https://wa.me/917355453462",
                    external: true,
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    ),
                    label: "Office Address",
                    value: "H.No. 485 Mumfordganj, Prayagraj, U.P. – 211002",
                    href: "https://maps.google.com/?q=Mumfordganj+Prayagraj",
                    external: true,
                  },
                ].map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.external ? "_blank" : undefined}
                    rel={c.external ? "noopener noreferrer" : undefined}
                    className="flex items-start gap-4 bg-white hover:bg-green-50 border border-slate-100 hover:border-green-200 rounded-2xl px-5 py-4 transition-all duration-300 group"
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm"
                      style={{ background: "#f0fdf4", color: "#16a34a" }}
                    >
                      {c.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                        {c.label}
                      </div>
                      <div className="text-sm font-semibold text-slate-800 leading-snug">
                        {c.value}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 8 — BOTTOM CTA BANNER
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-16 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #16a34a 0%, #059669 50%, #16a34a 100%)",
        }}
      >
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 40%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 40%)",
          }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative" style={{ zIndex: 10 }}>
          <p
            style={{
              color: "rgba(220,252,231,0.9)", fontSize: "11px",
              fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.25em",
              marginBottom: "12px",
            }}
          >
            Since 2016
          </p>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: "900", color: "white",
              lineHeight: 1.2, marginBottom: "20px",
            }}
          >
            Sugar Times Magazine —<br />
            Covering India&apos;s Sugar Industry for 10+ Years
          </h2>
          <p
            style={{
              color: "rgba(220,252,231,0.8)", fontSize: "16px",
              marginBottom: "32px", maxWidth: "520px", margin: "0 auto 32px",
              lineHeight: "1.7",
            }}
          >
            Join thousands of industry professionals who rely on Sugar Times for
            accurate, timely intelligence on India&apos;s sugar and bio-energy sector.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/subscription"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "white", color: "#16a34a",
                fontWeight: "900", textTransform: "uppercase",
                letterSpacing: "0.12em", fontSize: "12px",
                padding: "16px 32px",
                borderRadius: "999px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                textDecoration: "none",
                transition: "all 0.3s",
              }}
            >
              Subscribe to Print & Digital
            </Link>
            <Link
              href="/news"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                border: "2px solid rgba(255,255,255,0.6)",
                color: "white",
                fontWeight: "900", textTransform: "uppercase",
                letterSpacing: "0.12em", fontSize: "12px",
                padding: "16px 32px",
                borderRadius: "999px",
                textDecoration: "none",
                transition: "all 0.3s",
              }}
            >
              Read Latest News
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
