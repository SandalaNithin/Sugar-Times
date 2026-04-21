"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, User, ChevronDown, Calendar, ArrowRight, RefreshCw, Phone, Smartphone, Mail, Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { articlesAPI, subscriptionsAPI, categoriesAPI } from "@/lib/api";
import Image from "next/image";
import { CATEGORY_TREE, categoryHref } from "@/lib/categories";

const FacebookIcon = ({ size }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>);
const LinkedInIcon = ({ size }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>);
const TwitterXIcon = ({ size }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>);
const YouTubeIcon = ({ size }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>);

// Build nav link from API category tree node
const apiCategoryToNav = (cat) => ({
  label: cat.name.toUpperCase(),
  href: categoryHref(cat.name),
  dropdown: (cat.children || []).map((c) => ({
    label: c.name,
    href: categoryHref(c.name),
  })),
});

// Fallback: build nav from static CATEGORY_TREE
const staticCategoryToNav = (cat) => ({
  label: cat.label.toUpperCase(),
  href: categoryHref(cat.label),
  dropdown: cat.children.map((c) => ({ label: c.label, href: categoryHref(c.label) })),
});

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [tickerArticles, setTickerArticles] = useState([]);
  const [today, setToday] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [renewalBadge, setRenewalBadge] = useState(null);
  const [navLinks, setNavLinks] = useState([
    { label: "HOME", href: "/" },
    ...CATEGORY_TREE.map(staticCategoryToNav),
  ]);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const { lang, toggleLang, t, tCategory } = useLang();
  const [globalSearch, setGlobalSearch] = useState("");

  const handleGlobalSearchSubmit = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    router.push(`/news?search=${encodeURIComponent(globalSearch)}`);
    setSearchOpen(false);
    setGlobalSearch("");
  };

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));

    // Fetch dynamic categories from API
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getTree();
        const tree = Array.isArray(res.data) ? res.data : [];
        if (tree.length > 0) {
          setNavLinks([
            { label: "HOME", href: "/" },
            ...tree.map(apiCategoryToNav),
          ]);
        }
      } catch (err) {
        // Fallback to static categories already set
      }
    };

    const fetchTicker = async () => {
      try {
        const res = await articlesAPI.getAll({ limit: 50 });
        const allArticles = Array.isArray(res.data?.articles) ? res.data.articles : (Array.isArray(res.data) ? res.data : []);
        const breakingNews = allArticles.filter(a => a.trending);
        setTickerArticles(breakingNews);
      } catch (err) {
        console.error("Failed to fetch ticker articles", err);
      }
    };

    const fetchSubscriptionStatus = async () => {
      if (user?.id) {
        try {
          const res = await subscriptionsAPI.getByUser(user.id);
          if (res.data && res.data._id) {
            const endDate = new Date(res.data.endDate);
            const today = new Date();
            const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

            setSubscriptionStatus({
              hasSubscription: true,
              endDate,
              daysLeft,
            });

            if (daysLeft <= 0) {
              setRenewalBadge({ type: "expired", text: "Expired", color: "bg-red-500" });
            } else if (daysLeft <= 30) {
              setRenewalBadge({ type: "expiring", text: "Expiring Soon", color: "bg-amber-500" });
            } else {
              setRenewalBadge({ type: "active", text: "Active", color: "bg-emerald-500" });
            }
          } else {
            setSubscriptionStatus({ hasSubscription: false });
          }
        } catch (err) {
          console.error("Failed to fetch subscription status", err);
          setSubscriptionStatus({ hasSubscription: false });
        }
      }
    };

    fetchCategories();
    fetchTicker();
    fetchSubscriptionStatus();
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md font-sans">

      {/* Row 0: Contact / Social / Language / Auth strip */}
      <div className="bg-[#0b1c13] text-slate-200 text-[11px]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-10">
          <div className="flex items-center gap-5 min-w-0">
            <a href="tel:05322440267" className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap">
              <Phone size={12} className="text-emerald-400" />
              <span>0532-2440267</span>
            </a>
            <a href="tel:+917355453462" className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap">
              <Smartphone size={12} className="text-emerald-400" />
              <span>+91 7355453462</span>
            </a>
            <a href="mailto:info@sugartimes.co.in" className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap">
              <Mail size={12} className="text-emerald-400" />
              <span className="truncate">info@sugartimes.co.in</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-slate-300/80">
              <a href="https://www.facebook.com/TheSugarTimes/" target="_blank" rel="noopener noreferrer" title="Facebook" className="hover:text-white transition-colors"><FacebookIcon size={13} /></a>
              <a href="https://in.linkedin.com/company/sugar-times-magazine" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="hover:text-white transition-colors"><LinkedInIcon size={13} /></a>
              <a href="https://x.com/SugarTimes" target="_blank" rel="noopener noreferrer" title="Twitter / X" className="hover:text-white transition-colors"><TwitterXIcon size={13} /></a>
              <a href="https://www.youtube.com/@sugartimesmagazine2346" target="_blank" rel="noopener noreferrer" title="YouTube" className="hover:text-white transition-colors"><YouTubeIcon size={13} /></a>
              <a href="https://wa.me/917355453462" target="_blank" rel="noopener noreferrer" title="WhatsApp" className="hover:text-white transition-colors font-black text-[12px] leading-none">w</a>
            </div>

            <button
              onClick={toggleLang}
              title={lang === "en" ? "Switch to Hindi" : "Switch to English"}
              aria-pressed={lang === "hi"}
              className="flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider"
            >
              <Globe size={13} />
              <span className={lang === "hi" ? "text-white" : "text-slate-500"}>हिंदी</span>
              <span className="text-slate-600">/</span>
              <span className={lang === "en" ? "text-white" : "text-slate-500"}>EN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: Tools & Branding (Centered Logo Layout) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-1 flex flex-col sm:flex-row items-center justify-between bg-white border-b border-slate-50 relative min-h-[74px] gap-4 sm:gap-0">

        {/* Left: Date Tools (Hidden on mobile for better space) */}
        <div className="hidden md:flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-green-600" />
            <span translate="no" className="notranslate border-b border-slate-200 pb-0.5" suppressHydrationWarning>{today}</span>
          </div>
        </div>

        <div className="flex justify-center items-center md:w-1/3">
          <Link href="/" className="transition-all hover:scale-105 active:scale-95">
            <Image
              src="/sugar times main logo.png"
              alt="Sugar Times"
              width={150}
              height={46}
              priority
              className="h-16 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Right: Admin link, user menu, and Login/Register button. */}
        <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-4 md:w-1/3">
          {isAdmin && <Link href="/admin/dashboard" className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase border-b-2 border-green-500 pb-0.5 tracking-wider hover:text-green-600 transition-colors">{t("admin")}</Link>}
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2.5 text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-widest bg-slate-50 px-3 sm:px-4 py-2 rounded-full border border-slate-100 hover:bg-white hover:shadow-sm transition-all whitespace-nowrap">
                <User size={14} className="text-green-600" />
                <span className="hidden xs:inline">{user.name?.split(" ")[0]}</span> <ChevronDown size={12} className={`transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-4 w-48 bg-white shadow-2xl rounded-2xl py-2 border border-slate-50 z-[999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  <Link href="/dashboard" className="block px-6 py-4 text-xs font-black text-slate-700 hover:bg-slate-50 border-l-4 border-transparent hover:border-green-500 transition-all uppercase tracking-widest">{t("dashboard")}</Link>
                  <button onClick={handleLogout} className="w-full text-left px-6 py-4 text-xs font-black text-red-500 hover:bg-red-50 border-l-4 border-transparent hover:border-red-500 transition-all uppercase tracking-widest">{t("logout")}</button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-[#e85d26] hover:bg-[#d14e1c] text-white text-[10px] md:text-[11px] font-black uppercase tracking-wider px-4 sm:px-5 py-2 sm:py-2.5 rounded-full whitespace-nowrap transition-all shadow-sm"
            >
              {t("login_register")}
            </Link>
          )}
        </div>
      </div>

      {/* Row 2: Scrolling News Ticker */}
      <div className="bg-[#0b1c13] h-10 flex items-center overflow-hidden border-b border-green-900/30">
        <div className="max-w-[1400px] w-full mx-auto flex items-center h-full">
          <div className="bg-red-600 h-full flex items-center px-4 shrink-0 relative z-20 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
            <span className="text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap animate-pulse">{t("breaking_news")}</span>
          </div>

          <div className="flex-1 overflow-hidden h-full flex items-center relative">
            {tickerArticles.length > 0 ? (
              <div className="flex whitespace-nowrap animate-ticker group h-full items-center pl-4">
                {[...new Map(tickerArticles.map(a => [a._id, a])).values()].map((article) => (
                  <Link key={article._id} href={`/article/${article._id}`} className="mx-8 text-[11px] font-black text-emerald-100/90 hover:text-green-400 transition-colors uppercase tracking-widest flex items-center gap-3 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                    {article.title}
                  </Link>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-emerald-800 font-bold px-8 uppercase tracking-widest italic">{t("no_breaking")}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 h-9 flex items-center justify-between bg-white border-t border-slate-50">
        <div className="hidden lg:flex flex-1 items-center justify-center h-full lg:-translate-x-24">
          <nav className="flex items-center gap-1.5 h-full">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group/navitem h-full flex items-center">
                <Link href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-black transition-all text-[12px] uppercase tracking-wide h-full flex items-center border-b-2 border-transparent ${pathname === link.href ? "text-green-600 border-green-500 bg-green-50/10" : "text-slate-800 hover:text-green-600"}`}>
                  {link.label === "HOME" ? t("home").toUpperCase() : tCategory(link.label).toUpperCase()}
                  {link.dropdown && <ChevronDown size={12} className="group-hover/navitem:rotate-180 transition-transform duration-300" />}
                </Link>

                {link.dropdown && (
                  <div className="absolute top-[calc(100%-1px)] left-0 mt-0 w-64 pt-0 opacity-0 invisible group-hover/navitem:opacity-100 group-hover/navitem:visible transition-all duration-300 z-50">
                    <div className="bg-white border-t-2 border-green-500 shadow-2xl flex flex-col py-1.5 translate-y-2 group-hover/navitem:translate-y-0 transition-transform duration-300 font-sans">
                      {link.dropdown.map((subItem) => (
                        <Link key={subItem.label} href={subItem.href}
                          onClick={() => setOpen(false)}
                          className="px-5 py-3 text-[12px] font-bold text-slate-600 hover:bg-green-50 hover:text-green-600 transition-all flex justify-between items-center group/sub">
                          {tCategory(subItem.label)}
                          <ArrowRight size={10} className="opacity-0 -translate-x-2 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Left: Renewal Button (white bg) */}
        <div className="flex items-center gap-3">
          {user && subscriptionStatus?.hasSubscription && (
            <Link href="/renewal" className="hidden sm:flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-black uppercase tracking-widest px-4 py-2 border border-slate-200 rounded-full transition-all relative group shadow-sm">
              <RefreshCw size={13} className="text-emerald-600 group-hover:rotate-180 transition-transform duration-500" />
              {t("renew")}
              {renewalBadge && (
                <span className={`absolute -top-2 -right-2 ${renewalBadge.color} text-white text-[9px] font-black rounded-full px-2 py-0.5 leading-tight ${renewalBadge.type === "expired" || renewalBadge.type === "expiring" ? "animate-pulse" : ""}`}>
                  {t(`badge_${renewalBadge.type}`)}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Right: Search + Advertise + Subscribe */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-slate-800 hover:text-green-600 transition-colors">
            <Search size={18} className="stroke-[2.5]" />
          </button>

          <Link href="/advertise" className="hidden sm:block text-[11px] font-black uppercase tracking-widest px-5 py-2 rounded-full border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white transition-all">
            {t("advertise")}
          </Link>
          <Link href="/subscription" className="hidden sm:block bg-[#e85d26] hover:bg-[#d14e1c] text-white text-[11px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg shadow-orange-500/20 transition-all">
            {t("subscribe")}
          </Link>
          <button className="lg:hidden p-2 text-slate-800" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Global Search Overlay */}
      {searchOpen && (
        <div className="border-t border-slate-100 px-4 py-4 bg-white animate-in slide-in-from-top duration-300">
          <form onSubmit={handleGlobalSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input autoFocus type="text" placeholder={t("search_placeholder")}
                value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 focus:outline-none transition-all shadow-inner" />
            </div>
            <button type="submit" className="bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-green-600">{t("search")}</button>
            <button type="button" onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
          </form>
        </div>
      )}

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-white flex flex-col p-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-10">
            <span className="text-xl font-black text-slate-900 uppercase">Sugar<span className="text-green-500">Times</span></span>
            <button onClick={() => setOpen(false)}><X size={28} /></button>
          </div>
          <div className="flex flex-col gap-6 overflow-y-auto">
            {navLinks.map(link => (
              <div key={link.label}>
                <Link href={link.href} onClick={() => setOpen(false)} className="text-lg font-black text-slate-800 uppercase tracking-wide">{link.label === "HOME" ? t("home").toUpperCase() : tCategory(link.label).toUpperCase()}</Link>
                {link.dropdown && (
                  <div className="pl-4 mt-3 space-y-3 flex flex-col border-l-2 border-green-500">
                    {link.dropdown.map(s => (
                      <Link key={s.label} href={s.href} onClick={() => setOpen(false)} className="text-sm font-bold text-slate-500 uppercase">{tCategory(s.label)}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
              <Link href="/advertise" onClick={() => setOpen(false)} className="text-center text-sm font-black uppercase tracking-widest px-5 py-3 rounded-full border-2 border-slate-800 text-slate-800">{t("advertise")}</Link>
              <Link href="/subscription" onClick={() => setOpen(false)} className="text-center text-sm font-black uppercase tracking-widest px-5 py-3 rounded-full bg-[#e85d26] text-white">{t("subscribe")}</Link>
              {user && subscriptionStatus?.hasSubscription && (
                <Link href="/renewal" onClick={() => setOpen(false)} className="text-center text-sm font-black uppercase tracking-widest px-5 py-3 rounded-full border border-slate-200 bg-white text-slate-800 flex items-center justify-center gap-2">
                  <RefreshCw size={14} className="text-emerald-600" /> {t("renew")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
