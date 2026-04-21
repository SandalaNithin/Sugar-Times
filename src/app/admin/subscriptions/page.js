"use client";
import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminAPI, subscriptionsAPI } from "@/lib/api";
import DataExportImport from "@/components/DataExportImport";
import { unwrapList } from "@/lib/unwrapList";
import { Edit, Trash2, RefreshCw, Loader2, AlertCircle, CheckCircle2, Clock, XCircle, Search, Filter, X } from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("");

  // Edit Modal State
  const [editModal, setEditModal] = useState(null);
  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const isMountedRef = useRef(true);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();
    return () => {
      isMountedRef.current = false;
    };
  }, [debouncedSearch, status, plan, subscriptionType]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        search: debouncedSearch,
        status: status || undefined,
        plan: plan || undefined,
        subscriptionType: subscriptionType || undefined,
        _t: Date.now()
      };

      const [subRes, statsRes] = await Promise.all([
        adminAPI.getSubscriptions(params),
        adminAPI.getStats()
      ]);

      if (!isMountedRef.current) return;

      setSubscriptions(unwrapList(subRes.data));
      setStats(statsRes.data);
    } catch (err) {
      if (isMountedRef.current) {
        setError("Failed to fetch subscriptions. Please try again.");
        console.error(err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatus("");
    setPlan("");
    setSubscriptionType("");
  };

  const formatPrice = (plan) => {
    const prices = { "1year": "₹350", "2year": "₹650", "3year": "₹900", "life": "₹5000" };
    return prices[plan] || "—";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700 border-green-200";
      case "expired": return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  // Edit handlers
  const openEdit = (sub) => {
    setEditData({
      subscriberName: sub.subscriberName || sub.userId?.name || "",
      email: sub.email || sub.userId?.email || "",
      mobile: sub.mobile || "",
      plan: sub.plan || "",
      subscriptionType: sub.subscriptionType || "",
      status: sub.status || "",
      startDate: formatDateInput(sub.startDate),
      endDate: formatDateInput(sub.endDate),
    });
    setEditModal(sub);
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      await adminAPI.updateSubscription(editModal._id, editData);
      setEditModal(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update subscription. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleImport = async (parsedData, updateProgress) => {
    let successCount = 0;
    for (let i = 0; i < parsedData.length; i++) {
        const item = parsedData[i];
        try {
            await subscriptionsAPI.create({
                subscriberName: item["Name"] || "",
                email: item["Email"] || "",
                mobile: item["Mobile"] || "",
                plan: item["Plan"] || "1year",
                subscriptionType: item["Type"]?.toLowerCase() || "digital",
                status: item["Status"]?.toLowerCase() || "active",
                startDate: item["Start Date"] || "",
                endDate: item["End Date"] || "",
            });
            successCount++;
        } catch (error) {
            console.error("Failed to import subscription row:", i, error);
        }
        updateProgress(i + 1);
    }
    if (successCount > 0) fetchData();
    if (successCount < parsedData.length) {
        throw new Error(`Imported ${successCount}/${parsedData.length} successfully.`);
    }
  };

  const exportMapping = (sub) => ({
      "Name": sub.subscriberName || sub.userId?.name || "",
      "Email": sub.email || sub.userId?.email || "",
      "Mobile": sub.mobile || "",
      "Plan": sub.plan || "",
      "Type": sub.subscriptionType || "",
      "Start Date": formatDateInput(sub.startDate) || "",
      "End Date": formatDateInput(sub.endDate) || "",
      "Status": sub.status || ""
  });

  // Delete handlers
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await adminAPI.deleteSubscription(deleteModal._id);
      setDeleteModal(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete subscription. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Subscription Management</h1>
          <p className="text-slate-500 text-sm mt-1">Industrial standard filtering for active and offline database.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <DataExportImport
            title="Subscriptions"
            data={subscriptions}
            exportMapping={exportMapping}
            onImport={handleImport}
            isLoading={loading}
          />
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync
          </button>
        </div>
      </div>

      {/* Quick Stats Overlay */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Active Subscribers", value: stats?.activeSubscriptions || 0, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Total Revenue", value: stats?.totalRevenue ? `₹${(stats.totalRevenue / 100).toLocaleString('en-IN')}` : "₹0", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
          { label: "Offline Pending", value: "0", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl border ${item.bg} ${item.border} p-6 transition-transform hover:scale-[1.02] duration-300`}>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
            <p className={`text-3xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        {/* Advanced Filter Bar */}
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative col-span-1 lg:col-span-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search name, email, mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="flex flex-wrap gap-3 col-span-1 lg:col-span-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Status: All</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Plan: All</option>
                <option value="1year">1 Year</option>
                <option value="2year">2 Year</option>
                <option value="3year">3 Year</option>
                <option value="life">Life Time</option>
              </select>

              <select
                value={subscriptionType}
                onChange={(e) => setSubscriptionType(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Type: All</option>
                <option value="digital">Digital</option>
                <option value="print">Print</option>
              </select>

              {(searchTerm || status || plan || subscriptionType) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-50 transition-all border border-red-100"
                >
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </div>
        </div>




        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 size={40} className="animate-spin text-emerald-500" />
            <p className="font-bold text-sm tracking-widest uppercase">Filtering Metadata...</p>
          </div>
        ) : error ? (
          <div className="py-24 flex flex-col items-center justify-center text-red-500 gap-3">
            <AlertCircle size={40} />
            <p className="font-bold">{error}</p>
            <button onClick={fetchData} className="text-sm underline font-bold mt-2">Try Again</button>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-3 text-center px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
              <Filter size={32} />
            </div>
            <h3 className="text-slate-900 font-black tracking-tight">No Matching Subscribers</h3>
            <p className="text-sm max-w-xs">Adjust your search or filter categories to find more results.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4">Subscriber</th>
                  <th className="px-6 py-4">Plan Category</th>
                  <th className="px-6 py-4">Timeline</th>
                  <th className="px-6 py-4">Gateway Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subscriptions.map((sub) => (
                  <tr key={sub._id} className="group hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-black text-slate-900 text-sm leading-tight">{sub.subscriberName || sub.userId?.name || "Unknown Business"}</p>
                      <p className="text-xs text-slate-400 mt-1 font-medium italic">{sub.email || sub.userId?.email}</p>
                      {sub.mobile && <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1.5 underline decoration-emerald-200 decoration-2">📞 {sub.mobile}</p>}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white uppercase tracking-tighter">
                          {sub.plan}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 border rounded-md ${sub.subscriptionType === 'print' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>
                          {sub.subscriptionType}
                        </span>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Est. Value: {formatPrice(sub.plan)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5 shadow-sm bg-white/50 p-2 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-300" />
                          Starts: {formatDate(sub.startDate)}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-300" />
                          Expiry: {sub.endDate ? formatDate(sub.endDate) : "Perpetual"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 flex flex-col gap-1.5 max-w-[180px]">
                        <span className="text-[8px] font-black uppercase text-slate-400 leading-none tracking-[0.2em]">Transaction Reference</span>
                        <code className="text-[10px] font-bold text-slate-700 truncate block">
                          {sub.paymentId || "OFFLINE_DIRECT"}
                        </code>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={`w-2 h-2 rounded-full ${sub.paymentMode === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">
                            {sub.paymentMode || "Legacy"} Gateway
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusColor(sub.status)} shadow-sm`}>
                        {sub.status === 'active' && <CheckCircle2 size={12} />}
                        {sub.status === 'expired' && <XCircle size={12} />}
                        {sub.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(sub)}
                          className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100"
                          title="Edit Subscription"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteModal(sub)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                          title="Delete Subscription"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Edit Subscription</h3>
              <p className="text-sm text-slate-500 mt-0.5">Update subscriber details and plan information</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wide">Subscriber Name</label>
                <input
                  type="text"
                  value={editData.subscriberName}
                  onChange={(e) => setEditData({ ...editData, subscriberName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wide">Email</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wide">Mobile</label>
                  <input
                    type="tel"
                    value={editData.mobile}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "");
                      if (digitsOnly.length <= 10) setEditData({ ...editData, mobile: digitsOnly });
                    }}
                    maxLength={10}
                    inputMode="numeric"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wide">Plan</label>
                  <select
                    value={editData.plan}
                    onChange={(e) => setEditData({ ...editData, plan: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
                  >
                    <option value="1year">1 Year</option>
                    <option value="2year">2 Year</option>
                    <option value="3year">3 Year</option>
                    <option value="life">Life Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wide">Type</label>
                  <select
                    value={editData.subscriptionType}
                    onChange={(e) => setEditData({ ...editData, subscriptionType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
                  >
                    <option value="digital">Digital</option>
                    <option value="print">Print</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wide">Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wide">Start Date</label>
                  <input
                    type="date"
                    value={editData.startDate}
                    onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wide">End Date</label>
                  <input
                    type="date"
                    value={editData.endDate}
                    onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setEditModal(null)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2"
              >
                {editLoading && <Loader2 size={14} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Delete Subscription?</h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to delete the subscription for{" "}
                <span className="font-bold text-slate-700">{deleteModal.subscriberName || deleteModal.userId?.name || "this user"}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2"
              >
                {deleteLoading && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
