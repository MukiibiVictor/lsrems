import { useEffect, useState } from "react";
import { Building2, Zap, Users, FileText, Plus, Eye, BarChart3, TrendingUp, Activity } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { dashboardService } from "../../services";

const statusColor = (status: string) => {
  if (status === "completed" || status === "available") return "bg-emerald-100 text-emerald-700";
  if (status === "survey_in_progress" || status === "in progress") return "bg-blue-100 text-blue-700";
  if (status === "submitted_to_land_office") return "bg-orange-100 text-orange-700";
  if (status === "sold") return "bg-gray-100 text-gray-700";
  if (status === "rented") return "bg-purple-100 text-purple-700";
  return "bg-yellow-100 text-yellow-700";
};

const formatStatus = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total Projects",
      value: stats?.active_survey_projects ?? (loading ? "…" : "0"),
      icon: Building2,
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      iconColor: "text-emerald-600",
      hoverColor: "hover:from-emerald-100 hover:to-emerald-200",
    },
    {
      label: "Properties",
      value: stats?.total_properties ?? (loading ? "…" : "0"),
      icon: Zap,
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      hoverColor: "hover:from-blue-100 hover:to-blue-200",
    },
    {
      label: "For Sale",
      value: stats?.properties_for_sale ?? (loading ? "…" : "0"),
      icon: Building2,
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
      hoverColor: "hover:from-purple-100 hover:to-purple-200",
    },
    {
      label: "For Rent",
      value: stats?.properties_for_rent ?? (loading ? "…" : "0"),
      icon: Users,
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      iconColor: "text-orange-600",
      hoverColor: "hover:from-orange-100 hover:to-orange-200",
    },
  ];

  const recentProjects: any[] = stats?.recent_projects ?? [];
  const recentTransactions: any[] = stats?.recent_transactions ?? [];

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Welcome Banner */}
      <div className="rounded-xl overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-lg">
        {/* Scrolling text strip */}
        <div className="relative flex items-center py-3 overflow-hidden border-b border-white/10">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-white/80 text-xs font-medium">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Land Surveying &amp; Real Estate Management System
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                Manage Projects · Properties · Customers · Reports
              </span>
            ))}
          </div>
        </div>
        {/* Main welcome content */}
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-lg sm:text-xl font-bold leading-tight truncate">
              Welcome back, {user?.first_name || user?.username || "Admin"}!
            </h1>
            <p className="text-white/75 text-xs sm:text-sm">Here's what's happening with your system today</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-white/60 bg-white/10 px-3 py-1 rounded-full capitalize">
              {user?.role?.replace(/_/g, " ") || "admin"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-4 border-0 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group rounded-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Projects */}
        <Card className="p-4 border-0 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 gradient-emerald rounded-lg flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Projects</h2>
            </div>
            <Button variant="ghost" size="sm"
              className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-7 px-2"
              onClick={() => navigate("/dashboard/survey-projects")}>
              View All
            </Button>
          </div>
          <div className="space-y-2">
            {recentProjects.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No projects yet.</p>
            ) : recentProjects.map((project: any) => (
              <div key={project.id}
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all duration-200 cursor-pointer group"
                onClick={() => navigate("/dashboard/survey-projects")}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    {project.project_name}
                  </h3>
                  <Badge className={`${statusColor(project.status)} text-xs flex-shrink-0`}>{formatStatus(project.status)}</Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{project.location}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-4 border-0 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 gradient-purple rounded-lg flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
            </div>
            <Button variant="ghost" size="sm"
              className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-7 px-2"
              onClick={() => navigate("/dashboard/transactions")}>
              View All
            </Button>
          </div>
          <div className="space-y-2">
            {recentTransactions.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No transactions yet.</p>
            ) : recentTransactions.map((txn: any) => (
              <div key={txn.id}
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all duration-200 cursor-pointer group"
                onClick={() => navigate("/dashboard/transactions")}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-400">
                    {txn.property?.property_name || txn.property_name || "—"}
                  </h3>
                  <Badge className={`${txn.transaction_type === "sale" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"} text-xs flex-shrink-0`}>
                    {txn.transaction_type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {txn.customer?.name || txn.customer_name || "—"} · {Number(txn.price || 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-4 border-0 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 gradient-emerald rounded-lg flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "New Project", icon: Plus, color: "emerald", path: "/dashboard/survey-projects" },
            { label: "Add Property", icon: Building2, color: "blue", path: "/dashboard/properties" },
            { label: "New Listing", icon: Eye, color: "purple", path: "/dashboard/property-listings" },
            { label: "View Reports", icon: BarChart3, color: "orange", path: "/dashboard/reports" },
          ].map((action) => (
            <button key={action.label} onClick={() => navigate(action.path)}
              className={`p-3 rounded-xl text-left group bg-gradient-to-br from-${action.color}-50 to-${action.color}-100 dark:from-${action.color}-900/20 dark:to-${action.color}-800/10 hover:shadow-md transition-all duration-200`}>
              <div className={`w-8 h-8 gradient-${action.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <h3 className={`font-medium text-${action.color}-900 dark:text-${action.color}-300 text-xs sm:text-sm`}>{action.label}</h3>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
