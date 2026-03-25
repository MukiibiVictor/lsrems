import { useState, useEffect } from "react";
import { FileText, Download, TrendingUp, BarChart3, PieChart as PieIcon, DollarSign, Users, Briefcase } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { transactionService, propertyService, customerService } from "../../services";
import { apiClient } from "../../services/api";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function KpiCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <Card className="p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function Reports() {
  const [period, setPeriod] = useState("30");
  const [generating, setGenerating] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await apiClient.get<any>("/reports/stats/");
      setStats(data);
    } catch {
      toast.error("Failed to load report data");
    } finally {
      setLoadingStats(false);
    }
  };

  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[]) => {
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateReport = async (type: string) => {
    setGenerating(type);
    try {
      if (type === "Revenue Report") {
        const res = await transactionService.getAll();
        const data = (res.results || res || []) as any[];
        const headers = ["ID", "Property", "Customer", "Type", "Amount", "Date", "Status"];
        const rows = data.map((t) =>
          [
            `TXN-${String(t.id).padStart(3, "0")}`,
            t.property_name || t.property || "",
            t.customer_name || t.customer || "",
            t.transaction_type || "",
            t.price || 0,
            t.transaction_date || "",
            t.status || "",
          ].join(",")
        );
        downloadCSV(`revenue_report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      } else if (type === "Property Inventory") {
        const res = await propertyService.getAll();
        const data = (res.results || res || []) as any[];
        const headers = ["ID", "Name", "Location", "Type", "Size", "Price", "Status"];
        const rows = data.map((p) =>
          [p.id, p.property_name || "", p.location || "", p.property_type || "", p.size || "", p.price || "", p.status || ""].join(",")
        );
        downloadCSV(`property_inventory_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      } else if (type === "Customer Report") {
        const res = await customerService.getAll();
        const data = (res.results || res || []) as any[];
        const headers = ["ID", "Name", "Email", "Phone", "Address", "Created"];
        const rows = data.map((c) =>
          [c.id, c.name || "", c.email || "", c.phone || "", `"${(c.address || "").replace(/"/g, '""')}"`, c.created_at ? c.created_at.slice(0, 10) : ""].join(",")
        );
        downloadCSV(`customer_report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      } else {
        const res = await fetch("/api/projects/", {
          headers: { Authorization: `Token ${localStorage.getItem("access_token")}` },
        });
        const json = await res.json();
        const data = (json.results || json || []) as any[];
        const headers = ["ID", "Project Name", "Location", "Status", "Customer", "Surveyor", "Created"];
        const rows = data.map((p) =>
          [
            p.id,
            `"${(p.project_name || "").replace(/"/g, '""')}"`,
            `"${(p.location || "").replace(/"/g, '""')}"`,
            p.status || "",
            p.customer?.name || "",
            p.surveyor?.username || "",
            p.created_at ? p.created_at.slice(0, 10) : "",
          ].join(",")
        );
        downloadCSV(`project_status_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      }
      toast.success(`${type} downloaded`);
    } catch {
      toast.error(`Failed to generate ${type}`);
    } finally {
      setGenerating(null);
    }
  };

  const totals = stats?.totals || {};
  const revenueVsExpenses = stats?.revenue_vs_expenses || [];
  const projectChart = stats?.project_status_chart || [];
  const expenseChart = stats?.expense_by_category || [];

  // Profit trend derived from revenue_vs_expenses
  const profitTrend = revenueVsExpenses.map((d: any) => ({
    month: d.month,
    profit: d.revenue - d.expenses,
  }));

  const reportTypes = [
    { title: "Revenue Report", description: "Sales and rental income", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
    { title: "Project Status Report", description: "Survey projects overview", icon: BarChart3, color: "bg-blue-50 text-blue-600" },
    { title: "Property Inventory", description: "All properties and availability", icon: PieIcon, color: "bg-purple-50 text-purple-600" },
    { title: "Customer Report", description: "Customer list with contacts", icon: FileText, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="space-y-6 clean-bg min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm">Business performance overview and downloadable reports</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      {!loadingStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KpiCard icon={DollarSign} label="Total Revenue" value={`UGX ${fmt(totals.revenue || 0)}`} color="bg-emerald-50 text-emerald-600" />
          <KpiCard icon={DollarSign} label="Total Expenses" value={`UGX ${fmt(totals.expenses || 0)}`} color="bg-red-50 text-red-500" />
          <KpiCard icon={TrendingUp} label="Net Profit" value={`UGX ${fmt(totals.profit || 0)}`} color={(totals.profit || 0) >= 0 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"} />
          <KpiCard icon={Users} label="Customers" value={String(totals.customers || 0)} color="bg-purple-50 text-purple-600" />
          <KpiCard icon={Briefcase} label="Projects" value={String(totals.projects || 0)} color="bg-yellow-50 text-yellow-600" />
        </div>
      )}

      {/* Revenue vs Expenses Bar Chart */}
      {!loadingStats && revenueVsExpenses.length > 0 && (
        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Revenue vs Expenses (Monthly)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueVsExpenses} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${fmt(v)}`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => `UGX ${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Profit Trend Line Chart */}
      {!loadingStats && profitTrend.length > 0 && (
        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Profit Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={profitTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${fmt(v)}`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => `UGX ${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Pie Charts Row */}
      {!loadingStats && (projectChart.length > 0 || expenseChart.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projectChart.length > 0 && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Project Status Breakdown</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={projectChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {projectChart.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
          {expenseChart.length > 0 && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Expenses by Category</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expenseChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {expenseChart.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `UGX ${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {loadingStats && (
        <div className="text-center py-8 text-gray-400">Loading analytics...</div>
      )}

      {/* Download Reports */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Download Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((report, index) => (
            <Card key={index} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${report.color} flex items-center justify-center flex-shrink-0`}>
                  <report.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-0.5">{report.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{report.description}</p>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={generating === report.title}
                      onClick={() => generateReport(report.title)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      {generating === report.title ? "Generating..." : "Download CSV"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
