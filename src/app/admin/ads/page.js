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
  { value: "middle", label: "Middle (In-Article Banner)", desc: "Shows between article paragraphs" },
  { value: "sidebar", label: "Sidebar (Social/Popular Rail)", desc: "Shows in the right sidebar" },
  { value: "home_banner", label: "Home Page Banner", desc: "Shows horizontally on the Home Page" },
  { value: "both", label: "All Placements (Industrial)", desc: "Middle, Sidebar, and Home Banner (3-in-1)" },
];

const EMPTY_FORM = {
  id: "",
  title: "",
  image: "",
  link: "",
  placement: "middle",
  categories: [],
  priority: 0,
  active: true,
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
      priority: ad.priority || 0,
      active: ad.active !== false,
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
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      delete payload.id;
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
                priority: parseInt(item["Priority"]) || 0,
                active: item["Active"] === "Yes",
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
      "Priority": ad.priority || 0,
      "Active": ad.active ? "Yes" : "No",
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
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${ad.active ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"}`}>
                    {ad.active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    {ad.active ? "Live" : "Paused"}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900/80 text-white backdrop-blur-sm">
                    {ad.placement}
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
                  <button type="button" onClick={() => setShowMedia(true)} className="px-5 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
                    <LayoutGrid size={14} /> Explorer
                  </button>
                </div>
                {form.image && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                    <img src={form.image} alt="preview" className="w-full max-h-48 object-contain" />
                  </div>
                )}
              </div>

              {/* Placement */}
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Sparkles size={11} /> Placement
                </label>
                <div className="grid md:grid-cols-4 gap-3">
                  {PLACEMENTS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm({ ...form, placement: p.value })}
                      className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        form.placement === p.value
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-100 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-black text-slate-900 mb-0.5">{p.label}</div>
                      <div className="text-[10px] text-slate-500">{p.desc}</div>
                    </button>
                  ))}
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

              {/* Schedule + Priority + Active */}
              <div className="grid md:grid-cols-3 gap-5">
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
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority</label>
                  <input
                    type="number"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-green-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${form.active ? "bg-emerald-500" : "bg-slate-200"}`}>
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="hidden" />
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${form.active ? "left-5" : "left-1"}`} />
                </div>
                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Active</span>
              </label>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
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
