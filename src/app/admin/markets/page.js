"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { marketsAPI, categoriesAPI } from "@/lib/api";
import { Plus, Trash2, Edit, Loader2, X, Save, TrendingUp } from "lucide-react";
import DataExportImport from "@/components/DataExportImport";
import toast, { Toaster } from "react-hot-toast";

const EMPTY_FORM = {
  id: "",
  state: "",
  commodity: "",
  minPrice: "",
  maxPrice: "",
  avgPrice: "",
  description: "",
  unit: "per quintal",
};

export default function AdminMarkets() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [commodityOptions, setCommodityOptions] = useState([
    "Sugarcane", "Sugar", "Ethanol", "Molasses", "Jaggery",
  ]);

  useEffect(() => {
    fetchMarkets();
    categoriesAPI.getTree().then((res) => {
      const tree = Array.isArray(res.data) ? res.data : [];
      const names = [];
      tree.forEach((p) => {
        if (p?.name) names.push(p.name);
        (p.children || []).forEach((c) => c?.name && names.push(c.name));
      });
      if (names.length) setCommodityOptions(Array.from(new Set(names)));
    }).catch(() => {/* keep fallback */});
  }, []);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const { data } = await marketsAPI.getAll({ limit: 100 });
      setMarkets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setForm({ ...EMPTY_FORM, commodity: commodityOptions[0] || "" });
    setShowForm(true);
  };

  const handleEdit = (m) => {
    setForm({
      id: m._id || m.id,
      state: m.state || "",
      commodity: m.commodity || (commodityOptions[0] || ""),
      minPrice: m.minPrice ?? "",
      maxPrice: m.maxPrice ?? "",
      avgPrice: m.price ?? "",
      description: m.description || "",
      unit: m.unit || "per quintal",
    });
    setShowForm(true);
  };

  // When min/max change, auto-fill average if the admin hasn't already typed
  // something into that field. Once they edit `avgPrice` manually we leave it
  // alone — the manual value wins.
  const [avgTouched, setAvgTouched] = useState(false);
  const handleMinChange = (v) => {
    setForm((f) => {
      const next = { ...f, minPrice: v };
      if (!avgTouched && next.minPrice !== "" && next.maxPrice !== "") {
        const avg = Math.round((Number(next.minPrice) + Number(next.maxPrice)) / 2);
        if (!Number.isNaN(avg)) next.avgPrice = String(avg);
      }
      return next;
    });
  };
  const handleMaxChange = (v) => {
    setForm((f) => {
      const next = { ...f, maxPrice: v };
      if (!avgTouched && next.minPrice !== "" && next.maxPrice !== "") {
        const avg = Math.round((Number(next.minPrice) + Number(next.maxPrice)) / 2);
        if (!Number.isNaN(avg)) next.avgPrice = String(avg);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { id, avgPrice, minPrice, maxPrice, description, ...rest } = form;
      const payload = {
        ...rest,
        price: Number(avgPrice),
        minPrice: minPrice === "" ? undefined : Number(minPrice),
        maxPrice: maxPrice === "" ? undefined : Number(maxPrice),
        description: (description || "").trim(),
      };
      if (
        payload.minPrice != null &&
        payload.maxPrice != null &&
        payload.minPrice > payload.maxPrice
      ) {
        toast.error("Min price can't be greater than Max price");
        setSaving(false);
        return;
      }
      if (id) {
        await marketsAPI.update(id, payload);
        toast.success("Market rate updated");
      } else {
        await marketsAPI.create(payload);
        toast.success("Market rate added");
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setAvgTouched(false);
      fetchMarkets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save market rate");
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (parsedData, updateProgress) => {
    let successCount = 0;
    for (let i = 0; i < parsedData.length; i++) {
      const item = parsedData[i];
      try {
        const avg = Number(item["Average"] || item["Price"] || item.price || 0);
        const min = item["Min"] !== undefined ? Number(item["Min"]) : undefined;
        const max = item["Max"] !== undefined ? Number(item["Max"]) : undefined;
        await marketsAPI.create({
          state: item["State"] || item.state || "Unknown",
          commodity: item["Commodity"] || item.commodity || "Sugarcane",
          price: avg,
          minPrice: min,
          maxPrice: max,
          description: item["Description"] || item.description || "",
          unit: item["Unit"] || item.unit || "per quintal",
        });
        successCount++;
      } catch (error) {
        console.error("Failed to import market row:", i, error);
      }
      updateProgress(i + 1);
    }
    if (successCount > 0) fetchMarkets();
    if (successCount < parsedData.length) {
      throw new Error(`Imported ${successCount}/${parsedData.length} successfully.`);
    }
  };

  const exportMapping = (m) => ({
    "State": m.state,
    "Commodity": m.commodity,
    "Min": m.minPrice ?? "",
    "Average": m.price,
    "Max": m.maxPrice ?? "",
    "Description": m.description || "",
    "Unit": m.unit,
  });

  const handleDelete = async (id) => {
    if (!confirm("Delete this market rate?")) return;
    try {
      await marketsAPI.delete(id);
      setMarkets((prev) => prev.filter((m) => (m._id || m.id) !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const fmt = (n) =>
    n == null || n === "" ? "—" : `₹${Number(n).toLocaleString("en-IN")}`;

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <TrendingUp className="text-green-600" />
            Live State Rates
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage current market prices by state</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <DataExportImport
            title="Markets"
            data={markets}
            exportMapping={exportMapping}
            onImport={handleImport}
            isLoading={loading}
          />
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus size={16} /> Add New Rate
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900 text-lg">
                {form.id ? "Edit State Rate" : "Add State Rate"}
              </h2>
              <button
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setAvgTouched(false); }}
                className="p-1.5 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">State Name</label>
                <input
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Commodity</label>
                <select
                  required
                  value={form.commodity}
                  onChange={(e) => setForm({ ...form, commodity: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                >
                  <option value="" disabled>Select a commodity…</option>
                  {commodityOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minPrice}
                    onChange={(e) => handleMinChange(e.target.value)}
                    placeholder="2200"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Average
                    <span className="text-[10px] text-slate-400 font-medium ml-1 normal-case">{avgTouched ? "(manual)" : "(auto)"}</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.avgPrice}
                    onChange={(e) => { setAvgTouched(true); setForm({ ...form, avgPrice: e.target.value }); }}
                    placeholder="2500"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 font-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.maxPrice}
                    onChange={(e) => handleMaxChange(e.target.value)}
                    placeholder="2800"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Unit</label>
                <input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="per quintal"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Description <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. SAP notified for 2026-27 season; mills paying advance for early crush."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving..." : (form.id ? "Update Rate" : "Save Rate")}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-green-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">State</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">Commodity</th>
                  <th className="text-right px-6 py-4 font-semibold text-slate-600">Min</th>
                  <th className="text-right px-6 py-4 font-semibold text-slate-600">Average</th>
                  <th className="text-right px-6 py-4 font-semibold text-slate-600">Max</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">Unit</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((m) => (
                  <tr key={m._id || m.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-800">{m.state}</td>
                    <td className="px-6 py-4 text-slate-600">{m.commodity}</td>
                    <td className="px-6 py-4 text-right text-red-500 font-semibold">{fmt(m.minPrice)}</td>
                    <td className="px-6 py-4 text-right text-slate-900 font-black">{fmt(m.price)}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-semibold">{fmt(m.maxPrice)}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{m.unit}</td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(m)}
                          title="Edit"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(m._id || m.id)}
                          title="Delete"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {markets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-slate-400">
                      No market rates found. Add your first state rate above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
