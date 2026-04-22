"use client";
import Link from "next/link";
import Image from "next/image";
import { Suspense, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard, Users, CreditCard, FileText, BookOpen, LogOut,
  ChevronRight, ChevronDown, Mail, TrendingUp, Folder, Video, BarChart3, FileStack, Megaphone,
  PanelLeftClose, Menu,
} from "lucide-react";
import { CATEGORY_TREE, categoryHref } from "@/lib/categories";
import { categoriesAPI } from "@/lib/api";

const coreItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Enquiries", href: "/admin/enquiries", icon: Mail },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Payments", href: "/admin/payments", icon: BarChart3 },
];

const specializedItems = [
  { label: "Magazines", href: "/admin/magazines", icon: BookOpen },
  { label: "Market Rates", href: "/admin/markets", icon: TrendingUp },
  { label: "Video Gallery", href: "/admin/videos", icon: Video },
  { label: "Advertisements", href: "/admin/ads", icon: Megaphone },
];

const articleShortcuts = [
  { label: "All Articles", href: "/admin/articles", icon: FileStack },
  { label: "Breaking News", href: "/admin/articles?trending=true", icon: TrendingUp },
];

const adminCategoryHref = (label) =>
  `/admin/articles?category=${encodeURIComponent(label)}`;

// Normalize trailing slash so `/admin/dashboard/` and `/admin/dashboard`
// compare equal (Next's `trailingSlash: true` config adds the slash to
// pathname, but our hrefs don't have it → active-state never matches).
const stripTrailing = (p) => (p && p !== "/" ? p.replace(/\/$/, "") : p);
const buildFullHref = (pathname, searchParams) => {
  const clean = stripTrailing(pathname || "");
  const qs = searchParams?.toString();
  return qs ? `${clean}?${qs}` : clean;
};

const SectionHeader = ({ title }) => (
  <h3 className="px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
    {title}
  </h3>
);

function CategoryTreeNav({ currentHref }) {
  const safeHref = currentHref || "";
  const [categoryTree, setCategoryTree] = useState(CATEGORY_TREE);

  useEffect(() => {
    categoriesAPI.getTree().then((res) => {
      const tree = Array.isArray(res.data) ? res.data : [];
      if (tree.length > 0) {
        // Map API shape to the shape used by this component
        setCategoryTree(
          tree.map((p) => ({
            slug: p.slug,
            label: p.name,
            emoji: p.emoji || "📁",
            children: (p.children || []).map((c) => ({ slug: c.slug, label: c.name })),
          }))
        );
      }
    }).catch(() => { });
  }, []);

  const [openSlug, setOpenSlug] = useState(() => {
    const match = categoryTree.find(
      (p) =>
        safeHref.includes(encodeURIComponent(p.label)) ||
        p.children.some((c) => safeHref.includes(encodeURIComponent(c.label)))
    );
    return match?.slug || null;
  });

  return (
    <div className="space-y-0.5">
      {categoryTree.map((parent) => {
        const parentHref = adminCategoryHref(parent.label);
        const isOpen = openSlug === parent.slug;
        const isParentActive = currentHref === parentHref;
        const isChildActive = parent.children.some(
          (c) => currentHref === adminCategoryHref(c.label)
        );
        const groupActive = isParentActive || isChildActive;

        return (
          <div key={parent.slug}>
            <button
              type="button"
              onClick={() => setOpenSlug(isOpen ? null : parent.slug)}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${groupActive
                  ? "bg-white/10 text-white"
                  : "text-emerald-100 hover:bg-white/5 hover:text-white"
                }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <span className="text-sm">{parent.emoji}</span>
                <span className="truncate">{parent.label}</span>
              </span>
              <ChevronDown
                size={12}
                className={`text-emerald-300/70 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="ml-3 pl-3 border-l border-emerald-700/50 mt-1 mb-1 space-y-0.5">
                <Link
                  href={parentHref}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${isParentActive
                      ? "bg-emerald-600/40 text-white"
                      : "text-emerald-200/80 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <ChevronRight size={10} className="text-emerald-300/60" />
                  All {parent.label}
                </Link>
                {parent.children.map((child) => {
                  const href = adminCategoryHref(child.label);
                  const active = currentHref === href;
                  return (
                    <Link
                      key={child.slug}
                      href={href}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] transition-colors ${active
                          ? "bg-emerald-600/40 text-white font-bold"
                          : "text-emerald-200/70 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      <ChevronRight size={10} className="text-emerald-300/50" />
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SidebarNav({ handleLogout }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentHref = buildFullHref(pathname, searchParams);

  const NavLink = ({ label, href, icon: Icon }) => {
    const isActive = currentHref === href;
    return (
      <Link
        href={href}
        prefetch={false}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${isActive
            ? "bg-white/10 text-white shadow-sm border border-white/10"
            : "text-emerald-100 hover:bg-white/5 hover:text-white"
          }`}
      >
        <Icon size={16} className={isActive ? "text-emerald-300" : "text-emerald-400/70"} />
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
      {/* Core Management */}
      <div className="mb-6">
        <SectionHeader title="Core Management" />
        <div className="space-y-1">
          {coreItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>
      </div>

      {/* Specialized Content */}
      <div className="mb-6">
        <SectionHeader title="Specialized Content" />
        <div className="space-y-1">
          {specializedItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>
      </div>

      {/* News Categories (dynamic tree) */}
      <div className="mb-6">
        <SectionHeader title="News Sections" />
        <div className="space-y-1 mb-3">
          {articleShortcuts.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 mb-2 mt-4">
          <Folder size={12} className="text-emerald-400/60" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60">Categories</span>
        </div>
        <CategoryTreeNav currentHref={currentHref} />
      </div>

      <div className="pt-4 mt-6 border-t border-emerald-800/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-red-200 hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={16} className="text-red-400/70" />
          Sign Out
        </button>
      </div>
    </nav>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <div className="min-h-screen bg-[#f4f3ec] flex font-sans">
      {/* Backdrop for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 transition-opacity"
        />
      )}

      <aside
        className={`bg-[#1b5e20] text-white flex flex-col shrink-0 shadow-xl sticky top-0 h-screen transition-all duration-300 z-40
          ${sidebarOpen ? "w-64" : "w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden"}
          fixed lg:sticky inset-y-0 left-0 lg:inset-auto`}
      >
        <div className="p-5 border-b border-emerald-800/50 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 group min-w-0">
            <div className="bg-white/95 rounded-lg p-1.5 shadow-inner shrink-0">
              <Image
                src="/sugar times main logo.png"
                alt="Sugar Times"
                width={120}
                height={44}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        <Suspense fallback={<div className="p-8 text-emerald-200/50 text-xs text-center">Loading Nav...</div>}>
          <SidebarNav handleLogout={handleLogout} />
        </Suspense>
      </aside>

      <div className="flex-1 overflow-auto flex flex-col items-stretch min-w-0">
        <header className="px-6 lg:px-10 py-5 flex items-center gap-4 sticky top-0 bg-[#f4f3ec]/90 backdrop-blur-sm z-20 border-b border-slate-200/50">
          <button
            type="button"
            onClick={toggleSidebar}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors border ${sidebarOpen
                ? "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                : "bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800 shadow-lg"
              }`}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <Menu size={18} />}
          </button>
          <h2 className="text-2xl lg:text-3xl font-serif text-slate-800 font-bold capitalize truncate">
            {pathname.split("/").pop().replace(/-/g, " ")}
          </h2>
        </header>

        <main className="px-6 lg:px-10 py-6 lg:py-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
