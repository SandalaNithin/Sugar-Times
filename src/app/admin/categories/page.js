"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { categoriesAPI } from "@/lib/api";
import {
  Plus, Pencil, Trash2, FolderTree, ChevronDown, ChevronRight,
  GripVertical, Save, X, Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import DataExportImport from "@/components/DataExportImport";

const COLORS = [
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-lime-500 to-green-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-teal-600",
  "from-red-500 to-rose-600",
  "from-indigo-500 to-blue-600",
  "from-yellow-500 to-amber-600",
];

const EMOJIS = ["🏭", "🧪", "🌾", "📈", "🔬", "🍬", "📰", "⚡", "🌍", "🏗️", "💰", "🌱", "🔧", "📊", "🎤"];

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

const emptyForm = { name: "", slug: "", emoji: "", color: COLORS[0], parent: "", order: 0 };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [expandedParents, setExpandedParents] = useState({});

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [flatRes, treeRes] = await Promise.all([
        categoriesAPI.getAllFlat(),
        categoriesAPI.getTree(),
      ]);
      setCategories(Array.isArray(flatRes.data) ? flatRes.data : []);
      setTree(Array.isArray(treeRes.data) ? treeRes.data : []);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const parentCategories = categories.filter((c) => !c.parent);

  const openCreateForm = (parentId = "") => {
    setForm({ ...emptyForm, parent: parentId });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (cat) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      emoji: cat.emoji || "",
      color: cat.color || COLORS[0],
      parent: cat.parent?._id || cat.parent || "",
      order: cat.order || 0,
    });
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleNameChange = (val) => {
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: editingId ? prev.slug : slugify(val),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        emoji: form.emoji,
        color: form.color,
        parent: form.parent || null,
        order: Number(form.order) || 0,
      };
      if (editingId) {
        await categoriesAPI.update(editingId, payload);
        toast.success("Category updated");
      } else {
        await categoriesAPI.create(payload);
        toast.success("Category created");
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      await fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This will also remove all sub-categories under it.`)) return;
    try {
      await categoriesAPI.delete(id);
      toast.success("Category deleted");
      await fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  const toggleExpand = (id) => {
    setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleImport = async (parsedData, updateProgress) => {
    let successCount = 0;
    for (let i = 0; i < parsedData.length; i++) {
        const item = parsedData[i];
        try {
            const parentName = item["Parent Name"]?.trim();
            let parentId = null;
            if (parentName) {
                const parentCat = categories.find(c => c.name === parentName);
                if (parentCat) parentId = parentCat._id;
            }
            await categoriesAPI.create({
                name: item["Name"] || "Untitled",
                slug: item["Slug"] || slugify(item["Name"] || "Untitled"),
                emoji: item["Emoji"] || "",
                color: item["Color"] || COLORS[0],
                parent: parentId,
                order: parseInt(item["Order"]) || 0
            });
            successCount++;
        } catch (error) {
            console.error("Failed to import category row:", i, error);
        }
        updateProgress(i + 1);
    }
    if (successCount > 0) fetchCategories();
    if (successCount < parsedData.length) {
        throw new Error(`Imported ${successCount}/${parsedData.length} successfully.`);
    }
  };

  const exportMapping = (cat) => ({
      "Name": cat.name,
      "Slug": cat.slug,
      "Emoji": cat.emoji || "",
      "Color": cat.color || "",
      "Parent Name": cat.parent?.name || (categories.find(c => c._id === cat.parent)?.name) || "",
      "Order": cat.order || 0,
  });

  return (
    <ProtectedRoute adminOnly>
      <AdminLayout>
        <Toaster position="top-right" />
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                <FolderTree className="text-emerald-600" size={28} />
                Category Management
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Add, edit, or remove parent and sub-categories. These power the Navbar, Home page sections, and article filters.
              </p>
            </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <DataExportImport
              title="Categories"
              data={categories}
              exportMapping={exportMapping}
              onImport={handleImport}
              isLoading={loading}
            />
            <button
              onClick={() => openCreateForm()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Plus size={18} /> Add Parent Category
            </button>
          </div>
        </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative"
              >
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
                <h2 className="text-xl font-black text-slate-800 mb-6">
                  {editingId ? "Edit Category" : form.parent ? "Add Sub-Category" : "Add Parent Category"}
                </h2>

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Sugar Industry"
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Slug</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                      placeholder="sugar-industry"
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Parent (only for sub-categories) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Parent Category</label>
                    <select
                      value={form.parent}
                      onChange={(e) => setForm((p) => ({ ...p, parent: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    >
                      <option value="">— None (Parent Category) —</option>
                      {parentCategories.map((p) => (
                        <option key={p._id} value={p._id}>{p.emoji} {p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Emoji + Color (only for parent) */}
                  {!form.parent && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Emoji</label>
                        <div className="flex flex-wrap gap-2">
                          {EMOJIS.map((e) => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => setForm((p) => ({ ...p, emoji: e }))}
                              className={`w-10 h-10 text-xl rounded-lg border-2 flex items-center justify-center transition-all ${form.emoji === e ? "border-emerald-500 bg-emerald-50 scale-110" : "border-slate-200 hover:border-slate-300"}`}
                            >
                              {e}
                            </button>
                          ))}
                          <input
                            type="text"
                            value={form.emoji}
                            onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))}
                            placeholder="Or type"
                            className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-center text-lg"
                            maxLength={2}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Color Gradient</label>
                        <div className="flex flex-wrap gap-2">
                          {COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setForm((p) => ({ ...p, color: c }))}
                              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c} border-2 transition-all ${form.color === c ? "border-slate-800 scale-110 ring-2 ring-offset-2 ring-slate-400" : "border-transparent"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Order */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Display Order</label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
                      className="w-24 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-6 py-3 rounded-lg shadow transition-all disabled:opacity-50">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingId ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Category Tree Display */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-emerald-500" />
            </div>
          ) : tree.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <FolderTree size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-600 mb-2">No categories yet</h3>
              <p className="text-slate-400 text-sm mb-6">Create your first parent category to get started.</p>
              <button onClick={() => openCreateForm()} className="bg-emerald-600 text-white text-sm font-bold px-6 py-3 rounded-xl">
                <Plus size={16} className="inline mr-1" /> Add Category
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tree.map((parent, idx) => {
                const isExpanded = expandedParents[parent._id] !== false;
                return (
                  <div key={parent._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Parent Row */}
                    <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                      <button onClick={() => toggleExpand(parent._id)} className="text-slate-400 hover:text-slate-600">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${parent.color} flex items-center justify-center text-white text-lg shadow-sm`}>
                        {parent.emoji || "📁"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-800">{parent.name}</h3>
                        <p className="text-xs text-slate-400 font-mono">{parent.slug} &middot; {parent.children?.length || 0} sub-categories</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openCreateForm(parent._id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-lg transition-colors"
                        >
                          <Plus size={14} /> Sub-Category
                        </button>
                        <button onClick={() => openEditForm(parent)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(parent._id, parent.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    {isExpanded && parent.children?.length > 0 && (
                      <div className="divide-y divide-slate-50">
                        {parent.children.map((child) => (
                          <div key={child._id} className="flex items-center gap-4 px-6 py-3 pl-16 hover:bg-slate-50 transition-colors">
                            <GripVertical size={14} className="text-slate-300" />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-semibold text-slate-700">{child.name}</span>
                              <span className="text-xs text-slate-400 font-mono ml-3">{child.slug}</span>
                            </div>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">#{child.order}</span>
                            <button
                              onClick={() => openEditForm({ ...child, parent: { _id: parent._id } })}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(child._id, child.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {isExpanded && (!parent.children || parent.children.length === 0) && (
                      <div className="px-6 py-6 pl-16 text-center">
                        <p className="text-sm text-slate-400 mb-2">No sub-categories</p>
                        <button onClick={() => openCreateForm(parent._id)} className="text-xs font-bold text-emerald-600 hover:underline">
                          + Add first sub-category
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
