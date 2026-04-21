"use client";
import React, { useState, useEffect, Fragment, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { adminAPI } from "@/lib/api";
import { unwrapList } from "@/lib/unwrapList";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Search, Trash2, ChevronDown, ChevronUp, Check, Filter, X } from "lucide-react";
import DataExportImport from "@/components/DataExportImport";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
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
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/admin/login");
      return;
    }
    if (isAdmin) fetchEnquiries();
    return () => {
      isMountedRef.current = false;
    };
  }, [user, isAdmin, authLoading, debouncedSearch, statusFilter]);

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
  };

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearch,
        status: statusFilter === "all" ? undefined : statusFilter
      };
      const { data } = await adminAPI.getEnquiries(params);

      if (!isMountedRef.current) return;

      setEnquiries(unwrapList(data));
    } catch (err) {
      if (isMountedRef.current) {
        showNotification("Failed to load enquiries", "error");
        console.error(err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this enquiry? This action cannot be undone.")) return;
    try {
      await adminAPI.deleteEnquiry(id);
      setEnquiries((prev) => prev.filter((e) => e._id !== id));
      showNotification("Enquiry deleted successfully");
    } catch (err) {
      showNotification("Failed to delete enquiry", "error");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const { data } = await adminAPI.updateEnquiryStatus(id, newStatus);
      setEnquiries((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status: data.status } : e))
      );
      showNotification(`Enquiry marked as ${newStatus}`);
    } catch (err) {
      showNotification("Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "unread": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "read": return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved": return "bg-slate-800 text-white border-slate-900";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const exportMapping = (enq) => ({
      "Full Name": enq.fullName || "",
      "Email": enq.email || "",
      "Subject": enq.subject || "General Support",
      "Contact No": enq.contactNo || "",
      "Message": enq.commentsOrMessage || "",
      "Status": enq.status || "unread",
      "Submitted On": enq.createdAt ? new Date(enq.createdAt).toISOString().split("T")[0] : ""
  });

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-green-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Search & Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inbox & Enquiries</h1>
          <p className="text-slate-500 text-sm mt-1">Industrial standard contact management and filtering.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DataExportImport
            title="Enquiries"
            data={enquiries}
            exportMapping={exportMapping}
            isLoading={loading}
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search name, email, subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all w-72 shadow-sm font-medium"
              aria-label="Search enquiries"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {["all", "unread", "read", "resolved"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all ${
                  statusFilter === status 
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {notification && (
        <div className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 ${
          notification.type === "error" ? "bg-red-600 text-white" : "bg-slate-900 text-white"
        }`}>
          {notification.type !== "error" && <Check size={18} className="text-emerald-400" />}
          <span className="text-sm font-bold tracking-tight">{notification.msg}</span>
        </div>
      )}

      {/* Main Content Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
             <div className="flex flex-col items-center gap-2">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Updating View...</span>
             </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100 text-slate-400">
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px]">Contact Identity</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px]">Reference</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] w-2/5">Message Digest</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px]">Current Status</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] text-right">Utility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {enquiries.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center text-slate-400 font-medium italic">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <Filter className="text-slate-200" size={32} />
                      </div>
                      <p className="text-sm font-bold text-slate-300 uppercase tracking-widest tracking-tight">Zero enquiries found in this category.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <Fragment key={enq._id}>
                    <tr className={`transition-all duration-300 group ${expandedId === enq._id ? "bg-emerald-50/30 ring-1 ring-inset ring-emerald-100" : "hover:bg-slate-50/50"}`}>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-base leading-tight">{enq.fullName}</span>
                          <span className="text-slate-400 text-[11px] mt-1 font-medium">{enq.email}</span>
                          <div className="mt-2 flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">{enq.subject || "General Support"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">{enq.contactNo || "No Phone"}</span>
                        <div className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-[0.05em]">
                          {new Date(enq.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => setExpandedId(expandedId === enq._id ? null : enq._id)}
                          className="flex flex-col items-start w-full text-left group/msg"
                          aria-expanded={expandedId === enq._id}
                        >
                          <p className={`text-slate-600 leading-relaxed font-medium transition-all ${expandedId === enq._id ? "" : "line-clamp-2"}`}>
                            {enq.commentsOrMessage}
                          </p>
                          <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-1.5 opacity-0 group-hover/msg:opacity-100 transition-all transform translate-y-1 group-hover/msg:translate-y-0">
                            {expandedId === enq._id ? "Click to condense" : "Inspect full transcript"}
                            {expandedId === enq._id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </span>
                        </button>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="relative inline-block w-36">
                          {updatingId === enq._id ? (
                            <div className="flex items-center gap-2 text-emerald-600 font-bold px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                              <Loader2 size={14} className="animate-spin" />
                              <span className="text-[9px] uppercase tracking-[0.2em]">Syncing</span>
                            </div>
                          ) : (
                            <div className="relative group/select">
                              <select
                                value={enq.status || "unread"}
                                onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                                className={`w-full appearance-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border-2 cursor-pointer outline-none transition-all shadow-sm ${getStatusStyles(enq.status || "unread")}`}
                                aria-label={`Update status for ${enq.fullName}`}
                              >
                                <option value="unread">● Unread</option>
                                <option value="read">● Read</option>
                                <option value="resolved">● Resolved</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-50" size={14} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => handleDelete(enq._id)}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                          title="Purge record"
                          aria-label="Delete permanent"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                    {expandedId === enq._id && (
                      <tr className="bg-emerald-50/20">
                        <td colSpan={5} className="px-8 pb-8 pt-0">
                          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-50/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                               <span className="p-1 bg-emerald-100 rounded">📝</span> Detailed Submission Transcript
                            </h4>
                            <p className="text-slate-800 leading-relaxed font-semibold whitespace-pre-wrap text-[15px]">
                              {enq.commentsOrMessage}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
