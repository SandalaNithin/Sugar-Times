"use client";
import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { magazinesAPI } from "@/lib/api";
import { Plus, Edit, Trash2, Upload, Eye, X, Loader2, Save, FileText, Image as ImageIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import DataExportImport from "@/components/DataExportImport";

export default function AdminMagazines() {
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState(48);
  const [accessType, setAccessType] = useState("free");
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const pdfInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    fetchMagazines();
  }, []);

  const fetchMagazines = async () => {
    setLoading(true);
    try {
      const { data } = await magazinesAPI.getAll();
      setMagazines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load magazines.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setPages(48);
    setAccessType("free");
    setPdfFile(null);
    setCoverFile(null);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleUploadClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !pdfFile || !coverFile) {
      alert("Title, PDF File, and Cover Image are required.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("pages", pages);
      formData.append("accessType", accessType);
      formData.append("file", pdfFile); // Multer expects 'file'
      formData.append("cover", coverFile); // Multer expects 'cover'

      await magazinesAPI.create(formData);
      setShowForm(false);
      resetForm();
      fetchMagazines();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to upload magazine");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this magazine? This will delete the files related to it as well.")) return;
    try {
      await magazinesAPI.delete(id);
      setMagazines((prev) => prev.filter((m) => (m._id || m.id) !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete magazine");
    }
  };

  const handleImport = async (parsedData, updateProgress) => {
    let successCount = 0;
    for (let i = 0; i < parsedData.length; i++) {
        const item = parsedData[i];
        try {
            const formData = new FormData();
            formData.append("title", item["Title"] || "Untitled");
            formData.append("pages", item["Pages"] || 48);
            formData.append("accessType", item["Access Type"]?.toLowerCase() || "free");
            formData.append("fileUrl", item["PDF Link"] || "");
            formData.append("coverImage", item["Cover Link"] || "");

            await magazinesAPI.create(formData);
            successCount++;
        } catch (error) {
            console.error("Failed to import magazine row:", i, error);
        }
        updateProgress(i + 1);
    }
    if (successCount > 0) fetchMagazines();
    if (successCount < parsedData.length) {
        throw new Error(`Imported ${successCount}/${parsedData.length} successfully.`);
    }
  };

  const exportMapping = (mag) => ({
      "Title": mag.title,
      "Pages": mag.pages || 48,
      "Access Type": mag.accessType === "premium" ? "Premium" : "Free",
      "PDF Link": mag.fileUrl || "",
      "Cover Link": mag.coverImage || mag.cover || ""
  });

  const getImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400";
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${url}`;
  };

  const getFileUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${url}`;
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Magazines</h1>
          <p className="text-slate-500 text-sm mt-1">Upload and manage magazine issues ({magazines.length})</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <DataExportImport
            title="Magazines"
            data={magazines}
            exportMapping={exportMapping}
            onImport={handleImport}
            isLoading={loading}
          />
          <button onClick={handleUploadClick} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Upload size={16} /> Upload Issue
          </button>
        </div>
      </div>

      {/* Upload area shortcut */}
      {!showForm && magazines.length === 0 && !loading && (
        <div onClick={handleUploadClick} className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center mb-6 hover:border-green-400 transition-colors cursor-pointer bg-white">
          <Upload size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 mb-1">Upload new magazine issue</p>
          <p className="text-sm text-slate-400">Click to fill details and upload files</p>
        </div>
      )}

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900 text-lg">Upload Magazine Issue</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Magazine Title</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. November 2026 Issue"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Access Type</label>
                  <select value={accessType} onChange={(e) => setAccessType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Page Count</label>
                  <input type="number" min="1" required value={pages} onChange={(e) => setPages(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">PDF File</label>
                <div className="relative">
                  <div className="flex items-center gap-3 w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
                    <FileText size={18} className="text-slate-400" />
                    <input 
                      type="file" 
                      accept=".pdf" 
                      required 
                      ref={pdfInputRef}
                      onChange={(e) => setPdfFile(e.target.files[0])}
                      className="w-full text-sm text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cover Image</label>
                <div className="relative">
                  <div className="flex items-center gap-3 w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
                    <ImageIcon size={18} className="text-slate-400" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      required 
                      ref={coverInputRef}
                      onChange={(e) => setCoverFile(e.target.files[0])}
                      className="w-full text-sm text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? "Uploading..." : "Publish Magazine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={32} className="animate-spin text-green-500" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {magazines.map((mag) => (
            <div key={mag._id || mag.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-sm transition-all group">
              <div className="relative h-56 overflow-hidden">
                <img src={getImageUrl(mag.coverImage || mag.cover)} alt={mag.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 right-2">
                  {mag.accessType === "premium"
                    ? <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Premium</span>
                    : <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Free</span>
                  }
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-1 title={mag.title}">{mag.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{mag.pages || 48} pages · {new Date(mag.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-2">
                  <a href={getFileUrl(mag.fileUrl)} target="_blank" rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 border border-slate-200 rounded-lg hover:border-green-400 hover:text-green-600 transition-colors">
                    <Eye size={14} /> Preview
                  </a>
                  <button onClick={() => handleDelete(mag._id || mag.id)} 
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
