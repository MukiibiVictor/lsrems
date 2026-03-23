import { useState } from "react";
import { FileText, Download, TrendingUp, BarChart3, PieChart, Calendar } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { transactionService, propertyService, customerService } from "../../services";

export function Reports() {
  const [period, setPeriod] = useState("30");
  const [generating, setGenerating] = useState<string | null>(null);

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
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
        const data = res.results || res || [];
        const headers = ["ID", "Property", "Customer", "Type", "Amount", "Date", "Status"];
        const rows = data.map((t: any) => [
          `TXN-${String(t.id).padStart(3, "0")}`,
          t.property_name || t.property || "",
          t.customer_name || t.customer || "",
          t.transaction_type || "",
          t.price || 0,
          t.transaction_date || "",
          t.status || "",
        ]);
        downloadCSV(`revenue_report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      } else if (type === "Property Inventory") {
        const res = await propertyService.getAll();
        const data = res.results || res || [];
        const headers = ["ID", "Name", "Location", "Type", "Size", "Status"];
        const rows = data.map((p: any) => [
          p.id,
          p.property_name || "",
          p.location || "",
          p.property_type || "",
          p.size || "",
          p.status || "",
        ]);
        downloadCSV(`property_inventory_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      } else if (type === "Customer Report") {
        const res = await customerService.getAll();
        const data = res.results || res || [];
        const headers = ["ID", "Name", "Email", "Phone", "Address", "Created"];
        const rows = data.map((c: any) => [
          c.id,
          c.name || "",
          c.email || "",
          c.phone || "",
          `"${(c.address || "").replace(/"/g, '""')}"`,
          c.created_at ? c.created_at.slice(0, 10) : "",
        ]);
        downloadCSV(`customer_report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      } else {
        // Project Status Report - fetch from projects API
        const res = await fetch("/api/projects/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        const json = await res.json();
        const data = json.results || json || [];
        const headers = ["ID", "Project Name", "Location", "Status", "Customer", "Surveyor", "Created"];
        const rows = data.map((p: any) => [
          p.id,
          `"${(p.project_name || "").replace(/"/g, '""')}"`,
          `"${(p.location || "").replace(/"/g, '""')}"`,
          p.status || "",
          p.customer?.name || "",
          p.surveyor?.username || "",
          p.created_at ? p.created_at.slice(0, 10) : "",
        ]);
        downloadCSV(`project_status_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      }
      toast.success(`${type} downloaded successfully`);
    } catch (error) {
      toast.error(`Failed to generate ${type}`);
    } finally {
      setGenerating(null);
    }
  };

  const reportTypes = [
    {
      title: "Revenue Report",
      description: "Analyze sales and rental income over time",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Project Status Report",
      description: "Overview of all survey projects and their current status",
      icon: BarChart3,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Property Inventory",
      description: "Complete list of properties and their availability status",
      icon: PieChart,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Customer Report",
      description: "Customer list with contact details",
      icon: FileText,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6 clean-bg min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">Generate and download system reports and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Types */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate & Download Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((report, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${report.color} flex items-center justify-center flex-shrink-0`}>
                  <report.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                  <div className="flex items-center justify-end">
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
