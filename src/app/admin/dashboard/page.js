"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { adminAPI, articlesAPI } from "@/lib/api";
import { unwrapList } from "@/lib/unwrapList";
import {
  Users,
  CreditCard,
  FileText,
  BookOpen,
  TrendingUp,
  Loader2,
  Edit,
  Trash2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/admin/login");
      return;
    }
    if (isAdmin) fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [user, isAdmin, authLoading, router]);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, usersRes, articlesRes, revenueRes, paymentsRes] =
        await Promise.allSettled([
          adminAPI.getStats(),
          adminAPI.getUsers({ limit: 5 }),
          articlesAPI.getAll({ limit: 5 }),
          adminAPI.getMonthlyRevenue(),
          adminAPI.getPayments({ limit: 10 }),
        ]);

      if (!isMountedRef.current) return;

      setStats(
        statsRes.status === "fulfilled" ? statsRes.value.data : null
      );
      setUsers(usersRes.status === "fulfilled" ? unwrapList(usersRes.value.data) : []);
      setArticles(
        articlesRes.status === "fulfilled"
          ? unwrapList(articlesRes.value.data)
          : []
      );
      setRevenueData(
        revenueRes.status === "fulfilled" ? revenueRes.value.data : []
      );
      setLoading(false);
    } catch (err) {
      if (isMountedRef.current) {
        setStats(null);
        setArticles([]);
        setLoading(false);
      }
    }
  }, []);

  const handleDeleteArticle = async (id) => {
    setDeleting(true);
    try {
      await articlesAPI.delete(id);
      setArticles((prev) => prev.filter((a) => (a._id || a.id) !== id));
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete article:", err);
      alert("Failed to delete article. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-green-500" />
        </div>
      </AdminLayout>
    );
  }

  const s = stats || {};
  const totalRevenueRupees = (s.totalRevenue || s.revenue || 0) / 100;

  const formatRevenue = (val) => {
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString("en-IN");
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time overview of Sugartimes platform performance
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {[
          {
            label: "Total Users",
            value: s.totalUsers?.toLocaleString() || "0",
            icon: Users,
            color: "text-blue-600 bg-blue-50",
            border: "border-blue-100"
          },
          {
            label: "Active Subs",
            value: s.activeSubscriptions?.toLocaleString() || "0",
            icon: CreditCard,
            color: "text-emerald-600 bg-emerald-50",
            border: "border-emerald-100"
          },
          {
            label: "Revenue",
            value: `₹${formatRevenue(totalRevenueRupees)}`,
            icon: TrendingUp,
            color: "text-violet-600 bg-violet-50",
            border: "border-violet-100"
          },
          {
            label: "Articles",
            value: s.totalArticles || s.articlesPublished || "0",
            icon: FileText,
            color: "text-orange-600 bg-orange-50",
            border: "border-orange-100"
          },
          {
            label: "Magazines",
            value: s.totalMagazines || s.magazinesUploaded || "0",
            icon: BookOpen,
            color: "text-pink-600 bg-pink-50",
            border: "border-pink-100"
          },
        ].map(({ label, value, icon: Icon, color, border }) => (
          <div
            key={label}
            className={`bg-white rounded-2xl border ${border} p-5 transition-all hover:shadow-lg hover:scale-105 duration-300 cursor-default`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}
            >
              <Icon size={20} />
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-slate-900 text-lg">Monthly Revenue (₹)</h2>
            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              ₹ {formatRevenue(totalRevenueRupees)} Total
            </div>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickFormatter={(v) =>
                    v === 0
                      ? "0"
                      : v >= 100000
                        ? `${(v / 100000).toFixed(0)}L`
                        : v >= 1000
                          ? `${(v / 1000).toFixed(0)}K`
                          : v.toString()
                  }
                />
                <Tooltip
                  formatter={(v) => [
                    `₹ ${Number(v).toLocaleString("en-IN")}`,
                    "Revenue",
                  ]}
                  contentStyle={{ borderRadius: "12px", fontSize: "13px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
              No revenue data available yet
            </div>
          )}
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-900 text-lg">Recent Users</h2>
            <button
              onClick={() => router.push("/admin/users")}
              className="text-xs text-emerald-600 font-black hover:underline uppercase tracking-wide"
            >
              View All →
            </button>
          </div>
          {users.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No users yet
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u._id} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700 border border-emerald-200 shrink-0">
                    {u.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full whitespace-nowrap ${u.role === "admin" ? "bg-red-100 text-red-700 border border-red-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}
                  >
                    {u.role === "admin" ? "Admin" : "User"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent articles */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-slate-900 text-lg">Recent Articles</h2>
          <button
            onClick={() => router.push("/admin/articles")}
            className="text-xs text-emerald-600 font-black hover:underline uppercase tracking-wide"
          >
            Manage →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-black text-slate-600 text-[11px] uppercase tracking-wide">
                  Title
                </th>
                <th className="text-left px-4 py-3 font-black text-slate-600 text-[11px] uppercase tracking-wide">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-black text-slate-600 text-[11px] uppercase tracking-wide">
                  Access
                </th>
                <th className="text-left px-4 py-3 font-black text-slate-600 text-[11px] uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {articles.map((a) => {
                const articleId = a._id || a.id;
                return (
                  <tr
                    key={articleId}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          router.push(
                            a._id
                              ? `/article/${a._id}`
                              : `/article/${a.id}`
                          )
                        }
                        className="font-semibold text-slate-800 hover:text-emerald-700 hover:underline text-left max-w-xs truncate block transition-colors"
                        title={a.title}
                      >
                        {a.title}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                        {a.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${a.premium || a.accessType === "premium" ? "bg-slate-900 text-amber-400 border-slate-800" : "bg-slate-100 text-slate-600 border-slate-200"}`}
                      >
                        {a.premium || a.accessType === "premium"
                          ? "Premium"
                          : "Free"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            router.push(
                              a._id
                                ? `/article/${a._id}`
                                : `/article/${a.id}`
                            )
                          }
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="View Article"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/admin/articles?edit=${articleId}`)
                          }
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                          title="Edit Article"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(articleId)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Delete Article"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Article Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                Delete Article?
              </h3>
              <p className="text-sm text-slate-500">
                This will permanently remove this article. This action cannot be
                undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteArticle(deleteId)}
                disabled={deleting}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
