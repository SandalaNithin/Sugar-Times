import Link from "next/link";
import NewsCard from "@/components/NewsCard";
import { ChevronRight } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedInIcon, MailIcon, TwitterXIcon, WhatsAppIcon, YouTubeIcon } from "@/components/SocialIcons";

export const dynamic = "force-dynamic";

async function safeFetch(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Fetch articles whose contributorName (slugified) matches the route slug. The
// query string carries the canonical name/bio used on the article page so we
// render a consistent header even when the API list is empty.
async function getAuthorData(slug, searchName) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const listData = await safeFetch(`${apiUrl}/articles?limit=100`);
  const all = Array.isArray(listData?.articles)
    ? listData.articles
    : Array.isArray(listData)
      ? listData
      : [];

  const slugify = (s) =>
    (s || "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const matchingArticles = all.filter((a) => {
    const name = a.contributorName?.trim() || a.author || "";
    return name && slugify(name) === slug;
  });

  const resolvedName =
    matchingArticles[0]?.contributorName?.trim() ||
    matchingArticles[0]?.author ||
    searchName ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const resolvedBio = matchingArticles[0]?.contributorBio?.trim() || "";

  return { name: resolvedName, bio: resolvedBio, articles: matchingArticles };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const display = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { title: `${display} – Sugar Times` };
}

export default async function AuthorPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = (await searchParams) || {};
  const fallbackName = typeof sp.name === "string" ? sp.name : "";
  const fallbackBio = typeof sp.bio === "string" ? sp.bio : "";

  const { name, bio, articles } = await getAuthorData(slug, fallbackName);
  const displayName = name || fallbackName || "Contributor";
  const displayBio = bio || fallbackBio;
  const initial = (displayName.charAt(0) || "S").toUpperCase();

  return (
    <div className="bg-[#fbfcfa] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-slate-900">User</span>
        </nav>

        {/* Name heading */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-10">{displayName}</h1>

        {/* Avatar + Name block */}
        <div className="flex flex-col items-center py-10 border-b border-slate-200">
          <div className="w-[220px] h-[220px] rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-black text-7xl mb-6 border border-slate-200 shadow-sm">
            {initial}
          </div>
          <h2 className="text-2xl font-black text-slate-800">{displayName}</h2>

          {displayBio && (
            <p className="mt-6 max-w-2xl text-center text-[15px] text-slate-600 leading-relaxed whitespace-pre-line">
              {displayBio}
            </p>
          )}

          <div className="flex items-center gap-5 mt-6 text-slate-600">
            <a href="https://www.facebook.com/TheSugarTimes/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-emerald-600 transition-colors"><FacebookIcon size={18} /></a>
            <a href="https://www.instagram.com/sugartimesmagazine/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-emerald-600 transition-colors"><InstagramIcon size={18} /></a>
            <a href="https://in.linkedin.com/company/sugar-times-magazine" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-emerald-600 transition-colors"><LinkedInIcon size={18} /></a>
            <a href="mailto:contact@sugartimes.co.in" aria-label="Email" className="hover:text-emerald-600 transition-colors"><MailIcon size={18} /></a>
            <a href="https://x.com/SugarTimes" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-emerald-600 transition-colors"><TwitterXIcon size={18} /></a>
            <a href="https://wa.me/917355453462" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-emerald-600 transition-colors"><WhatsAppIcon size={18} /></a>
            <a href="https://www.youtube.com/@sugartimesmagazine2346" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-emerald-600 transition-colors"><YouTubeIcon size={18} /></a>
          </div>
        </div>

        {/* Articles by this contributor */}
        {articles.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-1 bg-emerald-500 block" />
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Articles by {displayName}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <NewsCard
                  key={a._id || a.id}
                  article={{ ...a, id: a._id || a.id, date: a.createdAt || a.date }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
