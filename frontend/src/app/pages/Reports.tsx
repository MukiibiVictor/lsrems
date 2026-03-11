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

export function Reports() {
  const reportTypes = [
    {
      title: "Revenue Report",
      description: "Analyze sales and rental income over time",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
      lastGenerated: "2026-03-08",
    },
    {
      title: "Project Status Report",
      description: "Overview of all survey projects and their current status",
      icon: BarChart3,
      color: "bg-blue-50 text-blue-600",
      lastGenerated: "2026-03-09",
    },
    {
      title: "Property Inventory",
      description: "Complete list of properties and their availability status",
      icon: PieChart,
      color: "bg-purple-50 text-purple-600",
      lastGenerated: "2026-03-10",
    },
    {
      title: "Customer Report",
      description: "Customer demographics and engagement metrics",
      icon: FileText,
      color: "bg-orange-50 text-orange-600",
      lastGenerated: "2026-03-07",
    },
  ];

  const recentReports = [
    {
      name: "Monthly Revenue Report - February 2026",
      type: "Revenue",
      generatedBy: "Admin User",
      date: "2026-03-01",
      size: "2.4 MB",
    },
    {
      name: "Project Status Summary - Q1 2026",
      type: "Projects",
      generatedBy: "Admin User",
      date: "2026-02-28",
      size: "1.8 MB",
    },
    {
      name: "Property Inventory Report",
      type: "Properties",
      generatedBy: "Admin User",
      date: "2026-02-25",
      size: "3.1 MB",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">Generate and download system reports and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="30">
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Total Reports</div>
          <div className="text-2xl font-bold text-gray-900">24</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">This Month</div>
          <div className="text-2xl font-bold text-emerald-600">8</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Last Generated</div>
          <div className="text-2xl font-bold text-gray-900">Today</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Auto Reports</div>
          <div className="text-2xl font-bold text-blue-600">4</div>
        </Card>
      </div>

      {/* Report Types */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate New Report</h2>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Last: {report.lastGenerated}</span>
                    </div>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Download className="w-3 h-3 mr-1" />
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
          <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {recentReports.map((report, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>Generated by {report.generatedBy}</span>
                    <span>•</span>
                    <span>{report.date}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Automated Reports */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Scheduled Reports</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Monthly Revenue Report</h4>
                <p className="text-sm text-gray-600">Generates on the 1st of each month</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-emerald-600 font-medium">Active</span>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Weekly Project Status</h4>
                <p className="text-sm text-gray-600">Generates every Monday at 9:00 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-emerald-600 font-medium">Active</span>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
