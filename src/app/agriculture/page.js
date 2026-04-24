import NewsCard from "@/components/NewsCard";
import Link from "next/link";

export const metadata = { title: "Agriculture - Sugartimes" };

async function getAgriArticles() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/articles?category=Agriculture&limit=20`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.articles) ? data.articles : Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function AgriculturePage() {
  const articles = await getAgriArticles();
  const featured = articles.slice(0, 2);
  const more = articles.slice(2);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Agriculture & Farming</h1>
        <p className="text-slate-500">Sugarcane cultivation, new varieties, irrigation, and field best practices</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: "☀️", label: "Season", value: "Rabi 2025-26", sub: "Crushing ongoing" },
          { icon: "🌧️", label: "Monsoon", value: "Above Normal", sub: "IMD Forecast 2026" },
          { icon: "🌿", label: "Acreage", value: "5.8 M Hectares", sub: "All-India estimate" },
          { icon: "📊", label: "Recovery", value: "10.8%", sub: "National average" },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
            <div className="text-2xl">{item.icon}</div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{item.label}</p>
              <p className="font-bold text-slate-900 text-sm">{item.value}</p>
              <p className="text-xs text-slate-400">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {featured.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-green-500 rounded-full" /> Featured Intelligence
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featured.map((a) => (
                  <NewsCard key={a._id || a.id} article={{ ...a, id: a._id || a.id, date: a.createdAt || a.date }} />
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-10 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
               <span className="w-1.5 h-5 bg-green-500 rounded-full" /> Popular Cane Varieties
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Variety</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Region</th>
                    <th className="text-right px-4 py-3 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Yield (T/Ha)</th>
                    <th className="text-right px-4 py-3 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Recovery %</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Maturity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    ["Co-0238", "North India", "85-90", "11.2", "Early (10-11 months)"],
                    ["Co-86032", "South India", "90-100", "10.8", "Mid (12 months)"],
                    ["CoM-0265", "Maharashtra", "80-85", "11.5", "Early (10 months)"],
                    ["Co-C 671", "Tamil Nadu", "95-105", "10.5", "Late (14 months)"],
                    ["CoS-8436", "UP/Bihar", "75-80", "10.9", "Mid (12 months)"],
                  ].map(([v, r, y, rec, m]) => (
                    <tr key={v} className="hover:bg-green-50/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800">{v}</td>
                      <td className="px-4 py-3 text-slate-500">{r}</td>
                      <td className="px-4 py-3 text-right text-slate-700 font-medium">{y}</td>
                      <td className="px-4 py-3 text-right font-black text-green-600">{rec}%</td>
                      <td className="px-4 py-3 text-slate-50">{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {more.length > 0 ? (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-green-500 rounded-full" /> Latest in Agriculture
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {more.map((a) => (
                  <NewsCard key={a._id || a.id} article={{ ...a, id: a._id || a.id, date: a.createdAt || a.date }} compact />
                ))}
              </div>
            </div>
          ) : !featured.length && (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-medium">No agriculture articles found. Content is being updated.</p>
            </div>
          )}
        </div>

        <aside className="w-full lg:w-72 shrink-0 space-y-6">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" /> Crop Calendar
            </h3>
            <div className="space-y-3 text-sm">
              {[["Planting (Adsali)", "Jul-Aug"], ["Planting (Suru)", "Oct-Nov"], ["Planting (Pre-seasonal)", "Jan-Feb"], ["Harvesting", "Oct-Apr"]].map(([act, period]) => (
                <div key={act} className="flex justify-between border-b border-green-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-slate-600 font-medium">{act}</span>
                  <span className="font-black text-green-700">{period}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" /> Research Bodies
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {["ICAR-IISR Lucknow", "NFCSF", "DSCRI Coimbatore", "VSICL Pune", "UPCSR Shahjahanpur"].map((b) => (
                <li key={b} className="hover:text-green-600 cursor-pointer transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-slate-200 group-hover:bg-green-400 rounded-full transition-colors" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white">
            <h3 className="font-black mb-2 uppercase tracking-widest text-xs flex items-center gap-2 text-green-400">
              <span className="w-2 h-2 bg-green-500 rounded-full" /> Irrigation Schemes
            </h3>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed">Government subsidies for drip irrigation available for eligible farmers. Check PMKSY guidelines.</p>
            <Link href="/contact" className="block w-full bg-green-500 text-white text-center text-xs font-black uppercase tracking-widest py-3 rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-900/20">Learn More</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
