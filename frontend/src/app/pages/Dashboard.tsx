import { Building2, Zap, Users, FileText, Plus, Eye, BarChart3, TrendingUp, Activity } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router";

export function Dashboard() {
  const navigate = useNavigate();
  const stats = [
    {
      label: "Total Projects",
      value: "3",
      icon: Building2,
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      iconColor: "text-emerald-600",
      hoverColor: "hover:from-emerald-100 hover:to-emerald-200",
    },
    {
      label: "Active Projects",
      value: "1",
      icon: Zap,
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      hoverColor: "hover:from-blue-100 hover:to-blue-200",
    },
    {
      label: "Properties",
      value: "4",
      icon: Building2,
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
      hoverColor: "hover:from-purple-100 hover:to-purple-200",
    },
    {
      label: "Customers",
      value: "3",
      icon: Users,
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      iconColor: "text-orange-600",
      hoverColor: "hover:from-orange-100 hover:to-orange-200",
    },
  ];

  const recentProjects = [
    {
      name: "Downtown Plot Survey",
      location: "123 Main St, New York",
      status: "in progress",
      statusColor: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    },
    {
      name: "Residential Property Survey",
      location: "456 Oak Ave, Los Angeles",
      status: "pending",
      statusColor: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    },
    {
      name: "Subdivision Survey",
      location: "789 Pine Rd, Chicago",
      status: "completed",
      statusColor: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
    },
  ];

  const propertiesOverview = [
    {
      name: "Sunset Valley Estate",
      location: "Arizona, Phoenix",
      status: "available",
      statusColor: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
    },
    {
      name: "Oceanview Heights",
      location: "California, Malibu",
      status: "available",
      statusColor: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
    },
    {
      name: "Downtown Office Tower",
      location: "New York, Manhattan",
      status: "sold",
      statusColor: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    },
    {
      name: "Riverside Apartments",
      location: "Texas, Austin",
      status: "rented",
      statusColor: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 clean-bg min-h-screen p-6">
      {/* Welcome Banner */}
      <div className="modern-card rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2 welcome-banner-text drop-shadow-lg">Welcome back, Admin User!</h1>
            <p className="text-white/90 drop-shadow-md">Here's what's happening with your system</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="pricing-card hover-lift group cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 group-hover:text-gray-700 transition-colors duration-200">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.bgColor} ${stat.hoverColor} flex items-center justify-center group-hover:rotate-12 transition-all duration-300 shadow-lg`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="modern-card hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 gradient-emerald rounded-lg flex items-center justify-center shadow-lg">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">Recent Projects</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 hover:scale-105 btn-glow"
              onClick={() => navigate("/dashboard/survey-projects")}
            >
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {recentProjects.map((project, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent transition-all duration-300 hover:shadow-md hover:scale-[1.02] group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 group-hover:text-emerald-700 transition-colors duration-200">{project.name}</h3>
                  <Badge className={`${project.statusColor} transition-all duration-200 hover:scale-105`}>{project.status}</Badge>
                </div>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">{project.location}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Properties Overview */}
        <Card className="modern-card hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 gradient-purple rounded-lg flex items-center justify-center shadow-lg">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-purple-700 bg-clip-text text-transparent">Properties Overview</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 hover:scale-105 btn-glow"
              onClick={() => navigate("/dashboard/properties")}
            >
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {propertiesOverview.map((property, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent transition-all duration-300 hover:shadow-md hover:scale-[1.02] group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors duration-200">{property.name}</h3>
                  <Badge className={`${property.statusColor} transition-all duration-200 hover:scale-105`}>{property.status}</Badge>
                </div>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">{property.location}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="modern-card hover-lift">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 gradient-emerald rounded-lg flex items-center justify-center shadow-lg">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate("/dashboard/survey-projects")}
            className="pricing-card hover-lift text-left group bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-emerald rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="font-medium text-emerald-900 text-sm sm:text-base group-hover:text-emerald-800 transition-colors duration-200">New Project</h3>
          </button>

          <button 
            onClick={() => navigate("/dashboard/properties")}
            className="pricing-card hover-lift text-left group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-blue rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="font-medium text-blue-900 text-sm sm:text-base group-hover:text-blue-800 transition-colors duration-200">Add Property</h3>
          </button>

          <button 
            onClick={() => navigate("/dashboard/property-listings")}
            className="pricing-card hover-lift text-left group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-purple rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="font-medium text-purple-900 text-sm sm:text-base group-hover:text-purple-800 transition-colors duration-200">New Listing</h3>
          </button>

          <button 
            onClick={() => navigate("/dashboard/reports")}
            className="pricing-card hover-lift text-left group bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-orange rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="font-medium text-orange-900 text-sm sm:text-base group-hover:text-orange-800 transition-colors duration-200">View Reports</h3>
          </button>
        </div>
      </Card>
    </div>
  );
}
