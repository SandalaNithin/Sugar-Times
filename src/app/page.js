giimport Link from "next/link";
import PricingCards from "@/components/PricingCards";
import { ArrowRight, TrendingUp, TrendingDown, Minus, ChevronRight, BarChart2 } from "lucide-react";
import { CATEGORY_TREE } from "@/lib/categories";

/* ═══════════════════════════════════════════════════════════════════════════
   DATA FETCHING — Server-side, always fresh
   ═══════════════════════════════════════════════════════════════════════════ */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchJSON(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

function mapArticle(a) {
  return {
    _id: a._id,
    title: a.title,
    excerpt: a.excerpt || "",
    category: a.category || "",
    subcategory: a.subcategory || "",
    image: a.image || "",
    author: a.author || "Sugar Times Team",
    trending: a.trending || false,
    premium: a.premium || false,
    createdAt: a.createdAt || "",
    date: new Date(a.createdAt).toLocaleDateString("en-IN", {
      month: "long", day: "numeric", year: "numeric",
    }),
  };
}

function extractArticles(raw) {
  const list = Array.isArray(raw?.articles) ? raw.articles : Array.isArray(raw) ? raw : [];
  return list.filter((a) => a.status !== "draft").map(mapArticle);
}

async function getHomeData() {
  /* ── Step 1: Fetch categories + global data in parallel ──────────── */
  const [categoriesRaw, magazinesRaw, marketsRaw, adsRaw] = await Promise.all([
    fetchJSON(`${API_URL}/categories`),
    fetchJSON(`${API_URL}/magazines`),
    fetchJSON(`${API_URL}/markets`),
    fetchJSON(`${API_URL}/advertisements`),
  ]);

  /* ── Categories ──────────────────────────────────────────────────── */
  const dbCategories = Array.isArray(categoriesRaw) ? categoriesRaw : [];
  let categories;
  if (dbCategories.length > 0) {
    categories = dbCategories;
  } else {
    categories = CATEGORY_TREE.map((p) => ({
      _id: p.slug, name: p.label, slug: p.slug, emoji: p.emoji, color: p.color,
      children: p.children.map((c) => ({ _id: c.slug, name: c.label, slug: c.slug })),
    }));
  }

  /* ── Step 2: Fetch articles PER parent category + latest articles ─ */
  /* Uses the same backend ?category= filter that works on /news page */
  const articleFetches = categories.map((cat) =>
    fetchJSON(`${API_URL}/articles?category=${encodeURIComponent(cat.name)}&limit=10`)
  );
  /* Also fetch latest articles (no category filter) for hero + sidebar */
  articleFetches.push(fetchJSON(`${API_URL}/articles?limit=20`));

  const articleResults = await Promise.all(articleFetches);

  /* Last result is the "latest" (no category filter) */
  const latestRaw = articleResults.pop();
  const allLatest = extractArticles(latestRaw);

  /* Build sections: each category gets its own articles from backend */
  const sections = categories.map((cat, i) => {
    const raw = articleResults[i];
    const catArticles = extractArticles(raw);

    /* Also split articles by sub-category */
    const childSections = (cat.children || []).map((child) => {
      const childName = child.name.toLowerCase();
      return {
        ...child,
        articles: catArticles.filter(
          (a) => a.subcategory?.toLowerCase() === childName || a.category?.toLowerCase() === childName
        ),
      };
    });

    return { ...cat, allArticles: catArticles, childSections };
  });

  /* Hero + sidebar show ALL latest articles (newest first).
     Merge global latest + newest from each category, deduplicate. */
  const seenIds = new Set(allLatest.map((a) => a._id));
  const extraFromCategories = [];
  for (const sec of sections) {
    for (const a of sec.allArticles) {
      if (!seenIds.has(a._id)) {
        extraFromCategories.push(a);
        seenIds.add(a._id);
      }
    }
  }
  const displayArticles = [...allLatest, ...extraFromCategories]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  /* ── Magazines ───────────────────────────────────────────────────── */
  const magazinesArray = Array.isArray(magazinesRaw) ? magazinesRaw : magazinesRaw?.magazines || [];
  const magazines = magazinesArray.map((m) => ({
    _id: m._id, title: m.title, cover: m.coverImage || "",
    pages: m.pages || 48, premium: m.accessType === "premium",
  }));

  /* ── Markets ─────────────────────────────────────────────────────── */
  const markets = Array.isArray(marketsRaw) ? marketsRaw : marketsRaw?.markets || [];

  /* ── Advertisements ──────────────────────────────────────────────── */
  const allAds = Array.isArray(adsRaw) ? adsRaw : adsRaw?.advertisements || [];
  const activeAds = allAds.filter((ad) => ad.active);

  return { categories, sections, displayArticles, magazines, markets, activeAds };
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */
function img(url) {
  if (!url) return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

/* ── Section color palette ─────────────────────────────────────────────── */
const PALETTES = [
  { bg: "bg-green-500",   text: "text-green-600",  light: "bg-green-50",  border: "border-green-500",  pill: "bg-green-100 text-green-700", hover: "hover:text-green-600" },
  { bg: "bg-amber-500",   text: "text-amber-600",  light: "bg-amber-50",  border: "border-amber-500",  pill: "bg-amber-100 text-amber-700", hover: "hover:text-amber-600" },
  { bg: "bg-lime-600",    text: "text-lime-700",   light: "bg-lime-50",   border: "border-lime-600",   pill: "bg-lime-100 text-lime-700",   hover: "hover:text-lime-700" },
  { bg: "bg-sky-500",     text: "text-sky-600",    light: "bg-sky-50",    border: "border-sky-500",    pill: "bg-sky-100 text-sky-700",     hover: "hover:text-sky-600" },
  { bg: "bg-violet-500",  text: "text-violet-600", light: "bg-violet-50", border: "border-violet-500", pill: "bg-violet-100 text-violet-700", hover: "hover:text-violet-600" },
  { bg: "bg-rose-500",    text: "text-rose-600",   light: "bg-rose-50",   border: "border-rose-500",   pill: "bg-rose-100 text-rose-700",   hover: "hover:text-rose-600" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   HERO CARD COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */
function HeroCard({ article: a }) {
  return (
    <Link href={`/article/${a._id}`} className="relative group overflow-hidden block h-full bg-[#052616] border border-white/5 rounded-lg shadow-lg">
      <img src={img(a.image)} alt={a.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-5">
        <h3 className="text-white text-[16px] font-black leading-snug group-hover:text-green-400 transition-colors line-clamp-3">{a.title}</h3>
        <div className="flex items-center gap-2 mt-2.5">
          <span className="text-emerald-400 text-[10px] uppercase font-black tracking-widest">{a.subcategory || a.category}</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span className="text-white/50 text-[10px] font-bold">{a.date}</span>
        </div>
      </div>
    </Link>
  );
}

function HeroCardLarge({ article: a }) {
  return (
    <Link href={`/article/${a._id}`} className="relative group overflow-hidden block h-full bg-[#052616] border border-white/5 rounded-lg shadow-xl">
      <img src={img(a.image)} alt={a.title} className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-8 md:p-12">
        <span className="bg-green-600 text-white text-[11px] font-black uppercase px-3 py-1.5 w-max mb-5 tracking-widest rounded-md border border-green-400/30">{a.subcategory || a.category}</span>
        <h2 className="text-white text-xl sm:text-3xl md:text-5xl font-black leading-[1.05] group-hover:text-green-400 transition-colors mb-4">{a.title}</h2>
        <div className="flex items-center gap-4">
          <span className="text-white font-black text-xs flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {a.date}
          </span>
          <span className="text-white/40 text-[11px] font-black uppercase tracking-[0.15em]">Sugar Times</span>
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default async function HomePage() {
  const { sections, displayArticles, magazines, markets, activeAds } = await getHomeData();

  const heroArticles = displayArticles.slice(0, 5);
  const latestArticles = displayArticles.slice(0, 8);
  const sidebarAd = activeAds.find((ad) => ad.placement === "sidebar" || ad.placement === "both");

  if (heroArticles.length === 0 && sections.every((s) => s.allArticles.length === 0)) {
    return (
      <div className="bg-[#fbfcfa] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-6">📰</div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">Welcome to Sugar Times</h1>
          <p className="text-slate-500 mb-8">Content is being prepared. Add articles in the admin panel to see them here.</p>
          <Link href="/admin/dashboard" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm">Go to Admin Panel</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfcfa]">

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Latest articles from ALL categories (excluding breaking news)
          ═══════════════════════════════════════════════════════════════════ */}
      {heroArticles.length > 0 && (
        <section className="bg-[#031d10] pt-4 sm:pt-8 pb-10 sm:pb-14 px-4 shadow-2xl border-b border-green-950">
          <div className="max-w-[1440px] mx-auto">
            {heroArticles.length >= 5 ? (
              /* Full 4-column hero: 2 left | 1 center large | 2 right */
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-auto lg:h-[550px]">
                <div className="grid grid-rows-2 gap-4 lg:col-span-1 h-[550px] lg:h-full">
                  {heroArticles.slice(0, 2).map((a) => (
                    <HeroCard key={a._id} article={a} />
                  ))}
                </div>
                <div className="lg:col-span-2 h-[550px] lg:h-full">
                  <HeroCardLarge article={heroArticles[2]} />
                </div>
                <div className="grid grid-rows-2 gap-4 lg:col-span-1 h-[550px] lg:h-full">
                  {heroArticles.slice(3, 5).map((a) => (
                    <HeroCard key={a._id} article={a} />
                  ))}
                </div>
              </div>
            ) : heroArticles.length >= 3 ? (
              /* 3-4 articles: 1 left | 1 center large | 1-2 right */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto lg:h-[500px]">
                <div className="h-[300px] lg:h-full"><HeroCard article={heroArticles[0]} /></div>
                <div className="h-[300px] lg:h-full"><HeroCardLarge article={heroArticles[1]} /></div>
                <div className={`${heroArticles.length === 4 ? "grid grid-rows-2 gap-4" : ""} h-[300px] lg:h-full`}>
                  {heroArticles.slice(2).map((a) => (<HeroCard key={a._id} article={a} />))}
                </div>
              </div>
            ) : (
              /* 1-2 articles */
              <div className={`grid grid-cols-1 ${heroArticles.length === 2 ? "lg:grid-cols-2" : ""} gap-4 h-auto lg:h-[450px]`}>
                {heroArticles.map((a) => (
                  <div key={a._id} className="h-[350px] lg:h-full"><HeroCardLarge article={a} /></div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CONTENT — CATEGORY SECTIONS + SIDEBAR
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 py-8 sm:py-14 flex flex-col lg:flex-row gap-8 lg:gap-12">

        {/* ── LEFT: All Parent Category Sections ───────────────────────── */}
        <div className="flex-1 w-full space-y-14">

          {sections.map((section, idx) => {
            const p = PALETTES[idx % PALETTES.length];
            const hasArticles = section.allArticles.length > 0;
            const featured = section.allArticles[0];
            const rest = section.allArticles.slice(1, 5);
            const childrenWithArticles = section.childSections.filter((c) => c.articles.length > 0);
            const categoryLink = `/news?category=${encodeURIComponent(section.name)}`;

            return (
              <section key={section._id || section.slug}>
                {/* ── Parent Category Header ──────────────────────────── */}
                <div className={`mb-6 border-b-2 ${p.border}`}>
                  <div className="flex items-center justify-between">
                    <h2 className={`${p.bg} text-white font-bold text-[13px] uppercase tracking-wider px-4 py-2 inline-flex items-center gap-2 -mb-0.5`}>
                      <span className="text-lg">{section.emoji}</span>
                      {section.name}
                    </h2>
                    <Link href={categoryLink} className={`text-xs font-bold ${p.text} ${p.hover} uppercase tracking-wider mr-1 flex items-center gap-1`}>
                      View All <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>

                {/* ── Sub-category Pills ───────────────────────────────── */}
                {(section.children || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(section.children || []).map((child) => (
                      <Link
                        key={child._id || child.slug}
                        href={`/news?category=${encodeURIComponent(child.name)}`}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${p.pill} hover:opacity-80 transition-opacity`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* ── Articles for this parent ────────────────────────── */}
                {hasArticles ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Featured (large left) */}
                    {featured && (
                      <Link href={`/article/${featured._id}`} className="group block">
                        <div className="overflow-hidden mb-4 bg-slate-100 h-64 relative rounded-lg">
                          <img src={img(featured.image)} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <span className={`absolute bottom-0 left-0 ${p.bg} text-white text-[10px] font-bold uppercase px-2.5 py-1`}>{featured.subcategory || featured.category}</span>
                        </div>
                        <h3 className={`text-[20px] font-bold leading-tight text-slate-800 group-hover:${p.text} transition-colors mb-2`}>{featured.title}</h3>
                        <div className="text-xs text-slate-500 mb-2 font-semibold">
                          <span className="text-slate-900 font-bold">{featured.author}</span> — {featured.date}
                        </div>
                        {featured.excerpt && <p className="text-[14px] text-slate-500 leading-relaxed font-medium line-clamp-3">{featured.excerpt}</p>}
                      </Link>
                    )}
                    {/* List (right side) */}
                    {rest.length > 0 && (
                      <div className="space-y-4">
                        {rest.map((a) => (
                          <Link key={a._id} href={`/article/${a._id}`} className="group flex gap-4 items-start pb-4 border-b border-slate-100 last:border-0">
                            <div className="w-[110px] h-[80px] shrink-0 bg-slate-100 overflow-hidden rounded-md">
                              <img src={img(a.image)} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={`text-[10px] font-bold ${p.pill} px-2 py-0.5 rounded-full inline-block mb-1.5`}>{a.subcategory || a.category}</span>
                              <h4 className={`text-[14px] font-bold text-slate-800 leading-snug group-hover:${p.text} transition-colors line-clamp-2`}>{a.title}</h4>
                              <span className="text-[11px] text-slate-400 mt-1.5 block font-medium">{a.date}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty state for category with no articles yet */
                  <div className={`${p.light} rounded-xl p-8 text-center border border-slate-100`}>
                    <span className="text-3xl block mb-3">{section.emoji}</span>
                    <p className="text-sm text-slate-500 font-medium">No articles in <strong>{section.name}</strong> yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Publish articles under this category to see them here.</p>
                  </div>
                )}

                {/* ── Sub-category article grids ──────────────────────── */}
                {childrenWithArticles.length > 0 && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {childrenWithArticles.slice(0, 3).map((child) => (
                      <div key={child._id || child.slug}>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${p.bg}`} />
                            {child.name}
                          </h3>
                          <Link href={`/news?category=${encodeURIComponent(child.name)}`} className={`text-[10px] font-bold ${p.text} ${p.hover}`}>
                            More <ArrowRight size={9} className="inline" />
                          </Link>
                        </div>
                        <div className="space-y-3">
                          {child.articles.slice(0, 3).map((a) => (
                            <Link key={a._id} href={`/article/${a._id}`} className="group flex gap-3 items-center">
                              <div className="w-14 h-14 shrink-0 bg-slate-100 overflow-hidden rounded-lg">
                                <img src={img(a.image)} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-[12px] font-bold text-slate-700 leading-snug group-hover:${p.text} transition-colors line-clamp-2`}>{a.title}</h4>
                                <span className="text-[10px] text-slate-400">{a.date}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Divider */}
                {idx < sections.length - 1 && <div className="border-b border-slate-100 mt-10" />}
              </section>
            );
          })}

          {/* ── Highlights Hub (dark section) ─────────────────────────── */}
          {sections.filter((s) => s.allArticles.length > 0).length > 0 && (
            <section>
              <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <h2 className="text-white text-2xl font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                  <span className="w-2 h-8 bg-green-500 rounded-full" />
                  Highlights
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sections.filter((s) => s.allArticles.length > 0).slice(0, 6).map((s) => (
                    <div key={`hl-${s._id}`} className="space-y-3">
                      <Link href={`/news?category=${encodeURIComponent(s.name)}`} className="text-green-400 font-bold text-xs uppercase tracking-widest hover:underline flex items-center gap-2">
                        {s.emoji} {s.name} <ArrowRight size={11} />
                      </Link>
                      {s.allArticles.slice(0, 2).map((a) => (
                        <Link key={a._id} href={`/article/${a._id}`} className="group block">
                          <h4 className="text-white text-[13px] font-bold group-hover:text-green-400 transition-colors line-clamp-2">{a.title}</h4>
                          <p className="text-white/40 text-[10px] mt-1">{a.date}</p>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ────────────────────────────────────────────── */}
        <aside className="w-full lg:w-[320px] shrink-0 space-y-8">

          {/* My account */}
          <div className="hidden lg:flex justify-end">
            <Link href="/login" className="flex items-center gap-2 text-sm text-slate-600 font-semibold hover:text-green-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My account
            </Link>
          </div>

          {/* Magazines — Latest to oldest */}
          {magazines.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#b5cc95] p-6 text-center relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[#4d6a26] font-black text-2xl uppercase opacity-15 transform -rotate-12 pointer-events-none">Sugar<br/>Times</div>
                <Link href="/magazines" className="block relative z-10">
                  <div className="w-40 mx-auto shadow-2xl border-4 border-white rounded-sm overflow-hidden">
                    <img src={img(magazines[0].cover)} alt={magazines[0].title} className="w-full h-auto object-cover" />
                  </div>
                </Link>
                <h3 className="font-bold text-slate-800 text-lg mt-4 relative z-10">Latest Issue</h3>
                <p className="text-slate-600 text-xs mt-1 relative z-10">{magazines[0].title}</p>
              </div>
              {magazines.length > 1 && (
                <div className="p-4 space-y-3">
                  {magazines.slice(1, 4).map((m) => (
                    <Link key={m._id} href="/magazines" className="group flex gap-3 items-center">
                      <div className="w-12 h-16 shrink-0 bg-slate-100 border border-slate-200 rounded overflow-hidden">
                        <img src={img(m.cover)} alt={m.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[12px] font-bold text-slate-700 line-clamp-2 group-hover:text-green-600 transition-colors">{m.title}</h4>
                        <span className="text-[10px] text-slate-400">{m.pages} pages {m.premium ? "• Premium" : "• Free"}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Link href="/magazines" className="block text-center py-3 text-xs font-bold text-green-600 hover:bg-green-50 border-t border-slate-100 transition-colors">
                View All Magazines <ChevronRight size={12} className="inline" />
              </Link>
            </div>
          )}

          {/* Stay Connected */}
          <div className="bg-white">
            <div className="mb-5 border-b-2 border-slate-900">
              <h2 className="bg-slate-900 text-white font-semibold text-[13px] uppercase tracking-wider px-3 py-1.5 inline-block -mb-0.5">Stay Connected</h2>
            </div>
            <div className="space-y-2">
              {[
                { href: "https://www.facebook.com/TheSugarTimes/", bg: "bg-[#3b5998]", label: "Facebook", action: "LIKE", icon: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" },
                { href: "https://x.com/SugarTimes", bg: "bg-[#1DA1F2]", label: "Twitter / X", action: "FOLLOW", icon: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" },
                { href: "https://www.youtube.com/@sugartimesmagazine2346", bg: "bg-[#CD201F]", label: "YouTube", action: "SUBSCRIBE", icon: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center ${s.bg} text-white rounded`}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={s.icon}/></svg></div>
                    <span className="text-[13px] font-bold text-slate-800">{s.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-800">{s.action}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Category quick-nav sidebar */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-900 text-white px-4 py-3">
              <h3 className="font-black text-[12px] uppercase tracking-wider">Browse Categories</h3>
            </div>
            <div className="p-4 space-y-1">
              {sections.map((s, i) => {
                const p = PALETTES[i % PALETTES.length];
                return (
                  <Link key={s._id} href={`/news?category=${encodeURIComponent(s.name)}`} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors group">
                    <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                      <span className="text-base">{s.emoji}</span>
                      {s.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${p.pill} px-2 py-0.5 rounded-full`}>{s.allArticles.length}</span>
                      <ChevronRight size={12} className="text-slate-300 group-hover:text-slate-500" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Latest Articles */}
          {latestArticles.length > 0 && (
            <div className="bg-white p-5 border border-slate-200 shadow-sm rounded-xl">
              <h3 className="bg-slate-900 text-white font-black text-[12px] uppercase tracking-wider px-3 py-2 inline-block mb-4 rounded">Latest Articles</h3>
              <div className="space-y-4">
                {latestArticles.map((a) => (
                  <Link key={a._id} href={`/article/${a._id}`} className="group flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="w-16 h-12 shrink-0 bg-slate-100 overflow-hidden rounded">
                      <img src={img(a.image)} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-slate-800 leading-tight group-hover:text-green-600 transition-colors line-clamp-2">{a.title}</h4>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{a.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Advertisement */}
          {sidebarAd ? (
            <a href={sidebarAd.link || "#"} target="_blank" rel="noopener noreferrer" className="block bg-slate-100 border border-slate-200 rounded-xl relative group overflow-hidden">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest absolute top-2 right-2 border border-slate-200 bg-white px-2 py-0.5 rounded-sm z-10">Ad</span>
              <img src={img(sidebarAd.image)} alt={sidebarAd.title} className="w-full h-auto object-cover" />
            </a>
          ) : (
            <div className="bg-slate-100 border border-slate-200 h-[250px] flex items-center justify-center relative rounded-xl">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest absolute top-2 right-2 border border-slate-200 bg-white px-2 py-0.5 rounded-sm">Ad</span>
              <div className="text-slate-300 text-center">
                <span className="block text-3xl mb-1 font-black">300x250</span>
                <span className="block text-xs uppercase tracking-widest font-bold">Ad Space</span>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          FULL-WIDTH SECTIONS — Markets, Magazines, Pricing
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 mt-16">

        {/* Market Insights */}
        {markets.length > 0 && (
          <section className="py-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-2xl font-black text-slate-900">Market Insights</h2><p className="text-slate-500 text-sm mt-1">Live sugarcane prices across states</p></div>
              <Link href="/markets" className="flex items-center gap-1 text-green-600 font-semibold text-sm">Full Markets <ChevronRight size={16} /></Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">State</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Commodity</th>
                        <th className="text-right px-4 py-3 font-semibold text-slate-600">Price</th>
                        <th className="text-right px-4 py-3 font-semibold text-slate-600">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {markets.slice(0, 8).map((row, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-green-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800">{row.state}</td>
                          <td className="px-4 py-3 text-slate-500">{row.commodity || row.variety || "Sugarcane"}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">Rs {(row.price || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`flex items-center justify-end gap-1 font-semibold ${(row.change||0)>0?"text-green-600":(row.change||0)<0?"text-red-500":"text-slate-400"}`}>
                              {(row.change||0)>0?<TrendingUp size={13}/>:(row.change||0)<0?<TrendingDown size={13}/>:<Minus size={13}/>}
                              {(row.change||0)>0?"+":""}{row.change||0}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart2 size={16} className="text-green-500" /> Price Overview</h3>
                <div className="space-y-3">
                  {markets.slice(0,6).map((m,i) => {
                    const max = Math.max(...markets.map(x=>x.price||0));
                    const pct = max>0?Math.round(((m.price||0)/max)*100):0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-20 truncate">{m.state}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width:`${pct}%`}}/></div>
                        <span className="text-xs font-semibold text-slate-700 w-16 text-right">Rs {(m.price||0).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
                <Link href="/markets" className="mt-5 block text-center text-sm text-green-600 font-semibold hover:underline">View Full Charts</Link>
              </div>
            </div>
          </section>
        )}

        {/* Magazines */}
        {magazines.length > 0 && (
          <section className="py-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-2xl font-black text-slate-900">Magazines</h2><p className="text-slate-500 text-sm mt-1">Monthly editions packed with industry analysis</p></div>
              <Link href="/magazines" className="flex items-center gap-1 text-green-600 font-semibold text-sm">All Issues <ChevronRight size={16} /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {magazines.slice(0,3).map((m) => (
                <Link key={m._id} href="/magazines" className="group bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="relative h-64 overflow-hidden">
                    <img src={img(m.cover)} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {m.premium && <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Premium</div>}
                  </div>
                  <div className="p-4"><h3 className="font-bold text-slate-800 text-[15px] line-clamp-2 group-hover:text-green-600 transition-colors">{m.title}</h3><p className="text-xs text-slate-400 mt-1">{m.pages} pages</p></div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <PricingCards />

        {/* Why Sugartimes */}
        <section className="py-12 border-t border-slate-200">
          <div className="text-center mb-10"><h2 className="text-3xl font-black text-slate-900 mb-3">Why Sugartimes?</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "📰", title: "Industry News", desc: "Daily updates from mills, markets, and government" },
              { icon: "📊", title: "Market Data", desc: "Real-time sugarcane prices across all major states" },
              { icon: "📋", title: "Policy Tracker", desc: "FRP, SAP, export policy all in one place" },
              { icon: "📚", title: "Digital Magazines", desc: "Monthly editions with deep industry analysis" },
            ].map((b,i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center hover:shadow-md transition-all group">
                <div className="text-3xl mb-3 group-hover:-translate-y-1 transition-transform">{b.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{b.title}</h3>
                <p className="text-[13px] text-slate-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
