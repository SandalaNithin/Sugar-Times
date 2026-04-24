import { FileText, ExternalLink, Calendar, Tag } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Policy – Sugartimes" };

async function getPolicyArticles() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    // Category "Policy" in our mapping corresponds to industry-wide directives
    const res = await fetch(`${apiUrl}/articles?category=Policy&limit=50`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.articles) ? data.articles : Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const CATEGORIES = ["All", "Central Government", "Ministry of Petroleum", "CCEA", "DGFT", "State Government", "Ministry of Agriculture"];

export default async function PolicyPage() {
  const articles = await getPolicyArticles();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Sugar Policy Updates</h1>
        <p className="text-slate-500">Government directives, FRP/SAP announcements, export policies, and regulatory updates</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main */}
        <div className="flex-1">
          {/* Category filters (Static UI for now, links to search if needed) */}
          <div className="flex gap-2 flex-wrap mb-8">
            {CATEGORIES.map((cat) => (
              <button key={cat} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${cat === "All" ? "bg-slate-900 text-white shadow-lg" : "bg-white border border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 shadow-sm"}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Policy cards */}
          <div className="space-y-6">
            {articles.length > 0 ? (
              articles.map((policy) => (
                <div key={policy._id || policy.id} className="bg-white rounded-[32px] border border-slate-100 p-8 hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                          <Tag size={10} />{policy.subcategory || policy.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar size={11} />{new Date(policy.createdAt || policy.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors leading-tight">{policy.title}</h3>
                      <p className="text-sm text-slate-500 mb-4 font-medium leading-relaxed">{policy.excerpt}</p>
                      
                      {/* Truncated preview if content is long */}
                      <div className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-6" 
                           dangerouslySetInnerHTML={{ __html: policy.content?.replace(/<[^>]*>/g, '').slice(0, 300) + '...' }} />
                    </div>
                    <div className="shrink-0 hidden sm:block">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                        <FileText size={28} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-50 flex flex-wrap items-center gap-4">
                    <Link href={`/article/${policy._id || policy.id}`} className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-2 group/link">
                      Read Full Analysis <ExternalLink size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </Link>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Share Update</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-24 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText size={40} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No Policy Updates Found</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">Latest government circulars and policy analyses will appear here as they are published.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0 space-y-8">
          <div className="bg-slate-900 rounded-[32px] p-8 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <h3 className="font-black text-base mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full" /> Benchmark Rates
            </h3>
            <div className="space-y-4">
              {[["FRP 2026-27", "₹340/qtl"], ["UP SAP 2025-26", "₹375/qtl"], ["Ethanol (C-Heavy)", "₹56.35/L"], ["Ethanol (B-Heavy)", "₹60.73/L"], ["Export Quota", "6 MT"]].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{k}</span>
                  <span className="font-black text-emerald-400">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-8 shadow-sm">
            <h3 className="font-black text-slate-900 text-lg mb-3">📋 Policy Alert</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">Stay updated with instant WhatsApp alerts for FRP/SAP and export notifications.</p>
            <Link href="/contact" className="block w-full bg-emerald-600 text-white text-center text-xs font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10 active:scale-95">Enable Notifications</Link>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Key Ministries</h3>
            <ul className="space-y-4">
              {["Ministry of Food", "Ministry of Agriculture", "Ministry of Petroleum", "CCEA", "DGFT", "NITI Aayog"].map((m) => (
                <li key={m} className="group flex items-center gap-3 cursor-pointer">
                  <span className="w-1.5 h-1.5 bg-slate-200 group-hover:bg-emerald-500 rounded-full transition-colors" />
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
