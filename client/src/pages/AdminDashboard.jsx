// src/pages/AdminDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Helpers ───────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

const STATUS_STYLES = {
  paid: "bg-stone-900 text-white",
  created: "border border-stone-300 text-stone-600",
  failed: "bg-red-50 border border-red-100 text-red-600",
};

// ── Components ────────────────────────────────────────────────────────────

const Skeleton = ({ className = "" }) => (
  <div className={`bg-stone-100 rounded-2xl animate-pulse ${className}`} />
);

const Empty = ({ message = "No data for this period" }) => (
  <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
    <p className="text-3xl text-stone-300 mb-3">∅</p>
    <p className="text-sm text-stone-400">{message}</p>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center bg-red-50/50 rounded-2xl border border-red-100">
    <p className="text-sm text-red-600 mb-4">⚠ {message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="text-xs bg-white border border-red-200 text-red-600 px-4 py-2 rounded-full hover:bg-red-50 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

const SectionCard = ({ title, eyebrow, children, loading, error, onRetry }) => (
  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7
                  hover:border-stone-300 transition-all duration-300 h-full flex flex-col">
    {eyebrow && (
      <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-1">{eyebrow}</p>
    )}
    <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl text-stone-900 mb-5 sm:mb-6">
      {title}
    </h2>
    <div className="flex-1">
      {loading ? <Skeleton className="w-full h-48" /> : error ? <ErrorState message={error} onRetry={onRetry} /> : children}
    </div>
  </div>
);

const KPICard = ({ label, value, sub, icon, loading }) => (
  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7
                  hover:border-stone-300 hover:shadow-lg transition-all duration-300">
    <p className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em]
                  uppercase text-stone-400 mb-4 sm:mb-5 leading-tight">
      {label}
    </p>
    {loading ? (
      <Skeleton className="h-8 w-24" />
    ) : (
      <div className="flex items-end justify-between">
        <p style={{ fontFamily: "'DM Serif Display', serif" }}
          className="text-2xl sm:text-3xl md:text-4xl text-stone-900 leading-none wrap-break-word min-w-0">
          {value}
        </p>
        <div className="text-xl sm:text-2xl opacity-40 mb-0.5 shrink-0 ml-2">
          {icon}
        </div>
      </div>
    )}
    {sub && !loading && <p className="text-xs text-stone-400 mt-2 sm:mt-3">{sub}</p>}
  </div>
);

const CustomerAvatar = ({ name, photoURL }) => (
  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0
                  bg-stone-200 flex items-center justify-center">
    {photoURL ? (
      <img src={photoURL} alt={name || "User profile"}
        className="w-full h-full object-cover" referrerPolicy="no-referrer"
        onError={e => { e.currentTarget.style.display = "none"; }} />
    ) : (
      <span className="text-[11px] font-medium text-stone-600">
        {(name?.[0] || "?").toUpperCase()}
      </span>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm shadow-lg">
      <p className="text-xs text-stone-400 uppercase tracking-[0.12em] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-medium text-stone-900">
          {p.name === "revenue" ? fmt(p.value) : `${p.value} units`}
        </p>
      ))}
    </div>
  );
};

// ── Page Main ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [range, setRange] = useState("month");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true); // Keep it true to test UI
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/dashboard?range=${range}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  // useEffect(() => {
  //   fetchDashboardData();
  // }, [fetchDashboardData]);

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <AdminNavbar range={range} setRange={setRange} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        .fitmart-chart .recharts-cartesian-grid-horizontal line,
        .fitmart-chart .recharts-cartesian-grid-vertical line { stroke: #e7e5e3; }
        .fitmart-chart .recharts-tooltip-cursor { fill: #f5f5f4; }
        .fade-in { animation: fmFadeIn 0.5s ease forwards; }
        @keyframes fmFadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-8 sm:py-12">
        <header className="mb-8 sm:mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Overview</p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-3xl sm:text-4xl md:text-5xl text-stone-900 mb-6 sm:mb-8">
            Command Centre
          </h1>
        </header>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-8">
          <KPICard label="Total Revenue" value={data ? fmt(data.kpis.totalRevenue) : "₹0"} icon="₹" loading={loading} />
          <KPICard label="Total Orders" value={data ? data.kpis.totalOrders.toLocaleString() : "0"} icon="◎" loading={loading} />
          <KPICard label="Customers" value={data ? data.kpis.totalCustomers.toLocaleString() : "0"} loading={loading}
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
          <KPICard label="Low on Stock" value={data ? data.kpis.lowStockCount : "0"} sub="Below 5 units" icon="─" loading={loading} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-8">
          <SectionCard eyebrow="Analytics" title="Revenue Over Time" loading={loading} error={error} onRetry={fetchDashboardData}>
            {!data?.revenueOverTime?.length ? <Empty /> : (
              <div className="fitmart-chart">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.revenueOverTime} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1c1917" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#1c1917" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e3" />
                    <XAxis dataKey="date" tick={{ fill: "#78716c", fontSize: 10, fontFamily: "'DM Sans'" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "#78716c", fontSize: 10, fontFamily: "'DM Sans'" }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="revenue" stroke="#1c1917" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: "#1c1917", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>

          <SectionCard eyebrow="Performance" title="Top 5 Selling Products" loading={loading} error={error} onRetry={fetchDashboardData}>
            {!data?.topProducts?.length ? <Empty /> : (
              <div className="fitmart-chart">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.topProducts} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e3" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#78716c", fontSize: 10, fontFamily: "'DM Sans'" }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "#78716c", fontSize: 10, fontFamily: "'DM Sans'" }} tickLine={false} axisLine={false} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="totalQuantity" name="revenue" fill="#1c1917" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Recent Orders Section */}
        <SectionCard eyebrow="Transactions" title="Recent Orders" loading={loading} error={error} onRetry={fetchDashboardData}>
          {/* Table logic here... omitting for brevity in chat, but keep your existing table code inside this card! */}
          <div className="overflow-x-auto">
             <table className="w-full text-sm">
                {/* ... Paste your table header and body here ... */}
             </table>
          </div>
        </SectionCard>
      </div>

      <footer className="border-t border-stone-200 bg-white mt-10 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-5 sm:py-6 flex justify-between items-center">
          <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-stone-900">FitMart</span>
          <p className="text-xs text-stone-400">Admin Dashboard · © 2026</p>
        </div>
      </footer>
    </div>
  );
}