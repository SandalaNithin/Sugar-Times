"use client";
import { useAuth } from "@/context/AuthContext";
import { Plus, Megaphone } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://st-be-kh3k.onrender.com";

function img(url) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${API_URL}${url}`;
}

export default function Advertisement({ ad, placement, className = "" }) {
  const { isAdmin } = useAuth();

  if (ad) {
    return (
      <div className={`rounded-2xl border border-slate-100 overflow-hidden shadow-sm bg-white ${className}`}>
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Advertisement</span>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <a href="/admin/ads" className="text-[8px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded transition-colors">
                + Manage
              </a>
            )}
            <span className="text-[8px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold">Ad</span>
          </div>
        </div>
        {ad.link ? (
          <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block group">
            <img src={img(ad.image)} alt={ad.title || "Advertisement"} className="w-full h-auto object-cover group-hover:opacity-95 transition-opacity" />
            {ad.title && <p className="px-4 py-3 text-[11px] font-bold text-slate-700 line-clamp-2">{ad.title}</p>}
          </a>
        ) : (
          <div>
            <img src={img(ad.image)} alt={ad.title || "Advertisement"} className="w-full h-auto object-cover" />
            {ad.title && <p className="px-4 py-3 text-[11px] font-bold text-slate-700 line-clamp-2">{ad.title}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center ${className}`}>
      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
        <Megaphone size={18} className="text-slate-400" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
        {placement === "sidebar" ? "Sidebar Ad Space" : "Banner Ad Space"}
      </p>
      {isAdmin ? (
        <a
          href="/admin/ads"
          className="inline-flex items-center gap-1.5 text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors uppercase tracking-widest shadow-sm"
        >
          <Plus size={11} strokeWidth={3} />
          Post Advertisement
        </a>
      ) : (
        <a href="/advertise" className="inline-block text-[10px] font-bold text-green-600 hover:underline">
          Advertise with us →
        </a>
      )}
    </div>
  );
}
