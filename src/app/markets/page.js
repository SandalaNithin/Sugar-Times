"use client";
import { useState, useEffect, useMemo } from "react";
import { marketsAPI, adsAPI } from "@/lib/api";
import { TrendingUp, TrendingDown, RefreshCw, Loader2, BarChart3, FileText, Table as TableIcon, Megaphone } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LabelList } from "recharts";

export default function MarketsPage() {
  const [markets, setMarkets] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("All");
  const [commodityFilter, setCommodityFilter] = useState("All");
  const [view, setView] = useState("table"); // "table" | "report"

  useEffect(() => {
    fetchMarkets();
    // Ads are a side concern — loaded independently so a slow or failing
    // advertisements endpoint doesn't block the market data from rendering.
    // We target both the parent "Market & Prices" and the specific "Market Rates"
    adsAPI
      .getAll({ activeOnly: true, category: "Market & Prices" })
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.advertisements)
            ? res.data.advertisements
            : [];
        setAds(list);
      })
      .catch(() => setAds([]));
  }, []);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const { data } = await marketsAPI.getAll({ limit: 200 });
      setMarkets(Array.isArray(data) ? data : []);
    } catch {
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  // Split ads by placement so the sticky sidebar and the inline banner at
  // the bottom of the section don't show the same creatives.
  const sidebarAds = ads.filter((a) => a.placement === "sidebar" || a.placement === "both");
  const middleAds = ads.filter((a) => a.placement === "middle" || a.placement === "both");

  const states = useMemo(
    () => ["All", ...Array.from(new Set(markets.map((m) => m.state).filter(Boolean)))],
    [markets]
  );
  const commodities = useMemo(
    () => ["All", ...Array.from(new Set(markets.map((m) => m.commodity).filter(Boolean)))],
    [markets]
  );

  const filtered = markets.filter((m) =>
    (stateFilter === "All" || m.state === stateFilter) &&
    (commodityFilter === "All" || m.commodity === commodityFilter)
  );

  // Monthly trend (average price per month across filtered rows)
  const chartData = useMemo(() => {
    const buckets = new Map();
    filtered.forEach((m) => {
      const d = new Date(m.date || m.createdAt || Date.now());
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
      const bucket = buckets.get(key) || { key, label, total: 0, count: 0 };
      bucket.total += Number(m.price) || 0;
      bucket.count += 1;
      buckets.set(key, bucket);
    });
    return Array.from(buckets.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((b) => ({ month: b.label, price: Math.round(b.total / b.count) }));
  }, [filtered]);

  const latestAvg = chartData.length ? chartData[chartData.length - 1].price : null;

  // Report-view aggregates: commodity averages, state rankings, overall stats.
  const report = useMemo(() => {
    if (filtered.length === 0) return null;
    const byCommodity = new Map();
    filtered.forEach((m) => {
      const key = m.commodity || "Uncategorized";
      const b = byCommodity.get(key) || { commodity: key, total: 0, count: 0, min: Infinity, max: -Infinity };
      const price = Number(m.price) || 0;
      b.total += price;
      b.count += 1;
      if (price < b.min) b.min = price;
      if (price > b.max) b.max = price;
      byCommodity.set(key, b);
    });
    const commodityRows = Array.from(byCommodity.values())
      .map((b) => ({ ...b, avg: Math.round(b.total / b.count) }))
      .sort((a, b) => b.avg - a.avg);

    const sortedByPrice = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
    const topFive = sortedByPrice.slice(0, 5);
    const bottomFive = sortedByPrice.slice(-5).reverse();

    // Overall KPIs are only meaningful when a single commodity is in scope —
    // averaging ₹ across sugar, ethanol, molasses etc. produces a nonsense
    // number. We compute them here but the UI only surfaces them when a
    // specific commodity filter is active.
    const singleCommodity = commodityRows.length === 1;
    const prices = filtered.map((m) => Number(m.price) || 0);
    const overall = singleCommodity
      ? {
          min: Math.min(...prices),
          max: Math.max(...prices),
          avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
          count: filtered.length,
          commodity: commodityRows[0].commodity,
        }
      : null;

    return { commodityRows, topFive, bottomFive, overall, count: filtered.length };
  }, [filtered]);

  const reportDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header — spans full width above the 2-column body */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Market Insights</h1>
          <p className="text-slate-500">
            {view === "report"
              ? `Intelligence report generated on ${reportDate}`
              : "Live sugar-industry commodity prices, state-wise"}
          </p>
        </div>
        <button
          onClick={fetchMarkets}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:text-green-600 hover:border-green-200 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* 2-column body: left sticky ad sidebar + main content. 
          The `sticky top-24` on the aside keeps the left column in view 
          while the user scrolls the long market table. */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
        
        {/* Left column — sticky on desktop so it trails the user as they
            scroll the main market content. Hidden on mobile via `hidden lg:block`. */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-5">
            {sidebarAds.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                <Megaphone size={20} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Advertise here</p>
                <p className="text-[11px] text-slate-400 mt-1">Reach India&apos;s sugar industry — contact the Sugar Times desk.</p>
              </div>
            ) : (
              sidebarAds.slice(0, 3).map((ad) => (
                <MarketAdCard key={ad._id || ad.id} ad={ad} />
              ))
            )}
          </div>
        </aside>

        <div className="min-w-0">

      {/* View switcher */}
      <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-6">
        <button
          onClick={() => setView("table")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${view === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <TableIcon size={14} /> Table View
        </button>
        <button
          onClick={() => setView("report")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${view === "report" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <FileText size={14} /> Report View
        </button>
      </div>

      {/* Filters (shared across views) */}
      {!loading && markets.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {states.map((s) => (
              <button
                key={s}
                onClick={() => setStateFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${stateFilter === s ? "bg-green-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-green-50"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <select
            value={commodityFilter}
            onChange={(e) => setCommodityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {commodities.map((c) => (
              <option key={c} value={c}>{c === "All" ? "All commodities" : c}</option>
            ))}
          </select>
        </div>
      )}

      {/* ------------------------------- TABLE VIEW ------------------------------- */}
      {view === "table" && (
        <>
          {/* Summary strip */}
          {!loading && markets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Tracked Records</p>
                <p className="text-2xl font-black text-slate-900">{markets.length}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">States Covered</p>
                <p className="text-2xl font-black text-slate-900">{states.length - 1}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Latest Avg Price</p>
                <p className="text-2xl font-black text-slate-900">
                  {commodityFilter !== "All" && latestAvg != null
                    ? `₹${latestAvg.toLocaleString("en-IN")}`
                    : "—"}
                </p>
                {commodityFilter === "All" && (
                  <span className="text-[10px] text-slate-400 font-medium">Select a commodity to compute</span>
                )}
              </div>
            </div>
          )}

          {/* Trend chart (≥2 monthly points only) */}
          {chartData.length >= 2 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 size={18} className="text-green-600" />
                  Price Trend {commodityFilter !== "All" ? `• ${commodityFilter}` : ""}
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} domain={["auto", "auto"]} />
                  <Tooltip
                    formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Avg Price"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={2.5} fill="url(#priceGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detailed table */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">State-wise Rates</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-green-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold text-slate-600">No market rates available{stateFilter !== "All" || commodityFilter !== "All" ? " for this filter" : ""}.</p>
                <p className="text-xs mt-1">Admin rates appear here live once published.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-6 py-3 font-semibold text-slate-600">State</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-600">Commodity</th>
                      <th className="text-right px-6 py-3 font-semibold text-slate-600">Min</th>
                      <th className="text-right px-6 py-3 font-semibold text-slate-600">Average</th>
                      <th className="text-right px-6 py-3 font-semibold text-slate-600">Max</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-600">Unit</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-600">Description</th>
                      <th className="text-right px-6 py-3 font-semibold text-slate-600">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row._id} className="border-t border-slate-50 hover:bg-green-50/40 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{row.state}</td>
                        <td className="px-6 py-4 text-slate-500">{row.commodity || "—"}</td>
                        <td className="px-6 py-4 text-right text-red-500 font-semibold">
                          {row.minPrice != null ? `₹${Number(row.minPrice).toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                          ₹{Number(row.price).toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4 text-right text-emerald-600 font-semibold">
                          {row.maxPrice != null ? `₹${Number(row.maxPrice).toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">{row.unit}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 max-w-[280px]">
                          <span className="line-clamp-2">{row.description || "—"}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-slate-400">
                          {row.date || row.createdAt
                            ? new Date(row.date || row.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ------------------------------- REPORT VIEW ------------------------------ */}
      {view === "report" && (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-20 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-green-500" />
            </div>
          ) : !report ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center text-slate-400">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-slate-600">No data to report on.</p>
              <p className="text-xs mt-1">Once admin publishes market rates they will appear here.</p>
            </div>
          ) : (
            <>
              {/* Report cover */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">Sugar Times · Market Intelligence Report</p>
                    <h2 className="text-2xl font-black mb-1">
                      {commodityFilter === "All" ? "All Commodities" : commodityFilter}
                      {stateFilter !== "All" ? ` · ${stateFilter}` : ""}
                    </h2>
                    <p className="text-sm text-slate-300">Report date: {reportDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Records analysed</p>
                    <p className="text-4xl font-black">{report.count}</p>
                  </div>
                </div>
              </div>

              {/* KPI cards — only meaningful when a single commodity is in
                  scope. Averaging ₹ across sugarcane/ethanol/molasses would
                  be meaningless so we hide the overall numbers and let the
                  breakdown table do the work instead. */}
              {report.overall ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: `Average · ${report.overall.commodity}`, value: `₹${report.overall.avg.toLocaleString("en-IN")}`, cls: "text-slate-900" },
                    { label: "Highest Price", value: `₹${report.overall.max.toLocaleString("en-IN")}`, cls: "text-emerald-600" },
                    { label: "Lowest Price", value: `₹${report.overall.min.toLocaleString("en-IN")}`, cls: "text-red-500" },
                    { label: "Price Spread", value: `₹${(report.overall.max - report.overall.min).toLocaleString("en-IN")}`, cls: "text-amber-600" },
                  ].map((k) => (
                    <div key={k.label} className="bg-white rounded-2xl border border-slate-100 p-5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{k.label}</p>
                      <p className={`text-2xl font-black ${k.cls}`}>{k.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-5 text-sm">
                  <strong className="font-black">Tip:</strong> pick a single commodity from the filter above to see its
                  average, highest, and lowest rates. The per-commodity breakdown is shown below.
                </div>
              )}

              {/* Commodity performance (bar chart) */}
              {report.commodityRows.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <BarChart3 size={18} className="text-emerald-600" />
                    Commodity Performance (Average ₹)
                  </h3>
                  <ResponsiveContainer width="100%" height={Math.max(200, report.commodityRows.length * 44)}>
                    <BarChart data={report.commodityRows} layout="vertical" margin={{ left: 8, right: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis type="category" dataKey="commodity" tick={{ fontSize: 12, fill: "#475569" }} width={120} />
                      <Tooltip
                        formatter={(v, name) => [`₹${Number(v).toLocaleString("en-IN")}`, name === "avg" ? "Average" : name]}
                        contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                      />
                      <Bar dataKey="avg" fill="#10b981" radius={[0, 6, 6, 0]}>
                        <LabelList dataKey="avg" position="right" formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} style={{ fontSize: 11, fill: "#0f172a", fontWeight: 700 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top / Bottom rankings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RankCard
                  title="Top 5 Highest Rates"
                  rows={report.topFive}
                  accent="text-emerald-600"
                  icon={<TrendingUp size={16} className="text-emerald-600" />}
                />
                <RankCard
                  title="Bottom 5 Lowest Rates"
                  rows={report.bottomFive}
                  accent="text-red-500"
                  icon={<TrendingDown size={16} className="text-red-500" />}
                />
              </div>

              {/* Commodity breakdown table */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">Commodity Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-6 py-3 font-semibold text-slate-600">Commodity</th>
                        <th className="text-right px-6 py-3 font-semibold text-slate-600">Records</th>
                        <th className="text-right px-6 py-3 font-semibold text-slate-600">Min</th>
                        <th className="text-right px-6 py-3 font-semibold text-slate-600">Average</th>
                        <th className="text-right px-6 py-3 font-semibold text-slate-600">Max</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.commodityRows.map((row) => (
                        <tr key={row.commodity} className="border-t border-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-800">{row.commodity}</td>
                          <td className="px-6 py-4 text-right text-slate-500">{row.count}</td>
                          <td className="px-6 py-4 text-right text-red-500 font-semibold">₹{row.min.toLocaleString("en-IN")}</td>
                          <td className="px-6 py-4 text-right font-black text-slate-900">₹{row.avg.toLocaleString("en-IN")}</td>
                          <td className="px-6 py-4 text-right text-emerald-600 font-semibold">₹{row.max.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Generated from live Sugar Times market data · {report.count} record{report.count === 1 ? "" : "s"} analysed.
              </p>
            </>
          )}
        </div>
      )}

      {view === "table" && (
            <p className="text-xs text-slate-400 mt-4 text-center">* Data sourced live from the Sugar Times admin backend.</p>
          )}

          {/* Bottom ad strip — closes out the Market & Prices section. Only
              renders when the admin has published middle/both placement ads. */}
          {middleAds.length > 0 && (
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sponsored</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {middleAds.slice(0, 2).map((ad) => (
                  <MarketAdCard key={ad._id || ad.id} ad={ad} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MarketAdCard({ ad }) {
  const inner = (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
      <span className="absolute top-2 right-2 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1">
        <Megaphone size={9} /> Ad
      </span>
      <img
        src={ad.image}
        alt={ad.title || "Advertisement"}
        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {ad.title && (
        <div className="px-4 py-3 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-700 line-clamp-2">{ad.title}</p>
        </div>
      )}
    </div>
  );
  return ad.link ? (
    <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
  ) : (
    inner
  );
}

function RankCard({ title, rows, accent, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        {icon}
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">No data.</div>
      ) : (
        <ul className="divide-y divide-slate-50">
          {rows.map((r, i) => (
            <li key={r._id || i} className="px-6 py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{r.state}</p>
                <p className="text-xs text-slate-400">{r.commodity || "—"}</p>
              </div>
              <p className={`text-base font-black ${accent}`}>₹{Number(r.price).toLocaleString("en-IN")}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
