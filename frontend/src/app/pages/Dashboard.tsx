import { useEffect, useState } from "react";
import {
  Building2, Users, FileText, TrendingUp, Activity,
  MapPin, AlertTriangle, Clock, CheckCircle, ArrowRight,
  DollarSign, BarChart3, Plus, Home,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { dashboardService } from "../../services";
import { apiClient } from "../../services/api";

const statusColor = (s: string) => {
  if (s === "completed" || s === "available") return "bg-emerald-100 text-emerald-700";
  if (s === "survey_in_progress") return "bg-blue-100 text-blue-700";
  if (s === "submitted_to_land_office") return "bg-orange-100 text-orange-700";
  if (s === "sold") return "bg-gray-100 text-gray-700";
  if (s === "rented") return "bg-purple-100 text-purple-700";
  return "bg-yellow-100 text-yellow-700";
};
const fmt = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const fmtMoney = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [reportStats, setReportStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      dashboardService.getStats(),
      apiClient.get<any>("/reports/stats/"),
    ]).then(([s, r]) => {
      if (s.status === "fulfilled") setStats(s.value);
      if (r.status === "fulfilled") setReportStats(r.value);
    }).finally(() => setLoading(false));
  }, []);

  const recentProjects: any[] = stats?.recent_projects ?? [];
  const recentTransactions: any[] = stats?.recent_transactions ?? [];
  const totals = reportStats?.totals || {};
  const overdueProjects = recentProjects.filter((p: any) => p.is_overdue);

  const kpis = [
    { label: "Active Projects", value: stats?.active_survey_projects ?? "—", icon: MapPin, color: "emerald", path: "/dashboard/survey-projects" },
    { label: "Total Properties", value: stats?.total_properties ?? "—", icon: Building2, color: "blue", path: "/dashboard/properties" },
    { label: "Total Revenue", value: totals.revenue ? `UGX ${fmtMoney(totals.revenue)}` : "—", icon: DollarSign, color: "purple", path: "/dashboard/transactions" },
    { label: "Total Customers", value: totals.customers ?? "—", icon: Users, color: "orange", path: "/dashboard/customers" },
  ];

  const colorMap: Record<string, string> = {
    emerald: "from-emerald-500 to-teal-600",
    blue: "from-blue-500 to-indigo-600",
    purple: "from-purple-500 to-violet-600",
    orange: "from-orange-500 to-rose-500",
  };
  const bgMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── HERO GREETING ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 shadow-xl">
        {/* Scrolling ticker */}
        <div className="relative overflow-hidden border-b border-white/10 py-2.5">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-10 text-white/60 text-xs font-medium">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                LSREMS · Land Surveying & Real Estate Management
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
                Manage Projects · Properties · Customers · Reports
              </span>
            ))}
          </div>
        </div>
        {/* Greeting */}
        <div className="px-5 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/30 flex-shrink-0">
              {(user?.first_name || user?.username || "U")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-white/60 text-sm">{greeting()},</p>
              <h1 className="text-white text-xl font-black leading-tight">
                {user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user?.username}
              </h1>
              <p className="text-white/50 text-xs mt-0.5">
                {new Date().toLocaleDateString("en-UG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full capitalize">
              {user?.role?.replace(/_/g, " ") || "admin"}
            </span>
            {overdueProjects.length > 0 && (
              <span className="text-xs text-red-300 bg-red-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {overdueProjects.length} overdue
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── OVERDUE ALERT ── */}
      {overdueProjects.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{overdueProjects.length} project{overdueProjects.length > 1 ? "s" : ""} overdue</p>
            <p className="text-xs text-red-500 truncate">{overdueProjects.map((p: any) => p.project_name).join(", ")}</p>
          </div>
          <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-100 flex-shrink-0"
            onClick={() => navigate("/dashboard/survey-projects")}>
            Review
          </Button>
        </div>
      )}

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4 border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group rounded-xl bg-white dark:bg-gray-800"
            onClick={() => navigate(k.path)}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[k.color]} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <k.icon className="w-5 h-5 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{loading ? "…" : k.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* ── FINANCIAL SUMMARY ── */}
      {reportStats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Revenue", value: totals.revenue || 0, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Expenses", value: totals.expenses || 0, color: "text-red-500", bg: "bg-red-50" },
            { label: "Net Profit", value: totals.profit || 0, color: (totals.profit || 0) >= 0 ? "text-blue-600" : "text-red-600", bg: (totals.profit || 0) >= 0 ? "bg-blue-50" : "bg-red-50" },
          ].map(f => (
            <Card key={f.label} className="p-4 border-0 shadow-sm rounded-xl bg-white dark:bg-gray-800">
              <p className="text-xs text-gray-500 mb-1">{f.label}</p>
              <p className={`text-lg font-black ${f.color}`}>UGX {fmtMoney(f.value)}</p>
            </Card>
          ))}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Projects */}
        <Card className="p-4 border-0 shadow-sm rounded-xl bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Projects</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-emerald-600 h-7 px-2"
              onClick={() => navigate("/dashboard/survey-projects")}>
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-2">
            {recentProjects.length === 0
              ? <p className="text-xs text-gray-400 text-center py-6">No projects yet</p>
              : recentProjects.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 cursor-pointer transition-colors group"
                  onClick={() => navigate("/dashboard/survey-projects")}>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-emerald-700">{p.project_name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.customer?.name || "—"} · {p.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`${statusColor(p.status)} text-xs`}>{fmt(p.status)}</Badge>
                    {p.is_overdue && <AlertTriangle className="w-3 h-3 text-red-500" />}
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-4 border-0 shadow-sm rounded-xl bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-purple-600 h-7 px-2"
              onClick={() => navigate("/dashboard/transactions")}>
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-2">
            {recentTransactions.length === 0
              ? <p className="text-xs text-gray-400 text-center py-6">No transactions yet</p>
              : recentTransactions.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 cursor-pointer transition-colors group"
                  onClick={() => navigate("/dashboard/transactions")}>
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-700">
                      {t.property?.property_name || "—"}
                    </p>
                    <p className="text-xs text-gray-500">{t.customer?.name || "—"}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-600">UGX {fmtMoney(Number(t.price || 0))}</p>
                    <Badge className={t.transaction_type === "sale" ? "bg-blue-100 text-blue-700 text-xs" : "bg-purple-100 text-purple-700 text-xs"}>
                      {t.transaction_type}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <Card className="p-4 border-0 shadow-sm rounded-xl bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "New Project",    icon: Plus,      color: "emerald", path: "/dashboard/survey-projects" },
            { label: "Add Property",   icon: Home,      color: "blue",    path: "/dashboard/properties" },
            { label: "Add Customer",   icon: Users,     color: "purple",  path: "/dashboard/customers" },
            { label: "View Reports",   icon: BarChart3, color: "orange",  path: "/dashboard/reports" },
          ].map((a) => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group">
              <div className={`w-10 h-10 bg-gradient-to-br ${colorMap[a.color]} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <a.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{a.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* ── PROPERTY STATUS STRIP ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "For Sale",   value: stats?.properties_for_sale ?? "—",  icon: Home,        color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "For Rent",   value: stats?.properties_for_rent ?? "—",  icon: Building2,   color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Completed",  value: reportStats?.project_status_chart?.find((p: any) => p.name === "Completed")?.value ?? "—", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(s => (
          <Card key={s.label} className="p-4 border-0 shadow-sm rounded-xl bg-white dark:bg-gray-800 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/dashboard/properties")}>
            <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-lg font-black text-gray-900 dark:text-white">{loading ? "…" : s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}
