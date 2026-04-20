"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { articlesAPI, magazinesAPI } from "@/lib/api";
import {
  Download, Bookmark, User, LogOut, Star, Calendar, Loader2,
  Edit3, Save, X, MapPin, Building, Map, Hash, Phone, Mail, CreditCard,
  BookOpen, Eye, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { unwrapList } from "@/lib/unwrapList";
import toast, { Toaster } from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function imgUrl(url) {
  if (!url) return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

const PLAN_LABELS = {
  "1year": "1 Year", "2year": "2 Years", "3year": "3 Years",
  "life": "Lifetime", "monthly": "Monthly", "yearly": "Yearly",
};

export default function DashboardPage() {
  const { user, subscription, loading: authLoading, logout, fetchSubscription, updateLocalUser } = useAuth();
  const [articles, setArticles] = useState([]);
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flipbook, setFlipbook] = useState(null);
  const [editForm, setEditForm] = useState({
    subscriberName: "", address: "", district: "", state: "", pincode: "", mobile: "", email: "",
  });
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) fetchData();
  }, [user, authLoading]);

  useEffect(() => {
    if (subscription) {
      setEditForm({
        subscriberName: subscription.subscriberName || user?.name || "",
        address: subscription.address || "",
        district: subscription.district || "",
        state: subscription.state || "",
        pincode: subscription.pincode || "",
        mobile: subscription.mobile || "",
        email: subscription.email || "",
      });
    }
  }, [subscription]);

  const fetchData = async () => {
    try {
      const [artRes, magRes] = await Promise.allSettled([
        articlesAPI.getAll({ limit: 5 }),
        magazinesAPI.getAll(),
      ]);
      setArticles(artRes.status === "fulfilled" ? unwrapList(artRes.value.data).slice(0, 5) : []);
      setMagazines(magRes.status === "fulfilled" ? unwrapList(magRes.value.data).slice(0, 4) : []);
    } catch {
      setArticles([]);
      setMagazines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!subscription?._id) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/subscriptions/${subscription._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        throw new Error("Server error - did you deploy the backend update?");
      }

      toast.success("Profile updated!");
      setEditing(false);
      
      // Instantly synchronize the top-level User Profile name in the UI
      if (editForm.subscriberName && editForm.subscriberName !== user?.name) {
        updateLocalUser({ name: editForm.subscriberName });
      }

      if (user?.id || user?._id) await fetchSubscription(user.id || user._id);
    } catch (err) {
      toast.error("Failed to update profile: " + (err.message || ""));
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { logout(); router.push("/"); };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-green-500" /></div>;
  }

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  };

  const daysLeft = subscription?.endDate
    ? Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image src="/sugar times main logo.png" alt="Sugar Times" width={160} height={56} className="h-12 w-auto object-contain" />
          </Link>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Dashboard</h1>
            <p className="text-slate-500 text-sm">Welcome back, {user?.name}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition-colors">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <User size={24} className="text-green-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{user?.name}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            {/* Subscription Summary */}
            {subscription ? (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-green-600" />
                    <span className="font-bold text-slate-900">{PLAN_LABELS[subscription.plan] || subscription.plan} Plan</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    daysLeft > 30 ? "bg-green-100 text-green-700" :
                    daysLeft > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  }`}>
                    {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <CreditCard size={12} className="text-green-600" />
                    {subscription.subscriptionType === "print" ? "Print" : "Digital"}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Calendar size={12} className="text-green-600" />
                    {formatDate(subscription.endDate)}
                  </div>
                </div>
                <Link href="/renewal" className="block text-center text-xs font-bold bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors">
                  Renew Subscription
                </Link>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-sm text-slate-500 mb-3">No active subscription</p>
                <Link href="/subscription" className="block text-center text-xs font-bold bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600">
                  Upgrade to Premium
                </Link>
              </div>
            )}
          </div>

          {/* Subscription Details with Edit */}
          {subscription && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <CreditCard size={14} className="text-green-600" /> Subscription Details
                </h3>
                <button onClick={() => setEditing(!editing)} className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700">
                  {editing ? <><X size={12} /> Cancel</> : <><Edit3 size={12} /> Edit</>}
                </button>
              </div>

              {editing ? (
                <div className="p-5 space-y-4">
                  {[
                    { key: "subscriberName", label: "Name", icon: User },
                    { key: "address", label: "Address", icon: MapPin, type: "textarea" },
                    { key: "district", label: "District", icon: Building },
                    { key: "state", label: "State", icon: Map },
                    { key: "pincode", label: "Pincode", icon: Hash },
                    { key: "mobile", label: "Mobile", icon: Phone },
                    { key: "email", label: "Email", icon: Mail },
                  ].map(({ key, label, icon: Icon, type }) => (
                    <div key={key}>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        <Icon size={12} className="text-green-600" /> {label}
                      </label>
                      {type === "textarea" ? (
                        <textarea value={editForm[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} rows={2}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none" />
                      ) : (
                        <input type="text" value={editForm[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none" />
                      )}
                    </div>
                  ))}
                  <button onClick={handleSaveProfile} disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-bold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {[
                    { icon: CreditCard, label: "Member No.", value: subscription._id },
                    { icon: User, label: "Name", value: subscription.subscriberName || user?.name },
                    { icon: Star, label: "Plan", value: PLAN_LABELS[subscription.plan] || subscription.plan },
                    { icon: CreditCard, label: "Type", value: subscription.subscriptionType === "print" ? "Print / Courier" : "Digital" },
                    { icon: Calendar, label: "Start Date", value: formatDate(subscription.startDate) },
                    { icon: Calendar, label: "Expires", value: formatDate(subscription.endDate) },
                    { icon: MapPin, label: "Address", value: subscription.address },
                    { icon: Building, label: "District", value: subscription.district },
                    { icon: Map, label: "State", value: subscription.state },
                    { icon: Hash, label: "Pincode", value: subscription.pincode },
                    { icon: Phone, label: "Mobile", value: subscription.mobile },
                    { icon: Mail, label: "Email", value: subscription.email },
                  ].filter((f) => f.value).map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 px-5 py-3">
                      <Icon size={14} className="text-green-600 mt-0.5 shrink-0" />
                      <div className="w-24 shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-700 break-all">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Articles */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Bookmark size={16} className="text-green-600" /> Recent Articles
              </h3>
              <Link href="/news" className="text-xs text-green-600 font-bold hover:underline flex items-center gap-1">
                View All <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {articles.map((a) => (
                <Link key={a._id || a.id} href={`/article/${a._id || a.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <img src={imgUrl(a.image)} alt={a.title} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-green-600 transition-colors">{a.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Magazines with Read (Flipbook) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BookOpen size={16} className="text-green-600" /> Magazines
              </h3>
              <Link href="/magazines" className="text-xs text-green-600 font-bold hover:underline flex items-center gap-1">
                All Issues <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {magazines.map((mag) => {
                const cover = imgUrl(mag.coverImage || mag.cover);
                const fileUrl = mag.fileUrl ? (mag.fileUrl.startsWith("http") ? mag.fileUrl : `${API_URL}${mag.fileUrl}`) : null;
                const canRead = mag.accessType !== "premium" || subscription;
                return (
                  <div key={mag._id || mag.id} className="border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition-all group">
                    <div className="relative h-40 overflow-hidden">
                      <img src={cover} alt={mag.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {mag.accessType === "premium" && (
                        <span className="absolute top-2 right-2 bg-green-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Premium</span>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">{mag.title}</h4>
                      <p className="text-xs text-slate-400 mb-3">{mag.pages || 48} pages</p>
                      <div className="flex gap-2">
                        {canRead && fileUrl ? (
                          <>
                            <button onClick={() => setFlipbook(fileUrl)}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-bold py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                              <Eye size={12} /> Read
                            </button>
                            <a href={fileUrl} target="_blank" rel="noreferrer"
                              className="flex items-center justify-center gap-1 text-xs font-bold py-2 px-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                              <Download size={12} />
                            </a>
                          </>
                        ) : (
                          <Link href="/subscription" className="flex-1 flex items-center justify-center gap-1 text-xs font-bold py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                            Subscribe to Read
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Flipbook PDF Reader Modal ────────────────────────────── */}
      {flipbook && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BookOpen size={16} className="text-green-600" /> Magazine Reader
              </h3>
              <button onClick={() => setFlipbook(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1">
              <iframe src={`${flipbook}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full border-0" title="Magazine Reader" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
