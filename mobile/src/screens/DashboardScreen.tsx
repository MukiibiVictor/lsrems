import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Animated, Easing, useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radius } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { propertyService, projectService, transactionService, expenseService, notificationService } from "../services/api";

const BANNER_ITEMS = [
  { value: "500+", label: "Projects Completed" },
  { value: "98%",  label: "Client Satisfaction" },
  { value: "15 yrs", label: "Experience" },
  { value: "1200+", label: "Acres Surveyed" },
  { value: "50+",  label: "Licensed Surveyors" },
  { value: "30+",  label: "Districts Covered" },
];

function MarqueeBanner() {
  const { width } = useWindowDimensions();
  const translateX = useRef(new Animated.Value(0)).current;
  const ITEM_WIDTH = 160;
  const TOTAL = BANNER_ITEMS.length * 2 * ITEM_WIDTH;

  useEffect(() => {
    translateX.setValue(0);
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -(BANNER_ITEMS.length * ITEM_WIDTH),
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const items = [...BANNER_ITEMS, ...BANNER_ITEMS];

  return (
    <View style={banner.wrapper}>
      <View style={banner.fadeLeft} pointerEvents="none" />
      <View style={banner.fadeRight} pointerEvents="none" />
      <Animated.View style={[banner.track, { transform: [{ translateX }] }]}>
        {items.map((item, i) => (
          <View key={i} style={banner.item}>
            <Text style={banner.value}>{item.value}</Text>
            <Text style={banner.dot}>·</Text>
            <Text style={banner.label}>{item.label}</Text>
            <View style={banner.divider} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export function DashboardScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState({ properties: 0, projects: 0, transactions: 0, expenses: 0, customers: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = async () => {
    try {
      const [props, projs, txns, exps, notifCount] = await Promise.allSettled([
        propertyService.list(), projectService.list(),
        transactionService.list(), expenseService.list(),
        notificationService.unreadCount(),
      ]);
      setStats({
        properties: props.status === "fulfilled" && Array.isArray(props.value) ? props.value.length : 0,
        projects:   projs.status === "fulfilled" && Array.isArray(projs.value) ? projs.value.length : 0,
        transactions: txns.status === "fulfilled" && Array.isArray(txns.value) ? txns.value.length : 0,
        expenses:   exps.status === "fulfilled"  && Array.isArray(exps.value)  ? exps.value.length  : 0,
        customers: 0,
      });
      if (notifCount.status === "fulfilled") setUnreadCount(notifCount.value);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const statCards = [
    { label: "Properties",   value: stats.properties,   icon: "business-outline",          color: "#10b981", screen: "Properties" },
    { label: "Projects",     value: stats.projects,     icon: "map-outline",               color: "#3b82f6", screen: "Projects" },
    { label: "Transactions", value: stats.transactions, icon: "swap-horizontal-outline",   color: "#8b5cf6", screen: "Transactions" },
    { label: "Expenses",     value: stats.expenses,     icon: "receipt-outline",           color: "#f59e0b", screen: "Expenses" },
  ];

  const quickActions = [
    { label: "New Project",    icon: "add-circle-outline",  color: "#10b981", screen: "Projects" },
    { label: "Add Property",   icon: "home-outline",        color: "#3b82f6", screen: "Properties" },
    { label: "Add Expense",    icon: "card-outline",        color: "#f59e0b", screen: "Expenses" },
    { label: "Add Customer",   icon: "person-add-outline",  color: "#8b5cf6", screen: "Customers" },
    { label: "New Transaction",icon: "swap-horizontal-outline", color: "#ec4899", screen: "Transactions" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day,</Text>
          <Text style={styles.username}>{user?.username || user?.email || "User"} 👋</Text>
        </View>
        <View style={styles.headerRight}>
          {/* Bell icon with badge */}
          <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate("Notifications")}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Brand card */}
      <View style={styles.brandCard}>
        <View style={styles.brandIcon}><Ionicons name="business" size={22} color="#fff" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandName}>LSREMS</Text>
          <Text style={styles.brandSub}>Land Surveying & Real Estate</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {/* Marquee banner */}
      <MarqueeBanner />

      {/* Stats */}
      <Text style={styles.sectionTitle}>Overview</Text>
      {loading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 32 }} /> : (
        <View style={styles.statsGrid}>
          {statCards.map((s) => (
            <TouchableOpacity key={s.label} style={styles.statCard} onPress={() => navigation.navigate(s.screen)} activeOpacity={0.8}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "20" }]}>
                <Ionicons name={s.icon as any} size={22} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((a) => (
          <TouchableOpacity key={a.label} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.75}>
            <View style={[styles.actionIcon, { backgroundColor: a.color + "20" }]}>
              <Ionicons name={a.icon as any} size={24} color={a.color} />
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const banner = StyleSheet.create({
  wrapper: { height: 48, overflow: "hidden", marginBottom: spacing.lg, position: "relative" },
  track: { flexDirection: "row", alignItems: "center", height: 48 },
  item: { flexDirection: "row", alignItems: "center", width: 160, paddingHorizontal: 8 },
  value: { fontSize: 16, fontWeight: "900", color: colors.text },
  dot: { fontSize: 16, color: colors.primary, marginHorizontal: 4 },
  label: { fontSize: 11, color: colors.textMuted, flex: 1 },
  divider: { width: 1, height: 20, backgroundColor: colors.border, marginLeft: 8 },
  fadeLeft: { position: "absolute", left: 0, top: 0, bottom: 0, width: 32, zIndex: 2, backgroundColor: "transparent" },
  fadeRight: { position: "absolute", right: 0, top: 0, bottom: 0, width: 32, zIndex: 2, backgroundColor: "transparent" },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 32 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.lg },
  greeting: { fontSize: 14, color: colors.textMuted },
  username: { fontSize: 22, fontWeight: "800", color: colors.text },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  bellBtn: { position: "relative", padding: 8, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  badge: { position: "absolute", top: 2, right: 2, backgroundColor: colors.danger, borderRadius: 8, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  badgeText: { fontSize: 9, color: "#fff", fontWeight: "800" },
  logoutBtn: { padding: 8, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  brandCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  brandIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  brandName: { fontSize: 16, fontWeight: "800", color: colors.text },
  brandSub: { fontSize: 11, color: colors.textMuted },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: spacing.xl },
  statCard: { flex: 1, minWidth: "45%", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: "flex-start" },
  statIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  statValue: { fontSize: 28, fontWeight: "900", color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionCard: { flex: 1, minWidth: "45%", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: "center", paddingVertical: spacing.lg },
  actionIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  actionLabel: { fontSize: 12, fontWeight: "600", color: colors.text, textAlign: "center" },
});
