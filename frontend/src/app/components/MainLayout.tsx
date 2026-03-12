import { Outlet, NavLink, useNavigate } from "react-router";
import { Building2, LayoutDashboard, FolderKanban, FileText, Home, List, Users as UsersIcon, DollarSign, BarChart3, LogOut, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { Footer } from "./Footer";

export function MainLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/dashboard/survey-projects", icon: FolderKanban, label: "Projects" },
    { to: "/dashboard/land-titles", icon: FileText, label: "Documents" },
    { to: "/dashboard/properties", icon: Home, label: "Properties" },
    { to: "/dashboard/property-listings", icon: List, label: "Listings" },
    { to: "/dashboard/customers", icon: UsersIcon, label: "Customers" },
    { to: "/dashboard/transactions", icon: DollarSign, label: "Transactions" },
    { to: "/dashboard/reports", icon: BarChart3, label: "Reports" },
    { to: "/dashboard/users", icon: UsersIcon, label: "Users" },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen clean-bg flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center shadow-sm">
                <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-semibold text-gray-900">LSREMS</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`
          w-64 glass-effect border-r border-gray-200 fixed h-screen flex flex-col z-50 transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto lg:bg-white/95 lg:backdrop-blur-sm
        `}>
          {/* Logo */}
          <div className="p-6 border-b border-gray-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-200 transition-all duration-300 group-hover:scale-105">
                  <Building2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duration-200">LSREMS</span>
                  <p className="text-xs text-gray-500">Management</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSidebar}
                className="lg:hidden hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 font-medium shadow-sm border border-emerald-200"
                        : "text-gray-600 hover:text-emerald-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent hover:shadow-sm hover:scale-[1.02] hover:border hover:border-emerald-100"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-gray-200/80">
            <div className="flex items-center gap-3 mb-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
                <span className="text-emerald-700 font-medium text-sm">
                  {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-700 transition-colors duration-200">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username || 'User'}
                </div>
                <div className="text-xs text-gray-500 capitalize truncate">
                  {user?.role?.replace('_', ' ') || 'Administrator'}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 hidden lg:flex transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-16 lg:pt-0">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer - Full Width at Bottom */}
      <Footer />
    </div>
  );
}
