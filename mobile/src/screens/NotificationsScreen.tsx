import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";
import { api } from "../services/api";

const TYPE_ICON: Record<string, { icon: string; color: string }> = {
  project_assigned:   { icon: "person-add-outline",     color: "#3b82f6" },
  project_claimed:    { icon: "hand-right-outline",      color: "#8b5cf6" },
  project_status:     { icon: "refresh-circle-outline",  color: "#f59e0b" },
  project_completed:  { icon: "checkmark-circle-outline",color: "#10b981" },
  project_overdue:    { icon: "warning-outline",         color: "#ef4444" },
  new_project:        { icon: "map-outline",             color: "#3b82f6" },
  new_property:       { icon: "business-outline",        color: "#10b981" },
  new_customer:       { icon: "person-outline",          color: "#8b5cf6" },
  new_expense:        { icon: "receipt-outline",         color: "#f59e0b" },
  new_transaction:    { icon: "swap-horizontal-outline", color: "#ec4899" },
  general:            { icon: "notifications-outline",   color: "#6b7280" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/notifications/?page_size=50");
      setNotifications(res.data.results || res.data || []);
    } catch { setNotifications([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    await api.post("/notifications/mark-all-read/");
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = async (id: number) => {
    await api.post(`/notifications/${id}/mark-read/`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const renderItem = ({ item }: { item: any }) => {
    const meta = TYPE_ICON[item.notif_type] || TYPE_ICON.general;
    return (
      <TouchableOpacity
        style={[styles.item, !item.is_read && styles.itemUnread]}
        onPress={() => !item.is_read && markRead(item.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconWrap, { backgroundColor: meta.color + "20" }]}>
          <Ionicons name={meta.icon as any} size={22} color={meta.color} />
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemTitle, !item.is_read && styles.itemTitleUnread]} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.itemTime}>{timeAgo(item.created_at)}</Text>
          </View>
          <Text style={styles.itemMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.itemSender}>from {item.sender_name}</Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header actions */}
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
          <Ionicons name="checkmark-done-outline" size={16} color={colors.primary} />
          <Text style={styles.markAllText}>Mark all as read ({unreadCount})</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.textDim} />
              <Text style={styles.empty}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  markAllBtn: { flexDirection: "row", alignItems: "center", gap: 6, padding: spacing.md, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  markAllText: { fontSize: 13, color: colors.primary, fontWeight: "600" },
  list: { paddingBottom: 32 },
  item: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: spacing.md, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemUnread: { backgroundColor: colors.primary + "08" },
  iconWrap: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  itemContent: { flex: 1 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  itemTitle: { fontSize: 14, fontWeight: "600", color: colors.textMuted, flex: 1, marginRight: 8 },
  itemTitleUnread: { color: colors.text, fontWeight: "700" },
  itemTime: { fontSize: 11, color: colors.textDim },
  itemMessage: { fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: 4 },
  itemSender: { fontSize: 11, color: colors.textDim },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6, flexShrink: 0 },
  emptyWrap: { alignItems: "center", marginTop: 80, gap: 12 },
  empty: { fontSize: 15, color: colors.textDim },
});
