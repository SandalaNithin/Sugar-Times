"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import MediaExplorer from "@/components/MediaExplorer";
import { adsAPI } from "@/lib/api";
import { CATEGORY_TREE } from "@/lib/categories";
import {
  Megaphone, Plus, Edit, Trash2, X, Loader2, Save, Image as ImageIcon,
  LayoutGrid, ExternalLink, Calendar, CheckCircle2, XCircle, Target, Sparkles,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import DataExportImport from "@/components/DataExportImport";

const PLACEMENTS = [
  {
    value: "middle",
    label: "Middle",
    sublabel: "In-Article Banner",
    desc: "Shows between article paragraphs",
    icon: (
      <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none">
        <rect x="1" y="1" width="46" height="8" rx="2" fill="#e2e8f0"/>
        <rect x="1" y="11" width="28" height="3" rx="1" fill="#cbd5e1"/>
        <rect x="1" y="16" width="28" height="3" rx="1" fill="#cbd5e1"/>
        <rect x="8" y="21" width="32" height="9" rx="2" fill="#10b981" opacity="0.9"/>
        <text x="24" y="28" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">AD</text>
      </svg>
    ),
    color: "emerald",
  },
  {
    value: "sidebar",
    label: "Sidebar",
    sublabel: "Social/Popular Rail",
    desc: "Shows in the right sidebar",
    icon: (
      <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none">
        <rect x="1" y="1" width="30" height="30" rx="2" fill="#e2e8f0"/>
        <rect x="3" y="3" width="26" height="4" rx="1" fill="#cbd5e1"/>
        <rect x="3" y="9" width="26" height="3" rx="1" fill="#cbd5e1"/>
        <rect x="33" y="1" width="14" height="30" rx="2" fill="#10b981" opacity="0.9"/>
        <text x="40" y="18" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">AD</text>
      </svg>
    ),
    color: "blue",
  },
  {
    value: "home_banner",
    label: "Home Page",
    sublabel: "Banner",
    desc: "Shows horizontally on the Home Page",
    icon: (
      <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none">
        <rect x="1" y="1" width="46" height="30" rx="2" fill="#e2e8f0"/>
        <rect x="1" y="1" width="46" height="10" rx="2" fill="#10b981" opacity="0.9"/>
        <text x="24" y="9" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">HOME BANNER AD</text>
        <rect x="3" y="14" width="20" height="5" rx="1" fill="#cbd5e1"/>
        <rect x="3" y="21" width="20" height="5" rx="1" fill="#cbd5e1"/>
        <rect x="25" y="14" width="20" height="12" rx="1" fill="#cbd5e1"/>
      </svg>
    ),
    color: "purple",
  },
  {
    value: "both",
    label: "All Placements",
    sublabel: "Industrial (3-in-1)",
    desc: "Middle + Sidebar + Home Banner",
    icon: (
      <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none">
        <rect x="1" y="1" width="46" height="6" rx="2" fill="#f59e0b" opacity="0.9"/>
        <text x="24" y="6" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">HOME</text>
        <rect x="1" y="9" width="30" height="6" rx="1" fill="#e2e8f0"/>
        <rect x="3" y="10" width="20" height="2" rx="1" fill="#cbd5e1"/>
        <rect x="3" y="13" width="14" height="2" rx="1" fill="#cbd5e1"/>
        <rect x="33" y="9" width="14" height="22" rx="2" fill="#f59e0b" opacity="0.7"/>
        <text x="40" y="21" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">SIDE</text>
        <rect x="1" y="17" width="30" height="14" rx="2" fill="#f59e0b" opacity="0.9"/>
        <text x="16" y="26" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">MID AD</text>
      </svg>
    ),
    color: "amber",
  },
  {
    value: "news_top",
    label: "News Top",
    sublabel: "Above Articles",
    desc: "Shows above the news grid on category pages",
    icon: (
      <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none">
        <rect x="1" y="1" width="46" height="30" rx="2" fill="#e2e8f0"/>
        <rect x="1" y="1" width="46" height="8" rx="2" fill="#f43f5e" opacity="0.9"/>
        <text x="24" y="6" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">NEWS TOP AD</text>
        <rect x="3" y="11" width="12" height="15" rx="1" fill="#cbd5e1"/>
        <rect x="18" y="11" width="12" height="15" rx="1" fill="#cbd5e1"/>
        <rect x="33" y="11" width="12" height="15" rx="1" fill="#cbd5e1"/>
      </svg>
    ),
    color: "rose",
  },
];

const EMPTY_FORM = {
  id: "",
  title: "",
  image: "",
  link: "",
  placement: "middle",
  categories: [],
  status: "published",
  startDate: "",
  endDate: "",
};

export default function AdminAdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const { data } = await adsAPI.getAll();
      setAds(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setShowForm(true); };

  const openEdit = (ad) => {
    setForm({
      id: ad._id,
      title: ad.title || "",
      image: ad.image || "",
      link: ad.link || "",
      placement: ad.placement || "middle",
      categories: ad.categories || [],
      status: ad.active !== false ? "published" : "draft",
      startDate: ad.startDate ? ad.startDate.slice(0, 10) : "",
      endDate: ad.endDate ? ad.endDate.slice(0, 10) : "",
    });
    setShowForm(true);
  };

  const toggleCategory = (label) => {
    setForm((prev) => {
      const exists = prev.categories.includes(label);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== label)
          : [...prev.categories, label],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.image) {
      toast.error("Title and image are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        active: form.status === "published",
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      delete payload.id;
      delete payload.status;
      if (form.id) {
        await adsAPI.update(form.id, payload);
        toast.success("Advertisement updated");
      } else {
        await adsAPI.create(payload);
        toast.success("Advertisement published");
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchAds();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this advertisement?")) return;
    try {
      await adsAPI.delete(id);
      setAds((prev) => prev.filter((a) => a._id !== id));
      toast.success("Advertisement deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleActive = async (ad) => {
    try {
      await adsAPI.update(ad._id, { active: !ad.active });
      fetchAds();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await mediaAPI.upload(formData);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const url = data.url.startsWith("http") ? data.url : `${baseUrl}${data.url}`;
      setForm((prev) => ({ ...prev, image: url }));
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async (parsedData, updateProgress) => {
    let successCount = 0;
    for (let i = 0; i < parsedData.length; i++) {
        const item = parsedData[i];
        try {
            await adsAPI.create({
                title: item["Title"] || "Untitled Ad",
                image: item["Image URL"] || "",
                link: item["Link"] || "",
                placement: item["Placement"] || "middle",
                categories: item["Categories"] ? item["Categories"].split(", ") : [],
                active: item["Status"] === "Published" || item["Active"] === "Yes",
                startDate: item["Start Date"] || "",
                endDate: item["End Date"] || "",
            });
            successCount++;
        } catch (error) {
            console.error("Failed to import ad row:", i, error);
        }
        updateProgress(i + 1);
    }
    if (successCount > 0) fetchAds();
    if (successCount < parsedData.length) {
        throw new Error(`Imported ${successCount}/${parsedData.length} successfully.`);
    }
  };

  const exportMapping = (ad) => ({
      "Title": ad.title,
      "Image URL": ad.image || "",
      "Link": ad.link || "",
      "Placement": ad.placement || "middle",
      "Categories": ad.categories?.length ? ad.categories.join(", ") : "",
      "Status": ad.active ? "Published" : "Draft",
      "Start Date": ad.startDate ? ad.startDate.slice(0, 10) : "",
      "End Date": ad.endDate ? ad.endDate.slice(0, 10) : "",
  });

  return (
    <AdminLayout>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Megaphone className="text-green-500" />
            Advertisements
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">
            {ads.length} active slots &middot; Control in-article &amp; sidebar ads per category
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <DataExportImport
            title="Advertisements"
            data={ads}
            exportMapping={exportMapping}
            onImport={handleImport}
            isLoading={loading}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-3 bg-[#1b5e20] hover:bg-black text-white font-black px-6 py-3.5 rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 group"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            New Advertisement
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-green-500" />
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Megaphone className="text-emerald-500" size={28} />
          </div>
          <h3 className="font-black text-slate-900 text-lg mb-2">No advertisements yet</h3>
          <p className="text-sm text-slate-500 mb-6">Create your first ad to monetize the site.</p>
          <button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-colors">
            Create Ad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ads.map((ad) => (
            <div key={ad._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
              <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                {ad.image ? (
                  <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300"><ImageIcon size={48} /></div>
                )}
                {/* Placement Badge */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${ad.active ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"}`}>
                    {ad.active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    {ad.active ? "Live" : "Paused"}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm ${
                    ad.placement === "both" ? "bg-amber-500 text-white" :
                    ad.placement === "sidebar" ? "bg-blue-600 text-white" :
                    ad.placement === "home_banner" ? "bg-purple-600 text-white" :
                    ad.placement === "news_top" ? "bg-rose-500 text-white" :
                    "bg-slate-900/80 text-white"
                  }`}>
                    {ad.placement === "both" ? "All 3" : ad.placement === "home_banner" ? "Home" : ad.placement === "news_top" ? "News Top" : ad.placement}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-black text-slate-900 text-sm mb-2 line-clamp-1">{ad.title}</h3>
                <div className="flex flex-wrap gap-1 mb-3">
                  {ad.categories?.length ? (
                    ad.categories.slice(0, 3).map((c) => (
                      <span key={c} className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">{c}</span>
                    ))
                  ) : (
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">All Categories</span>
                  )}
                  {ad.categories?.length > 3 && (
                    <span className="text-[10px] text-slate-500 font-bold">+{ad.categories.length - 3}</span>
                  )}
                </div>
                {ad.link && (
                  <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 truncate mb-3">
                    <ExternalLink size={11} /> {ad.link}
                  </a>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button onClick={() => toggleActive(ad)} className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-emerald-600 transition-colors">
                    {ad.active ? "Pause" : "Activate"}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(ad)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(ad._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-8 py-5 border-b border-slate-100">
              <div>
                <h2 className="font-black text-slate-900 text-xl">{form.id ? "Edit Advertisement" : "New Advertisement"}</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Placement &amp; targeting</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Title + Link */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Bottmac Equipment Banner"
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 bg-slate-50/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Click-Through URL</label>
                  <input
                    type="url"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="https://advertiser.com"
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 bg-slate-50/50 transition-all"
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Advertisement Image <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://... or pick from Explorer"
                    className="flex-1 px-4 py-3 border-2 border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 bg-slate-50/50 transition-all"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowMedia(true)} className="px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
                      <LayoutGrid size={14} /> Explorer
                    </button>
                    <label className="px-4 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 cursor-pointer">
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      Upload
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>
                {form.image && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                    <img src={form.image} alt="preview" className="w-full max-h-48 object-contain" />
                  </div>
                )}
              </div>

              {/* Placement */}
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                  <Sparkles size={11} /> Placement
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {PLACEMENTS.map((p) => {
                    const isSelected = form.placement === p.value;
                    const isAll = p.value === "both";
                    const isNewsTop = p.value === "news_top";
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setForm({ ...form, placement: p.value })}
                        className={`relative text-left p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 ${
                          isSelected
                            ? isAll
                              ? "border-amber-400 bg-amber-50 shadow-lg shadow-amber-100"
                              : isNewsTop
                                ? "border-rose-400 bg-rose-50 shadow-lg shadow-rose-100"
                                : "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100"
                            : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                        }`}
                      >
                        {isAll && (
                          <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest bg-amber-400 text-white px-1.5 py-0.5 rounded-full">3-in-1</span>
                        )}
                        <div className={`rounded-xl p-1.5 w-fit ${
                          isSelected ? (isAll ? "bg-amber-100" : isNewsTop ? "bg-rose-100" : "bg-emerald-100") : "bg-slate-100"
                        }`}>
                          {p.icon}
                        </div>
                        <div>
                          <div className={`text-xs font-black mb-0.5 ${
                            isSelected ? (isAll ? "text-amber-700" : isNewsTop ? "text-rose-700" : "text-emerald-700") : "text-slate-800"
                          }`}>{p.label}</div>
                          <div className={`text-[10px] font-bold ${
                            isSelected ? (isAll ? "text-amber-500" : isNewsTop ? "text-rose-500" : "text-emerald-500") : "text-slate-400"
                          }`}>{p.sublabel}</div>
                          <div className="text-[9px] text-slate-400 mt-1 leading-tight">{p.desc}</div>
                        </div>
                        {isSelected && (
                          <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full flex items-center justify-center ${
                            isAll ? "bg-amber-500" : isNewsTop ? "bg-rose-500" : "bg-emerald-500"
                          }`}>
                            <CheckCircle2 size={10} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Targeting */}
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Target size={11} /> Show On Categories
                  <span className="normal-case tracking-normal font-bold text-slate-300 ml-2">
                    (Select none = show on ALL)
                  </span>
                </label>
                <div className="space-y-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 max-h-64 overflow-y-auto">
                  {CATEGORY_TREE.map((parent) => (
                    <div key={parent.slug}>
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input
                          type="checkbox"
                          checked={form.categories.includes(parent.label)}
                          onChange={() => toggleCategory(parent.label)}
                          className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-400"
                        />
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                          <span>{parent.emoji}</span>
                          {parent.label}
                        </span>
                      </label>
                      <div className="ml-6 flex flex-wrap gap-2">
                        {parent.children.map((child) => (
                          <label
                            key={child.slug}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold cursor-pointer transition-colors ${
                              form.categories.includes(child.label)
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "bg-white border-slate-200 text-slate-600 hover:border-emerald-400"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={form.categories.includes(child.label)}
                              onChange={() => toggleCategory(child.label)}
                              className="hidden"
                            />
                            {child.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule + Active */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Calendar size={11} /> Start Date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-green-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Calendar size={11} /> End Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-green-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Publish Status</label>
                <div className="flex gap-3">
                  {["published", "draft"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        form.status === s
                          ? s === "published" ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100" : "bg-slate-700 border-slate-700 text-white shadow-lg shadow-slate-100"
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      {s === "published" ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border-2 border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-[2] py-3 bg-[#1b5e20] hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl disabled:opacity-40 transition-all">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "Saving..." : (form.id ? "Update Advertisement" : "Publish Advertisement")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaExplorer
        isOpen={showMedia}
        onClose={() => setShowMedia(false)}
        onSelect={(url) => setForm((prev) => ({ ...prev, image: url }))}
      />
    </AdminLayout>
  );
}
