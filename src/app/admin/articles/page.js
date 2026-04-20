"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { articlesAPI, categoriesAPI } from "@/lib/api";
import { mockArticles } from "@/lib/mockData";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Search, Loader2, X, Save, TrendingUp, FileText, LayoutGrid, FileEdit } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import RichTextEditor from "@/components/RichTextEditor";
import MediaExplorer from "@/components/MediaExplorer";
import { CATEGORY_TREE } from "@/lib/categories";

// Convert static tree to the shape we need: [{label, slug, emoji, children: [{label, slug}]}]
const staticTree = CATEGORY_TREE.map((p) => ({
  label: p.label,
  slug: p.slug,
  emoji: p.emoji,
  children: p.children.map((c) => ({ label: c.label, slug: c.slug })),
}));

function ArticlesContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlTrending = searchParams.get("trending") === "true";

  // Dynamic category tree — fetched from API, fallback to static
  const [categoryTree, setCategoryTree] = useState(staticTree);

  useEffect(() => {
    categoriesAPI.getTree().then((res) => {
      const tree = Array.isArray(res.data) ? res.data : [];
      if (tree.length > 0) {
        setCategoryTree(
          tree.map((p) => ({
            label: p.name,
            slug: p.slug,
            emoji: p.emoji || "📁",
            children: (p.children || []).map((c) => ({ label: c.name, slug: c.slug })),
          }))
        );
      }
    }).catch(() => {});
  }, []);

  const DEFAULT_CATEGORY = categoryTree[0]?.label || CATEGORY_TREE[0].label;

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: "",
    title: "",
    category: DEFAULT_CATEGORY,
    subcategory: "",
    excerpt: "",
    content: "",
    image: "",
    premium: false,
    trending: false,
    status: "published",
  });
  const [saving, setSaving] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [mediaContext, setMediaContext] = useState("cover"); // "cover" or "inline"
  const editorRef = useRef(null);

  const urlEditParam = searchParams.get("edit");

  useEffect(() => {
    if (!urlCategory) return;
    // Seed parent + subcategory from URL
    const parent = categoryTree.find((p) => p.label === urlCategory);
    if (parent) {
      setForm((prev) => ({ ...prev, category: parent.label, subcategory: "" }));
    } else {
      const match = categoryTree.find((p) =>
        p.children.some((c) => c.label === urlCategory)
      );
      if (match) {
        setForm((prev) => ({ ...prev, category: match.label, subcategory: urlCategory }));
      }
    }
  }, [urlCategory, categoryTree]);

  // Re-fetch whenever the sidebar category (or trending flag) changes so
  // the list for the selected category / sub-category actually populates.
  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory, urlTrending]);

  useEffect(() => {
    if (urlEditParam && articles.length > 0) {
      const articleToEdit = articles.find(a => (a._id === urlEditParam || a.id === urlEditParam));
      if (articleToEdit) handleEdit(articleToEdit);
    }
  }, [urlEditParam, articles]);

  const handleEdit = (article) => {
    // Resolve parent if only a subcategory label was stored on `category`
    let parent = article.category || DEFAULT_CATEGORY;
    let sub = article.subcategory || "";
    const parentMatch = categoryTree.find((p) => p.label === parent);
    if (!parentMatch) {
      const owner = categoryTree.find((p) =>
        p.children.some((c) => c.label === parent)
      );
      if (owner) {
        sub = sub || parent;
        parent = owner.label;
      } else {
        parent = DEFAULT_CATEGORY;
      }
    }
    setForm({
      id: article._id || article.id,
      title: article.title || "",
      category: parent,
      subcategory: sub,
      excerpt: article.excerpt || "",
      content: article.content || "",
      image: article.image || article.imageUrl || "",
      premium: !!article.premium,
      trending: !!article.trending,
      status: article.status || "published",
    });
    setShowForm(true);
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (urlCategory) params.category = urlCategory;
      const { data } = await articlesAPI.getAll(params);
      const list = Array.isArray(data?.articles)
        ? data.articles
        : Array.isArray(data)
          ? data
          : [];
      setArticles(list);
    } catch {
      // Fallback to mock data, client-filtered by URL category
      const filteredMock = urlCategory
        ? mockArticles.filter(
            (a) => a.category === urlCategory || a.subcategory === urlCategory
          )
        : mockArticles;
      setArticles(filteredMock);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e, type = "published") => {
    if (e) e.preventDefault();
    setSaving(true);
    if (type === "draft") setIsDrafting(true);
    
    try {
      const payload = { ...form, status: type };
      if (form.id) {
        await articlesAPI.update(form.id, payload);
      } else {
        await articlesAPI.create(payload);
      }
      toast.success(type === "draft" ? "Draft saved successfully!" : "Article published successfully!", {
        style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' },
        iconTheme: { primary: '#22c55e', secondary: '#fff' }
      });
      setShowForm(false);
      setForm({ id: "", title: "", category: DEFAULT_CATEGORY, subcategory: "", excerpt: "", content: "", image: "", premium: false, trending: false, status: "published" });
      fetchArticles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save article");
    } finally {
      setSaving(false);
      setIsDrafting(false);
    }
  };

  const handleInlineImageClick = () => {
    setMediaContext("inline");
    setShowMedia(true);
  };

  const handleMediaSelect = (url) => {
    if (mediaContext === "cover") {
      setForm({ ...form, image: url });
    } else {
      // Insert into Quill editor
      const quill = editorRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", url);
        quill.setSelection(range.index + 1);
      }
    }
    setShowMedia(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this article?")) return;
    try {
      await articlesAPI.delete(id);
      setArticles((prev) => prev.filter((a) => (a._id || a.id) !== id));
    } catch {
      alert("Failed to delete article");
    }
  };

  // Server already filters by category. We only apply the local search
  // box and the trending flag here.
  const filtered = articles.filter((a) => {
    const matchesSearch = a.title?.toLowerCase().includes(search.toLowerCase());
    const matchesTrending = urlTrending ? a.trending === true : true;
    // Defensive client-side category re-check in case a stale result slips
    // through (e.g. when the API fallback returns mock data).
    const matchesCategory = urlCategory
      ? a.category === urlCategory || a.subcategory === urlCategory
      : true;
    return matchesSearch && matchesCategory && matchesTrending;
  });

  const activeParent = categoryTree.find((p) => p.label === form.category);
  const subOptions = activeParent?.children || [];

  return (
    <>
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            {urlTrending ? <TrendingUp className="text-red-500" /> : <FileText className="text-green-500" />}
            {urlTrending ? "Breaking News" : (urlCategory || "Central Article Desk")}
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">
            Managing {urlCategory ? `the "${urlCategory}" segment` : "all editorial content"} • {filtered.length} entries
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-3 bg-[#1b5e20] hover:bg-black text-white font-black px-6 py-3.5 rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-lg hover:shadow-green-900/20 active:scale-95 group">
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" /> 
          {urlCategory ? `Add ${urlCategory} Article` : "Draft New Article"}
        </button>
      </div>

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-10 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
              <div>
                <h2 className="font-black text-slate-900 text-2xl tracking-tight uppercase italic">{urlCategory ? `Publish to ${urlCategory}` : "New Editorial Draft"}</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Fill in the details to go live on the user panel</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"><X size={20} /></button>
            </div>
            <Toaster position="top-right" />
            
            <form onSubmit={(e) => handleCreate(e, "published")} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">Article Headline <span className="text-red-500">*</span></label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Maharashtra sugar mills see record production..."
                    className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 bg-slate-50/50 transition-all" />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Parent Category <span className="text-red-500">*</span></label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })}
                    className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 bg-white shadow-sm transition-all appearance-none cursor-pointer"
                  >
                    {categoryTree.map((c) => (
                      <option key={c.slug} value={c.label}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Sub-Category
                    <span className="text-slate-300 font-bold normal-case tracking-normal ml-2">(optional)</span>
                  </label>
                  <select
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    disabled={subOptions.length === 0}
                    className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 bg-white shadow-sm transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">— None (Parent only) —</option>
                    {subOptions.map((s) => (
                      <option key={s.slug} value={s.label}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${form.premium ? "bg-slate-900" : "bg-slate-200"}`}>
                       <input type="checkbox" className="hidden" checked={form.premium} onChange={(e) => setForm({ ...form, premium: e.target.checked })} />
                       <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${form.premium ? "left-5" : "left-1"}`}></div>
                    </div>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest group-hover:text-slate-900">Premium Content</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${form.trending ? "bg-red-600" : "bg-slate-200"}`}>
                       <input type="checkbox" className="hidden" checked={form.trending} onChange={(e) => setForm({ ...form, trending: e.target.checked })} />
                       <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${form.trending ? "left-5" : "left-1"}`}></div>
                    </div>
                    <span className="text-xs font-black text-red-600 uppercase tracking-widest group-hover:text-red-700">Breaking News</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Cover Media (Image URL)</label>
                <div className="flex gap-4">
                  <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-5 py-4 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 bg-slate-50/50 transition-all" />
                  <button type="button" onClick={() => { setMediaContext("cover"); setShowMedia(true); }}
                    className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
                    <LayoutGrid size={16} /> Explorer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Short Summary (Excerpt)</label>
                <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="A one or two line hook for the listing card..."
                  className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 bg-slate-50/50 transition-all resize-none" />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">Extended Content <span className="text-red-500">*</span></label>
                <RichTextEditor 
                  ref={editorRef}
                  value={form.content} 
                  onChange={(val) => setForm({ ...form, content: val })}
                  onImageUpload={handleInlineImageClick}
                  placeholder="Paste your full article text here. Use shifts for new lines..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-4 border-2 border-slate-50 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">Discard</button>
                <button type="button" disabled={saving} onClick={() => handleCreate(null, "draft")}
                  className="flex-1 py-4 border-2 border-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-40">
                  {isDrafting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isDrafting ? "Saving..." : "Save Draft"}
                </button>
                <button type="submit" disabled={saving}
                  className="flex-[2] py-4 bg-[#1b5e20] hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-green-900/20 transition-all disabled:opacity-40 active:scale-95">
                  {(saving && !isDrafting) ? <Loader2 size={16} className="animate-spin" /> : <FileEdit size={16} />}
                  {(saving && !isDrafting) ? "Processing..." : (urlCategory ? `Publish to ${urlCategory}` : "Publish Globally")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaExplorer 
        isOpen={showMedia} 
        onClose={() => setShowMedia(false)} 
        onSelect={handleMediaSelect} 
      />

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-green-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Title</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Category</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a._id || a.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={a.image || a.imageUrl || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100"}
                          alt={a.title} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                        <p className="font-semibold text-slate-800 line-clamp-1 max-w-xs">{a.title}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{a.category}</span>
                        {a.subcategory && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">{a.subcategory}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-max ${a.premium ? "bg-slate-900 text-green-400" : "bg-green-100 text-green-700"}`}>
                          {a.premium ? "Premium" : "Free"}
                        </span>
                        {a.trending && <span className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1"><TrendingUp size={10} /> Breaking</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/article/${a._id || a.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View published article"
                          className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors inline-flex items-center"
                        >
                          <Eye size={14} />
                        </Link>
                        <button onClick={() => handleEdit(a)} title="Edit" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(a._id || a.id)} title="Delete" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default function AdminArticles() {
  return (
    <AdminLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <ArticlesContent />
      </Suspense>
    </AdminLayout>
  );
}
