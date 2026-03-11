import { Building2, Zap, Users, FileText, Plus, Eye, BarChart3 } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export function Dashboard() {
  const stats = [
    {
      label: "Total Projects",
      value: "3",
      icon: Building2,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Active Projects",
      value: "1",
      icon: Zap,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Properties",
      value: "4",
      icon: Building2,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Customers",
      value: "3",
      icon: Users,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  const recentProjects = [
    {
      name: "Downtown Plot Survey",
      location: "123 Main St, New York",
      status: "in progress",
      statusColor: "bg-blue-100 text-blue-700",
    },
    {
      name: "Residential Property Survey",
      location: "456 Oak Ave, Los Angeles",
      status: "pending",
      statusColor: "bg-yellow-100 text-yellow-700",
    },
    {
      name: "Subdivision Survey",
      location: "789 Pine Rd, Chicago",
      status: "completed",
      statusColor: "bg-emerald-100 text-emerald-700",
    },
  ];

  const propertiesOverview = [
    {
      name: "Sunset Valley Estate",
      location: "Arizona, Phoenix",
      status: "available",
      statusColor: "bg-emerald-100 text-emerald-700",
    },
    {
      name: "Oceanview Heights",
      location: "California, Malibu",
      status: "available",
      statusColor: "bg-emerald-100 text-emerald-700",
    },
    {
      name: "Downtown Office Tower",
      location: "New York, Manhattan",
      status: "sold",
      statusColor: "bg-gray-100 text-gray-700",
    },
    {
      name: "Riverside Apartments",
      location: "Texas, Austin",
      status: "rented",
      statusColor: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Admin User!</h1>
        <p className="text-emerald-50">Here's what's happening with your system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {recentProjects.map((project, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <Badge className={project.statusColor}>{project.status}</Badge>
                </div>
                <p className="text-sm text-gray-600">{project.location}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Properties Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Properties Overview</h2>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {propertiesOverview.map((property, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{property.name}</h3>
                  <Badge className={property.statusColor}>{property.status}</Badge>
                </div>
                <p className="text-sm text-gray-600">{property.location}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-6 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors text-left group">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-medium text-emerald-900">New Project</h3>
          </button>

          <button className="p-6 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors text-left group">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-medium text-emerald-900">Add Property</h3>
          </button>

          <button className="p-6 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors text-left group">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-medium text-emerald-900">New Listing</h3>
          </button>

          <button className="p-6 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors text-left group">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-medium text-emerald-900">View Reports</h3>
          </button>
        </div>
      </Card>
    </div>
  );
}
