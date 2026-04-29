"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import NewsCard from "@/components/NewsCard";
import { articlesAPI, categoriesAPI, adsAPI } from "@/lib/api";
import { Search, Loader2, TrendingUp, Flame } from "lucide-react";
import { CATEGORY_TREE } from "@/lib/categories";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import Advertisement from "@/components/Advertisement";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function imgUrl(url) {
  if (!url) return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

const staticCategories = [
  "All",
  ...CATEGORY_TREE.flatMap((p) => [p.label, ...p.children.map((c) => c.label)]),
];

const ARTICLES_PER_PAGE = 12;

function NewsContent() {
  const { t, tCategory } = useLang();
  const { isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryList, setCategoryList] = useState(staticCategories);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [sidebarAd, setSidebarAd] = useState(null);
  const [topAd, setTopAd] = useState(null);

  // Fetch dynamic categories from API
  useEffect(() => {
    categoriesAPI.getTree().then((res) => {
      const tree = Array.isArray(res.data) ? res.data : [];
      if (tree.length > 0) {
        setCategoryList([
          "All",
          ...tree.flatMap((p) => [p.name, ...(p.children || []).map((c) => c.name)]),
        ]);
      }
    }).catch(() => {});
  }, []);

  // Sync with URL params
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlSearch = searchParams.get("search") || "";
    if (urlCategory) setCategory(urlCategory);
    setSearch(urlSearch);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [category, page, search]);

  useEffect(() => {
    fetchArticles();
  }, [category, page, search]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = { page, limit: ARTICLES_PER_PAGE };
      if (category !== "All") params.category = category;
      if (search) params.search = search;
      const { data } = await articlesAPI.getAll(params);
      const list = Array.isArray(data?.articles) ? data.articles : Array.isArray(data) ? data : [];
      setArticles(list);
      setTotal(data.total || list.length);
    } catch {
      setArticles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch category-specific trending articles and ads for sidebar
  useEffect(() => {
    const fetchSidebar = async () => {
      try {
        const params = { limit: 6, trending: true };
        if (category !== "All") params.category = category;
        const { data } = await articlesAPI.getAll(params);
        const list = Array.isArray(data?.articles) ? data.articles : Array.isArray(data) ? data : [];
        // If no trending in category, fall back to latest in category
        if (list.length === 0 && category !== "All") {
          const fb = await articlesAPI.getAll({ limit: 6, category });
          const fbList = Array.isArray(fb.data?.articles) ? fb.data.articles : Array.isArray(fb.data) ? fb.data : [];
          setTrendingArticles(fbList);
        } else {
          setTrendingArticles(list);
        }
      } catch { setTrendingArticles([]); }

      try {
        const catParam = category !== "All" ? category : "";
        const res = await adsAPI.getAll({ activeOnly: true, category: catParam, placement: "sidebar" });
        const adList = Array.isArray(res.data) ? res.data : [];
        setSidebarAd(adList[0] || null);

        const topRes = await adsAPI.getAll({ activeOnly: true, category: catParam, placement: "news_top" });
        const topList = Array.isArray(topRes.data) ? topRes.data : [];
        setTopAd(topList[0] || null);
      } catch { 
        setSidebarAd(null);
        setTopAd(null);
      }
    };
    fetchSidebar();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  // Split articles: first 5 for hero, rest for grid
  const heroArticles = page === 1 ? articles.slice(0, 5) : [];
  const gridArticles = page === 1 ? articles.slice(5) : articles;
  const totalPages = Math.ceil(total / ARTICLES_PER_PAGE);

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch { return ""; }
  };

  return (
    <div className="bg-[#fbfcfa] min-h-screen">

      {/* ── Hero Section (page 1 only, 5 newest articles) ──────────── */}
      {!loading && heroArticles.length > 0 && !search && (
        <section className="bg-[#031d10] pt-4 sm:pt-6 pb-8 sm:pb-10 px-4 shadow-xl border-b border-green-950">
          <div className="max-w-[1400px] mx-auto">
            {/* Category title inside hero */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-white text-xl sm:text-2xl font-black uppercase tracking-wider flex items-center gap-3">
                <span className="w-1.5 h-8 bg-green-500 rounded-full" />
                {category === "All" ? t("latest_news") : tCategory(category)}
              </h1>
              <span className="text-emerald-400/60 text-xs font-bold uppercase tracking-widest">{total} {t("articles_count")}</span>
            </div>

            {heroArticles.length >= 5 ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-auto lg:h-[450px]">
                <div className="grid grid-rows-2 gap-3 lg:col-span-1 h-[450px] lg:h-full">
                  {heroArticles.slice(0, 2).map((a) => (
                    <Link key={a._id} href={`/article/${a._id}`} className="relative group overflow-hidden block h-full bg-[#052616] border border-white/5 rounded-lg">
                      <img src={imgUrl(a.image)} alt={a.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-600" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
                        <h3 className="text-white text-[14px] font-bold leading-snug group-hover:text-green-400 transition-colors line-clamp-3">{a.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-emerald-400 text-[9px] uppercase font-bold tracking-widest">{tCategory(a.subcategory || a.category)}</span>
                          <span className="text-white/40 text-[9px]">{formatDate(a.createdAt)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="lg:col-span-2 h-[450px] lg:h-full">
                  <Link href={`/article/${heroArticles[2]._id}`} className="relative group overflow-hidden block h-full bg-[#052616] border border-white/5 rounded-lg">
                    <img src={imgUrl(heroArticles[2].image)} alt={heroArticles[2].title} className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-800" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent flex flex-col justify-end p-6 md:p-10">
                      <span className="bg-green-600 text-white text-[10px] font-bold uppercase px-3 py-1 w-max mb-3 tracking-widest rounded border border-green-400/30">{tCategory(heroArticles[2].subcategory || heroArticles[2].category)}</span>
                      <h2 className="text-white text-xl sm:text-2xl md:text-4xl font-black leading-tight group-hover:text-green-400 transition-colors mb-3 line-clamp-3">{heroArticles[2].title}</h2>
                      <div className="flex items-center gap-3">
                        <span className="text-white/70 text-xs font-bold flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          {formatDate(heroArticles[2].createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="grid grid-rows-2 gap-3 lg:col-span-1 h-[450px] lg:h-full">
                  {heroArticles.slice(3, 5).map((a) => (
                    <Link key={a._id} href={`/article/${a._id}`} className="relative group overflow-hidden block h-full bg-[#052616] border border-white/5 rounded-lg">
                      <img src={imgUrl(a.image)} alt={a.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-600" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
                        <h3 className="text-white text-[14px] font-bold leading-snug group-hover:text-green-400 transition-colors line-clamp-3">{a.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-emerald-400 text-[9px] uppercase font-bold tracking-widest">{tCategory(a.subcategory || a.category)}</span>
                          <span className="text-white/40 text-[9px]">{formatDate(a.createdAt)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : heroArticles.length >= 3 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-auto lg:h-[380px]">
                {heroArticles.map((a, i) => (
                  <div key={a._id} className={`${i === 1 ? "lg:row-span-1" : ""} h-[250px] lg:h-full`}>
                    <Link href={`/article/${a._id}`} className="relative group overflow-hidden block h-full bg-[#052616] border border-white/5 rounded-lg">
                      <img src={imgUrl(a.image)} alt={a.title} className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-100 group-hover:scale-105 transition-all duration-600" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent flex flex-col justify-end p-5">
                        <span className="bg-green-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 w-max mb-2 rounded tracking-wider">{tCategory(a.subcategory || a.category)}</span>
                        <h3 className={`text-white ${i === 1 ? "text-xl" : "text-[15px]"} font-bold leading-snug group-hover:text-green-400 transition-colors line-clamp-3`}>{a.title}</h3>
                        <span className="text-white/40 text-[10px] mt-2">{formatDate(a.createdAt)}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${heroArticles.length === 2 ? "lg:grid-cols-2" : ""} gap-3 h-auto lg:h-[380px]`}>
                {heroArticles.map((a) => (
                  <div key={a._id} className="h-[300px] lg:h-full">
                    <Link href={`/article/${a._id}`} className="relative group overflow-hidden block h-full bg-[#052616] border border-white/5 rounded-lg">
                      <img src={imgUrl(a.image)} alt={a.title} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent flex flex-col justify-end p-8">
                        <span className="bg-green-600 text-white text-[10px] font-bold uppercase px-3 py-1 w-max mb-3 rounded tracking-wider">{tCategory(a.subcategory || a.category)}</span>
                        <h2 className="text-white text-2xl md:text-3xl font-black leading-tight group-hover:text-green-400 transition-colors mb-2">{a.title}</h2>
                        <span className="text-white/50 text-xs">{formatDate(a.createdAt)}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Main Content ───────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 py-8">

        {/* Title (shown when hero is not visible — search mode or page 2+) */}
        {(search || page > 1 || heroArticles.length === 0) && !loading && (
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">
              {search ? `${t("search_prefix")} "${search}"` : category === "All" ? t("latest_news") : tCategory(category)}
            </h1>
            <p className="text-slate-500 text-sm">{total} {t("articles_found")}</p>
          </div>
        )}

        {/* Search + Category filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search_articles_placeholder")}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <button type="submit" className="bg-green-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 transition-colors">{t("search")}</button>
          </form>
        </div>

        {/* Category pills */}
        <div className="overflow-x-auto pb-4 mb-6 no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {categoryList.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); setSearch(""); }}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                  category === cat
                    ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/10"
                    : "bg-white text-slate-500 border-slate-100 hover:border-green-400"
                }`}
              >
                {tCategory(cat)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Content Area */}
          <div className="flex-1 min-w-0">
            
            {/* News Top Ad Placement */}
            <div className="mb-8">
              <Advertisement ad={topAd} placement="banner" className="w-full" />
            </div>

            {/* Articles grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-green-500" />
              </div>
            ) : gridArticles.length === 0 && heroArticles.length === 0 ? (
              <div className="text-center py-20 text-slate-400">{t("no_articles")}</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {gridArticles.map((a) => (
                    <NewsCard key={a._id || a.id} article={a} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold disabled:opacity-30 hover:border-green-400 transition-colors"
                    >
                      {t("previous")}
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const p = page <= 3 ? i + 1 : page - 2 + i;
                        if (p > totalPages || p < 1) return null;
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                              page === p ? "bg-green-500 text-white shadow-lg" : "bg-white border border-slate-200 text-slate-600 hover:border-green-400"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= totalPages}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold disabled:opacity-30 hover:border-green-400 transition-colors"
                    >
                      {t("next")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-5">

            {/* Category Trending Topics */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 bg-slate-900 flex items-center gap-2.5">
                <div className="w-5 h-5 bg-red-500 rounded-md flex items-center justify-center">
                  <Flame className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="text-white text-[11px] font-black uppercase tracking-[0.18em]">Trending Topics</h3>
                  {category !== "All" && (
                    <span className="text-red-300 text-[9px] font-bold uppercase tracking-widest">{tCategory(category)}</span>
                  )}
                </div>
              </div>
              <ul className="divide-y divide-slate-50">
                {trendingArticles.length === 0 ? (
                  <li className="px-5 py-8 text-xs text-slate-400 italic text-center">Loading trends...</li>
                ) : trendingArticles.map((a, idx) => (
                  <li key={a._id || a.id}>
                    <a href={`/article/${a._id || a.id}`}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
                      <span className="text-[11px] font-black text-slate-300 group-hover:text-red-400 transition-colors w-4 shrink-0 mt-0.5">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-700 group-hover:text-green-600 transition-colors leading-snug line-clamp-2">{a.title}</p>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mt-1 block">
                          {tCategory(a.subcategory || a.category)}
                        </span>
                      </div>
                      {a.trending && <TrendingUp size={11} className="text-red-400 shrink-0 mt-1" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Advertisement */}
            <Advertisement ad={sidebarAd} placement="sidebar" />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 min-h-screen">
          <Loader2 size={32} className="animate-spin text-green-500" />
        </div>
      }
    >
      <NewsContent />
    </Suspense>
  );
}
