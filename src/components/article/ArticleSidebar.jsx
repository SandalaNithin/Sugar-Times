"use client";
import { useState } from "react";
import Link from "next/link";
import { Flame, Megaphone, ChevronDown, ChevronUp } from "lucide-react";

const getImageUrl = (url) => {
  if (!url) return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${url}`;
};

export default function ArticleSidebar({ popular = [], ads = [] }) {
  const [expanded, setExpanded] = useState(false);
  const initialCount = 5;
  const visible = expanded ? popular : popular.slice(0, initialCount);
  const canExpand = popular.length > initialCount;

  return (
    <aside className="w-full space-y-5">

      {/* Sidebar Ad #1 */}
      {ads[0] && <SidebarAdCard ad={ads[0]} />}

      {/* Most Popular */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-slate-900 flex items-center gap-2.5">
          <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em]">The Most Popular</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {popular.length === 0 && (
            <p className="px-6 py-10 text-xs text-slate-400 italic text-center">Identifying trending news...</p>
          )}
          {visible.map((p, idx) => (
            <Link
              key={p._id || p.id}
              href={`/article/${p._id || p.id}`}
              className="group flex gap-4 items-start p-4 hover:bg-slate-50 transition-all duration-300 relative"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
              
              <div className="relative flex-shrink-0">
                <img
                  src={getImageUrl(p.image)}
                  alt={p.title}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100 shadow-sm transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute -top-2 -left-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm group-hover:border-emerald-200 group-hover:text-emerald-600 transition-colors">
                  {idx + 1}
                </span>
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <h4 className="text-[13px] font-bold text-slate-800 group-hover:text-emerald-700 transition-colors leading-tight line-clamp-3 mb-2">
                  {p.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(p.createdAt || p.date || new Date()).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">Analysis</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="w-full text-center px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 hover:bg-emerald-50 border-t border-slate-100 transition-all flex items-center justify-center gap-2"
          >
            {expanded ? (
              <>Show Less <ChevronUp size={14} /></>
            ) : (
              <>Explore More <ChevronDown size={14} /></>
            )}
          </button>
        )}
      </div>

      {/* Sidebar Ad #2 */}
      {ads[1] && <SidebarAdCard ad={ads[1]} />}

      {/* Sidebar Ad #3 */}
      {ads[2] && <SidebarAdCard ad={ads[2]} />}
    </aside>
  );
}

function SidebarAdCard({ ad }) {
  const inner = (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
      <span className="absolute top-2 right-2 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1">
        <Megaphone size={9} /> Ad
      </span>
      <img src={ad.image} alt={ad.title} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
      {ad.title && (
        <div className="px-4 py-3 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-700 line-clamp-2">{ad.title}</p>
        </div>
      )}
    </div>
  );
  return ad.link ? (
    <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
  ) : (
    inner
  );
}
