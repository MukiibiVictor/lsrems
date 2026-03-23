import { useState, useEffect, useCallback } from "react";
import { Bell, X, CheckCircle, AlertCircle, Info, Calendar, DollarSign, FileText, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { transactionService, projectService, customerService } from "../../services";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: "report" | "booking" | "transaction" | "system" | "project";
}

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className = "" }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const buildNotifications = useCallback(async () => {
    setLoading(true);
    const built: Notification[] = [];

    try {
      const txnRes = await transactionService.getAll();
      const txns: any[] = (txnRes as any).results ?? (txnRes as any) ?? [];
      (Array.isArray(txns) ? txns : []).slice(0, 5).forEach((t: any) => {
        const propName = t.property?.property_name || t.property_name || "a property";
        built.push({
          id: `txn-${t.id}`,
          type: "success",
          title: `${t.transaction_type === "sale" ? "Sale" : "Rental"} Recorded`,
          message: `${propName} — ${Number(t.price || 0).toLocaleString()}`,
          timestamp: t.transaction_date ? new Date(t.transaction_date).toISOString() : new Date().toISOString(),
          read: false,
          category: "transaction",
        });
      });
    } catch { /* skip */ }

    try {
      const projRes = await projectService.getAll();
      const projects: any[] = (projRes as any).results ?? (projRes as any) ?? [];
      (Array.isArray(projects) ? projects : []).forEach((p: any) => {
        if (p.status === "pending") {
          built.push({
            id: `proj-pending-${p.id}`,
            type: "warning",
            title: "Project Awaiting Action",
            message: `"${p.project_name}" is pending — assign a surveyor or start work.`,
            timestamp: p.created_at || new Date().toISOString(),
            read: false,
            category: "project",
          });
        }
        if (p.is_overdue) {
          built.push({
            id: `proj-overdue-${p.id}`,
            type: "error",
            title: "Project Overdue",
            message: `"${p.project_name}" has passed its deadline.`,
            timestamp: p.updated_at || new Date().toISOString(),
            read: false,
            category: "project",
          });
        }
        if (p.needs_reminder && p.days_until_deadline != null) {
          built.push({
            id: `proj-reminder-${p.id}`,
            type: "info",
            title: "Deadline Approaching",
            message: `"${p.project_name}" deadline in ${p.days_until_deadline} day(s).`,
            timestamp: new Date().toISOString(),
            read: false,
            category: "project",
          });
        }
      });
    } catch { /* skip */ }

    try {
      const custRes = await customerService.getAll();
      const customers: any[] = (custRes as any).results ?? (custRes as any) ?? [];
      (Array.isArray(customers) ? customers : []).slice(0, 3).forEach((c: any) => {
        built.push({
          id: `cust-${c.id}`,
          type: "info",
          title: "Customer Registered",
          message: `${c.name} has been added to the system.`,
          timestamp: c.created_at || new Date().toISOString(),
          read: true,
          category: "booking",
        });
      });
    } catch { /* skip */ }

    built.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setNotifications((prev) => {
      const readIds = new Set(prev.filter((n) => n.read).map((n) => n.id));
      return built.map((n) => ({ ...n, read: readIds.has(n.id) }));
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    buildNotifications();
    const interval = setInterval(buildNotifications, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [buildNotifications]);

  const handleOpen = () => {
    setIsOpen(true);
    buildNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAsRead = (id: string) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllAsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const remove = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const typeIcon = (type: Notification["type"]) => {
    if (type === "success") return <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />;
    if (type === "warning") return <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
    if (type === "error") return <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
    return <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />;
  };

  const catIcon = (cat: Notification["category"]) => {
    if (cat === "transaction") return <DollarSign className="w-3.5 h-3.5 text-gray-400" />;
    if (cat === "project") return <Calendar className="w-3.5 h-3.5 text-gray-400" />;
    if (cat === "booking") return <Users className="w-3.5 h-3.5 text-gray-400" />;
    if (cat === "report") return <FileText className="w-3.5 h-3.5 text-gray-400" />;
    return <Bell className="w-3.5 h-3.5 text-gray-400" />;
  };

  const timeAgo = (ts: string) => {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <>
      {/* Bell trigger button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className={`relative hover:bg-gray-100 transition-colors duration-200 ${className}`}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs pointer-events-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Slide-in panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[380px] sm:w-[420px] p-0 flex flex-col">
          <SheetHeader className="px-4 py-4 border-b flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-base font-semibold">
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">{unreadCount}</Badge>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}
                className="text-xs text-emerald-600 hover:text-emerald-700 h-7">
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
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? "bg-blue-50/40 border-l-2 border-l-blue-400" : ""}`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{typeIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {catIcon(n.category)}
                          <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                          {!n.read && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-600 mb-1.5 leading-relaxed">{n.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{timeAgo(n.timestamp)}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                            className="text-gray-300 hover:text-red-500 transition-colors p-0.5 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <>
              <Separator />
              <div className="p-3">
                <Button variant="ghost" size="sm"
                  className="w-full text-gray-500 hover:text-gray-700 text-xs"
                  onClick={() => { remove("all"); setNotifications([]); }}>
                  Clear all notifications
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
