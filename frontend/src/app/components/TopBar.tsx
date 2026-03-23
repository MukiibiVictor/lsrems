import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Search, Sun, Moon, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { NotificationCenter } from "./NotificationCenter";
import { SettingsPanel } from "./SettingsPanel";
import { HelpCenter } from "./HelpCenter";
import { ChevronDown, LogOut } from "lucide-react";
import { toast } from "sonner";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your operations" },
  "/dashboard/survey-projects": { title: "Survey Projects", subtitle: "Manage and track all projects" },
  "/dashboard/land-titles": { title: "Documents", subtitle: "Land titles and documentation" },
  "/dashboard/properties": { title: "Properties", subtitle: "Property inventory and details" },
  "/dashboard/property-listings": { title: "Listings", subtitle: "Active property listings" },
  "/dashboard/customers": { title: "Customers", subtitle: "Customer records and contacts" },
  "/dashboard/transactions": { title: "Transactions", subtitle: "Financial transactions" },
  "/dashboard/expenses": { title: "Expenses", subtitle: "Track company expenses" },
  "/dashboard/reports": { title: "Reports", subtitle: "Analytics and performance" },
  "/dashboard/users": { title: "Users", subtitle: "Manage system users" },
};

const SEARCH_PAGES = [
  { label: "Dashboard", path: "/dashboard", keywords: ["dashboard", "home", "overview"] },
  { label: "Survey Projects", path: "/dashboard/survey-projects", keywords: ["projects", "survey", "surveying"] },
  { label: "Documents", path: "/dashboard/land-titles", keywords: ["documents", "land titles", "titles", "docs"] },
  { label: "Properties", path: "/dashboard/properties", keywords: ["properties", "property", "land"] },
  { label: "Listings", path: "/dashboard/property-listings", keywords: ["listings", "listing", "for sale", "for rent"] },
  { label: "Customers", path: "/dashboard/customers", keywords: ["customers", "clients", "customer"] },
  { label: "Transactions", path: "/dashboard/transactions", keywords: ["transactions", "payments", "sales"] },
  { label: "Expenses", path: "/dashboard/expenses", keywords: ["expenses", "expense", "costs"] },
  { label: "Reports", path: "/dashboard/reports", keywords: ["reports", "analytics", "charts", "stats"] },
  { label: "Users", path: "/dashboard/users", keywords: ["users", "user", "staff", "accounts"] },
];

export function TopBar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<typeof SEARCH_PAGES>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const meta = PAGE_META[location.pathname] ?? { title: "LSREMS", subtitle: "Management System" };

  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username || "User";

  const roleLabel = user?.role?.replace(/_/g, " ") || "User";
  const initials = (user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase();

  // Filter search results
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) { setResults([]); setSearchOpen(false); return; }
    const filtered = SEARCH_PAGES.filter(
      (p) => p.label.toLowerCase().includes(q) || p.keywords.some((k) => k.includes(q))
    );
    setResults(filtered);
    setSearchOpen(filtered.length > 0);
  }, [search]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleSearchSelect = (path: string) => {
    navigate(path);
    setSearch("");
    setSearchOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center px-6 gap-4
      bg-white/90 dark:bg-gray-900/90 backdrop-blur-md
      border-b border-gray-200 dark:border-gray-700 shadow-sm">

      {/* Left: Page title */}
      <div className="flex-shrink-0 min-w-[160px]">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">{meta.title}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{meta.subtitle}</p>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-auto relative" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => results.length > 0 && setSearchOpen(true)}
          placeholder="Search pages..."
          className="pl-9 pr-8 h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:bg-white dark:focus:bg-gray-700 transition-colors"
        />
        {search && (
          <button
            onClick={() => { setSearch(""); setSearchOpen(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {/* Search results dropdown */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 overflow-hidden">
            {results.map((r) => (
              <button
                key={r.path}
                onClick={() => handleSearchSelect(r.path)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-left"
              >
                <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-9 h-9 p-0 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <NotificationCenter />
        <HelpCenter />
        <SettingsPanel />

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white leading-tight max-w-[120px] truncate">{displayName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize leading-tight">{roleLabel}</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{displayName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{roleLabel}</div>
              </div>
              <button
                onClick={() => { setDropdownOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
