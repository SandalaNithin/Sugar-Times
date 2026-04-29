"use client";
import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminAPI } from "@/lib/api";
import { unwrapList } from "@/lib/unwrapList";
import { Search, Plus, Edit, Trash2, Loader2, RefreshCw, AlertCircle, X, CheckCircle2 } from "lucide-react";
import DataExportImport from "@/components/DataExportImport";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState(null);

  // Modals
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const [formData, setFormData] = useState({
    name: "", email: "", role: "user",
    // Subscription fields
    plan: "1year", subscriptionType: "digital", startDate: "", endDate: "", status: "active",
    subscriberName: "", designation: "", organisation: "", address: "", district: "", state: "", pincode: "", mobile: "", dateOfBirth: "",
    paymentMode: "", chequeTransactionNo: "", dateOfPayment: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    fetchUsers();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminAPI.getUsers({ limit: 50 }),
        adminAPI.getStats()
      ]);

      if (!isMountedRef.current) return;

      setUsers(unwrapList(usersRes.data));
      setStats(statsRes.data);
    } catch (err) {
      if (isMountedRef.current) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );


  const openEditModal = async (user) => {
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");

    // Default form with user basics
    let initialData = {
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      plan: "1year", subscriptionType: "digital", startDate: "", endDate: "", status: "active",
      subscriberName: user.name || "", designation: "", organisation: "", address: "", district: "", state: "", pincode: "", mobile: user.mobile || "", dateOfBirth: "",
      paymentMode: "", chequeTransactionNo: "", dateOfPayment: ""
    };

    try {
      const res = await adminAPI.getUserSubscription(user._id);
      if (res.data) {
        const sub = res.data;
        initialData = {
          ...initialData,
          plan: sub.plan || "1year",
          subscriptionType: sub.subscriptionType || "digital",
          startDate: sub.startDate ? new Date(sub.startDate).toISOString().split('T')[0] : "",
          endDate: sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : "",
          status: sub.status || "active",
          subscriberName: sub.subscriberName || user.name,
          designation: sub.designation || "",
          organisation: sub.organisation || "",
          address: sub.address || "",
          district: sub.district || "",
          state: sub.state || "",
          pincode: sub.pincode || "",
          mobile: sub.mobile || user.mobile || "",
          dateOfBirth: sub.dateOfBirth || "",
          paymentMode: sub.paymentMode || "",
          chequeTransactionNo: sub.chequeTransactionNo || "",
          dateOfPayment: sub.dateOfPayment || ""
        };
      }
    } catch (err) {
      console.error("Failed to fetch user subscription details", err);
    } finally {
      setFormData(initialData);
      setEditModal(user);
      setFormLoading(false);
    }
  };


  const handleEditUser = async () => {
    setFormError("");
    setFormSuccess("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and email are required");
      return;
    }

    setFormLoading(true);
    try {
      await adminAPI.updateUser(editModal._id, formData);
      setFormSuccess("User updated successfully!");
      setEditModal(null);
      setTimeout(() => fetchUsers(), 500);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to update user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setFormError("");
    setFormLoading(true);
    try {
      await adminAPI.deleteUser(deleteModal._id);
      setFormSuccess("User deleted successfully!");
      setDeleteModal(null);
      setTimeout(() => fetchUsers(), 500);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleImport = async (parsedData, updateProgress) => {
    let successCount = 0;
    for (let i = 0; i < parsedData.length; i++) {
      const item = parsedData[i];
      try {
        await adminAPI.createUser({
          name: item["Name"] || "Unknown User",
          email: item["Email"] || "",
          role: item["Role"]?.toLowerCase() === "admin" ? "admin" : "user",
        });
        successCount++;
      } catch (error) {
        console.error("Failed to import user row:", i, error);
      }
      updateProgress(i + 1);
    }
    if (successCount > 0) fetchUsers();
    if (successCount < parsedData.length) {
      throw new Error(`Imported ${successCount}/${parsedData.length} successfully.`);
    }
  };

  const exportMapping = (u) => ({
    "Name": u.name || "",
    "Email": u.email || "",
    "Role": u.role === "admin" ? "Admin" : "User",
    "Joined On": u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : ""
  });

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Industrial standard user administration and control</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <DataExportImport
            title="Users"
            data={users}
            exportMapping={exportMapping}
            onImport={handleImport}
            isLoading={loading}
          />
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Total Platform Users", value: stats?.totalUsers || 0, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
          { label: "Admin Accounts", value: users.filter(u => u.role === "admin").length || 0, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Regular Users", value: users.filter(u => u.role !== "admin").length || 0, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl border ${item.bg} ${item.border} p-6 transition-transform hover:scale-[1.02] duration-300`}>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
            <p className={`text-3xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-emerald-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-3 font-black text-slate-600 uppercase text-[11px] tracking-wider">User</th>
                  <th className="text-left px-6 py-3 font-black text-slate-600 uppercase text-[11px] tracking-wider">Role</th>
                  <th className="text-left px-6 py-3 font-black text-slate-600 uppercase text-[11px] tracking-wider">Joined</th>
                  <th className="text-right px-6 py-3 font-black text-slate-600 uppercase text-[11px] tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center text-xs font-black text-emerald-700 border border-emerald-200">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{user.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full border ${user.role === "admin" ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {user.role === "admin" && <CheckCircle2 size={12} />}
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteModal(user)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                          title="Delete User"
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
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-900">Edit User & Subscription</h3>
                <p className="text-sm text-slate-500 mt-0.5">Full profile and membership management</p>
              </div>
              <button
                onClick={() => setEditModal(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto max-h-[70vh] space-y-8">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700">{formSuccess}</p>
                </div>
              )}

              {/* SECTION: Account Basics */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 border-b border-emerald-50 pb-2">Account Basics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wide">Full Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wide">Email Address *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wide">Access Role</label>
                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-bold">
                      <option value="user">Subscriber (Regular User)</option>
                      <option value="admin">Platform Administrator</option>
                    </select>
                  </div>
                  {editModal && (
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wide">Membership Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-xl focus:ring-2 outline-none text-sm font-bold ${formData.status === 'active' ? 'border-emerald-200 bg-emerald-50/30 text-emerald-700' : 'border-red-200 bg-red-50/30 text-red-700'}`}>
                        <option value="active">🟢 Active</option>
                        <option value="expired">🔴 Expired</option>
                        <option value="pending">🟡 Pending</option>
                        <option value="cancelled">⚫ Cancelled</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: Subscription Details (Only if editing or explicitly adding sub info) */}
              {editModal && (
                <>
                  <div className="space-y-4 pt-2">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 border-b border-emerald-50 pb-2">Subscription Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wide">Chosen Plan</label>
                        <select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold">
                          <option value="1year">1 Year</option>
                          <option value="2year">2 Year</option>
                          <option value="3year">3 Year</option>
                          <option value="life">Life Membership</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wide">Type</label>
                        <select value={formData.subscriptionType} onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold">
                          <option value="digital">Digital Only</option>
                          <option value="print">Print + Digital</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wide">Expiry Date</label>
                        <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Subscriber Address & Bio</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wide">Organisation / Company</label>
                        <input type="text" value={formData.organisation} onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wide">Full Mailing Address</label>
                        <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold resize-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wide">District</label>
                        <input type="text" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wide">State</label>
                        <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wide">Mobile / WhatsApp</label>
                        <input type="text" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wide">Designation</label>
                        <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
              <button
                onClick={() => { setEditModal(null); setFormError(""); setFormSuccess(""); }}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                disabled={formLoading}
                className="px-6 py-2.5 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
              >
                {formLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Save All Changes
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
              <h3 className="text-lg font-black text-slate-900 mb-2">Delete User?</h3>
              <p className="text-sm text-slate-500 mb-2">
                Are you sure you want to permanently delete{" "}
                <span className="font-black text-slate-700">{deleteModal.name}</span>?
              </p>
              <p className="text-xs text-slate-400">This action cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModal(null);
                  setFormError("");
                }}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={formLoading}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2"
              >
                {formLoading && <Loader2 size={14} className="animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
