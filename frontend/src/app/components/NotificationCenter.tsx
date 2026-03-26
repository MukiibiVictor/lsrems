import { useState, useEffect, useCallback } from "react";
import { Bell, X, CheckCircle, AlertCircle, Info, MapPin, Home, DollarSign, Users, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { apiClient } from "../../services/api";

interface BackendNotif {
  id: number;
  notif_type: string;
  title: string;
  message: string;
  is_read: boolean;
  project_id: number | null;
  property_id: number | null;
  sender_name: string;
  created_at: string;
}

const TYPE_ICON: Record<string, { icon: any; color: string }> = {
  project_assigned:   { icon: MapPin,      color: "text-blue-500" },
  project_claimed:    { icon: CheckCircle, color: "text-purple-500" },
  project_status:     { icon: RefreshCw,   color: "text-yellow-500" },
  project_completed:  { icon: CheckCircle, color: "text-emerald-500" },
  project_overdue:    { icon: AlertCircle, color: "text-red-500" },
  new_project:        { icon: MapPin,      color: "text-blue-500" },
  new_property:       { icon: Home,        color: "text-emerald-500" },
  new_customer:       { icon: Users,       color: "text-purple-500" },
  new_expense:        { icon: DollarSign,  color: "text-yellow-500" },
  new_transaction:    { icon: DollarSign,  color: "text-pink-500" },
  general:            { icon: Info,        color: "text-gray-400" },
};

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationCenter({ className = "" }: { className?: string }) {
  const [notifications, setNotifications] = useState<BackendNotif[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any>("/notifications/?page_size=50");
      setNotifications(data.results || data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, [load]);

  const markRead = async (id: number) => {
    try {
      await apiClient.post(`/notifications/${id}/mark-read/`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await apiClient.post("/notifications/mark-all-read/", {});
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch { /* silent */ }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <Button
        variant="ghost" size="sm"
        onClick={() => { setIsOpen(true); load(); }}
        className={`relative hover:bg-gray-100 transition-colors ${className}`}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs pointer-events-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[380px] sm:w-[420px] p-0 flex flex-col">
          <SheetHeader className="px-4 py-4 border-b flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-base font-semibold">
              Notifications
              {unreadCount > 0 && <Badge className="ml-2 bg-red-500 text-white text-xs">{unreadCount}</Badge>}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-emerald-600 hover:text-emerald-700 h-7">
                Mark all read
              </Button>
            )}
          </SheetHeader>

          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center">
                <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">Activity will appear here automatically</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(n => {
                  const meta = TYPE_ICON[n.notif_type] || TYPE_ICON.general;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? "bg-blue-50/40" : ""}`}
                      onClick={() => !n.is_read && markRead(n.id)}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        <Icon className={`w-4 h-4 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.is_read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{timeAgo(n.created_at)}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">from {n.sender_name}</span>
                        </div>
                      </div>
                      {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
