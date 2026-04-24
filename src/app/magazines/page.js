"use client";
import { useState, useEffect } from "react";
import { magazinesAPI } from "@/lib/api";
import { Lock, Download, Eye, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function MagazinesPage() {
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const { isSubscribed } = useAuth();

  useEffect(() => {
    fetchMagazines();
  }, []);

  const fetchMagazines = async () => {
    setLoading(true);
    try {
      const { data } = await magazinesAPI.getAll();
      setMagazines(Array.isArray(data) ? data : []);
    } catch {
      setMagazines([]);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = (mag) => mag.accessType === "premium" || mag.premium;
  const canAccess = (mag) => !isPremium(mag) || isSubscribed;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-green-500" />
      </div>
    );
  }

  const getImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400";
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${url}`;
  };

  const getFileUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${url}`;
  };

  const latest = magazines[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Sugartimes Magazines</h1>
        <p className="text-slate-500">Monthly editions with in-depth industry analysis, data, and expert commentary</p>
      </div>

      {/* Featured latest */}
      {latest && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 mb-10 flex flex-col md:flex-row gap-6 items-center">
          <img src={getImageUrl(latest.cover || latest.coverImage)}
            alt={latest.title} className="w-40 h-52 object-cover rounded-xl shadow-2xl" />
          <div className="text-white">
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Latest Issue</span>
            <h2 className="text-2xl font-black mt-3 mb-2">{latest.title}</h2>
            <p className="text-slate-300 mb-4">{latest.pages || latest.pageCount || 48} pages of sugar industry intelligence.</p>
            <div className="flex gap-3">
              <button onClick={() => setPreview(latest)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
                <Eye size={16} /> Preview
              </button>
              {canAccess(latest) ? (
                <a href={getFileUrl(latest.fileUrl)} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors border border-white/20">
                  <Download size={16} /> Download
                </a>
              ) : (
                <Link href="/subscription"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors border border-white/20">
                  <Lock size={16} /> Subscribe to Download
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <h2 className="text-xl font-bold text-slate-900 mb-5">All Issues</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {magazines.map((mag) => (
          <div key={mag._id || mag.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-all group">
            <div className="relative h-56 overflow-hidden">
              <img src={getImageUrl(mag.cover || mag.coverImage)}
                alt={mag.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {isPremium(mag) && !canAccess(mag) && (
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-center text-white"><Lock size={24} className="mx-auto mb-2" /><p className="text-sm font-semibold">Premium Only</p></div>
                </div>
              )}
              <div className="absolute top-2 right-2">
                {isPremium(mag)
                  ? <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Lock size={9} /> Premium</span>
                  : <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Free</span>
                }
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-1">{mag.title}</h3>
              <p className="text-xs text-slate-400 mb-3">{mag.pages || mag.pageCount || 48} pages</p>
              <div className="flex gap-2">
                <button onClick={() => setPreview(mag)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 border border-slate-200 rounded-lg hover:border-green-400 hover:text-green-600 transition-colors">
                  <Eye size={12} /> Preview
                </button>
                {canAccess(mag)
                  ? <a href={getFileUrl(mag.fileUrl)} target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      <Download size={12} /> Download
                    </a>
                  : <Link href="/subscription"
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      <Lock size={12} /> Subscribe
                    </Link>
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X size={18} /></button>
            <div className="flex gap-4 mb-4">
              <img src={getImageUrl(preview.cover || preview.coverImage)}
                alt={preview.title} className="w-24 h-32 object-cover rounded-xl" />
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{preview.title}</h3>
                <p className="text-sm text-slate-500 mb-2">{preview.pages || preview.pageCount || 48} pages</p>
                {isPremium(preview) && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Premium Issue</span>}
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">This issue covers market analysis, policy updates, mill performance data, and expert interviews.</p>
            {canAccess(preview)
              ? <a href={getFileUrl(preview.fileUrl)} target="_blank" rel="noreferrer"
                  className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Download size={16} /> Download
                </a>
              : <Link href="/subscription" className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors">
                  Subscribe to Download
                </Link>
            }
          </div>
        </div>
      )}
    </div>
  );
}
