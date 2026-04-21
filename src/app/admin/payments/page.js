"use client";
import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminAPI } from "@/lib/api";
import { unwrapList } from "@/lib/unwrapList";
import { CheckCircle2, Clock, XCircle, Loader2, AlertCircle, RefreshCw, Search, ArrowRight, X, Filter, IndianRupee } from "lucide-react";
import DataExportImport from "@/components/DataExportImport";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
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
  }, [debouncedSearch, status]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        search: debouncedSearch,
        status: status || undefined,
      };
      
      const [payRes, statsRes] = await Promise.all([
        adminAPI.getPayments(params),
        adminAPI.getStats()
      ]);
      
      if (!isMountedRef.current) return;

      setPayments(unwrapList(payRes.data));
      setStats(statsRes.data);
    } catch (err) {
      if (isMountedRef.current) {
        setError("Failed to sync financial data. Please try again.");
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
  };

  const exportMapping = (p) => ({
      "Transaction ID": p.razorpayPaymentId || "OFFLINE_REFERENCE",
      "Order ID": p.razorpayOrderId || "",
      "User Name": p.userId?.name || "Anonymous Guest",
      "User Email": p.userId?.email || "No email",
      "Amount": (p.amount / 100).toLocaleString() || "0",
      "Status": p.status || "",
      "Date": p.createdAt ? formatDate(p.createdAt) : "",
      "Time": p.createdAt ? formatTime(p.createdAt) : "",
      "Failure Reason": p.failureReason || "",
      "System ID": p._id || ""
  });

  const getStatusDisplay = (status) => {
    switch (status) {
      case "success":
        return { icon: <CheckCircle2 size={12} />, text: "Success", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" };
      case "pending":
        return { icon: <Clock size={12} />, text: "Pending", cls: "bg-amber-100 text-amber-700 border-amber-200" };
      case "failed":
        return { icon: <XCircle size={12} />, text: "Failed", cls: "bg-red-100 text-red-700 border-red-200" };
      default:
        return { icon: <AlertCircle size={12} />, text: status, cls: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time transaction monitoring and revenue reconciliation.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <DataExportImport
            title="Payments"
            data={payments}
            exportMapping={exportMapping}
            isLoading={loading}
          />
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Total Amount", value: `₹${((stats?.totalLedgerAmount || 0) / 100).toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Successful Txns", value: stats?.successfulTxns || 0, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          { label: "Pending", value: stats?.pendingTxns || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
          { label: "Failed", value: stats?.failedTxns || 0, icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl border ${item.bg} ${item.border} p-6 flex items-center gap-4`}>
             <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center shadow-inner">
                <item.icon size={24} className={item.color} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</p>
                <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        {/* Advanced Filter Bar */}
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative col-span-1 lg:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search by Payment ID, Order ID or User name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
              />
            </div>
            
            <div className="flex flex-wrap gap-3 col-span-1 lg:col-span-2">
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              {(searchTerm || status) && (
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-50 transition-all border border-red-100"
                >
                  <X size={14} /> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 size={40} className="animate-spin text-emerald-500" />
            <p className="font-bold text-sm uppercase tracking-widest">Auditing Ledger...</p>
          </div>
        ) : error ? (
          <div className="py-24 flex flex-col items-center justify-center text-red-500 gap-3">
            <AlertCircle size={40} />
            <p className="font-bold">{error}</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-32 text-center text-slate-400">
             <Filter size={48} className="mx-auto mb-4 opacity-20" />
             <h3 className="font-black text-slate-900">No Transactions Match</h3>
             <p className="text-sm">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4">Transaction Details</th>
                  <th className="px-6 py-4">Payer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">System ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.map((p) => {
                  const status = getStatusDisplay(p.status);
                  return (
                    <tr key={p._id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${status.cls} border`}>
                              {status.icon}
                           </div>
                           <div className="flex-1">
                              <p className="text-xs font-black text-slate-900 uppercase">{p.status}</p>
                              <span className="text-[10px] font-bold text-slate-400 underline decoration-slate-200">
                               {p.razorpayPaymentId ? (
                                  <a href={`https://dashboard.razorpay.com/app/payments/${p.razorpayPaymentId}`} target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">
                                     {p.razorpayPaymentId}
                                  </a>
                               ) : "OFFLINE REFERENCE"}
                              </span>
                              {p.status === 'failed' && p.failureReason && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-[9px] font-bold text-red-700 leading-tight">
                                    <span className="font-black">Reason:</span> {p.failureReason}
                                  </p>
                                  {p.failureCode && (
                                    <p className="text-[8px] text-red-600 mt-1">
                                      Code: <code>{p.failureCode}</code>
                                    </p>
                                  )}
                                </div>
                              )}
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-800">{p.userId?.name || "Anonymous Guest"}</p>
                        <p className="text-[10px] font-medium text-slate-400">{p.userId?.email || "No email"}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-black text-slate-900">₹{(p.amount / 100).toLocaleString()}</div>
                        <p className="text-[9px] font-bold text-emerald-600 uppercase">INR · Verified</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-slate-600">{formatDate(p.createdAt)}</p>
                        <p className="text-[10px] font-medium text-slate-400">{formatTime(p.createdAt)}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${status.cls}`}>
                           {status.text}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="group/code flex items-center gap-2">
                           <code className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 overflow-hidden max-w-[80px] truncate">
                              {p._id}
                           </code>
                           <ArrowRight size={12} className="text-slate-300 opacity-0 group-hover/code:opacity-100 transition-opacity" />
                         </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
