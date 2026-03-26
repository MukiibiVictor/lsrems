import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Animated, Easing,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radius } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { propertyService, projectService, transactionService, expenseService, notificationService, api } from "../services/api";

const PALETTE = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(Math.round(n));
}

const STATUS_COLOR: Record<string, string> = {
  pending: "#f59e0b",
  survey_in_progress: "#3b82f6",
  submitted_to_land_office: "#8b5cf6",
  completed: "#10b981",
};

function formatStatus(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

// Marquee banner
const BANNER = ["500+ Projects", "98% Satisfaction", "15 yrs Experience", "1200+ Acres Surveyed", "50+ Surveyors", "30+ Districts"];

function MarqueeBanner() {
  const { width } = useWindowDimensions();
  const tx = useRef(new Animated.Value(0)).current;
  const ITEM_W = 160;

  useEffect(() => {
    Animated.loop(
      Animated.timing(tx, { toValue: -(BANNER.length * ITEM_W), duration: 14000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  return (
    <View style={banner.wrap}>
      <View style={banner.fadeL} pointerEvents="none" />
      <View style={banner.fadeR} pointerEvents="none" />
      <Animated.View style={[banner.track, { transform: [{ translateX: tx }] }]}>
        {[...BANNER, ...BANNER].map((item, i) => (
          <View key={i} style={banner.item}>
            <View style={banner.dot} />
            <Text style={banner.text}>{item}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export function DashboardScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState({ properties: 0, projects: 0, transactions: 0, expenses: 0 });
  const [reportTotals, setReportTotals] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [props, projs, txns, exps, notifs, dashRes, reportRes] = await Promise.allSettled([
        propertyService.list(),
        projectService.list(),
        transactionService.list(),
        expenseService.list(),
        notificationService.unreadCount(),
        api.get("/dashboard/stats/"),
        api.get("/reports/stats/"),
      ]);
      setStats({
        properties: props.status === "fulfilled" && Array.isArray(props.value) ? props.value.length : 0,
        projects:   projs.status === "fulfilled" && Array.isArray(projs.value) ? projs.value.length : 0,
        transactions: txns.status === "fulfilled" && Array.isArray(txns.value) ? txns.value.length : 0,
        expenses:   exps.status === "fulfilled" && Array.isArray(exps.value) ? exps.value.length : 0,
      });
      if (notifs.status === "fulfilled") setUnreadCount(notifs.value);
      if (dashRes.status === "fulfilled") setRecentProjects(dashRes.value.data?.recent_projects || []);
      if (reportRes.status === "fulfilled") setReportTotals(reportRes.value.data?.totals || null);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const statCards = [
    { label: "Properties",   value: stats.properties,   icon: "business-outline",        color: PALETTE[0], screen: "More" },
    { label: "Projects",     value: stats.projects,     icon: "map-outline",             color: PALETTE[1], screen: "Projects" },
    { label: "Transactions", value: stats.transactions, icon: "swap-horizontal-outline", color: PALETTE[2], screen: "More" },
    { label: "Expenses",     value: stats.expenses,     icon: "receipt-outline",         color: PALETTE[3], screen: "More" },
  ];

  const overdueProjects = recentProjects.filter(p => p.is_overdue);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{(user?.username || "U")[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.greetingText}>{greeting()},</Text>
          <Text style={styles.username} numberOfLines={1}>{user?.first_name || user?.username}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString("en-UG", { weekday: "short", month: "short", day: "numeric" })}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate("Notifications")}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── REVENUE CARD ── */}
      {reportTotals && (
        <View style={styles.revenueCard}>
          <View style={styles.revenueRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.revenueLabel}>Total Revenue</Text>
              <Text style={styles.revenueValue}>UGX {fmtMoney(reportTotals.revenue || 0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.revenueLabel}>Net Profit</Text>
              <Text style={[styles.revenueValue, { color: (reportTotals.profit || 0) >= 0 ? "#34d399" : "#f87171" }]}>
                UGX {fmtMoney(reportTotals.profit || 0)}
              </Text>
            </View>
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.revenueLabel}>Expenses</Text>
              <Text style={[styles.revenueValue, { color: "#f87171", fontSize: 16 }]}>UGX {fmtMoney(reportTotals.expenses || 0)}</Text>
            </View>
            <TouchableOpacity style={styles.revenueBtn} onPress={() => navigation.navigate("More", { screen: "Reports" })}>
              <Text style={styles.revenueBtnText}>Full Report</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── MARQUEE ── */}
      <MarqueeBanner />

      {/* ── OVERDUE ALERT ── */}
      {overdueProjects.length > 0 && (
        <TouchableOpacity style={styles.alertCard} onPress={() => navigation.navigate("Projects")}>
          <Ionicons name="warning-outline" size={18} color="#ef4444" />
          <Text style={styles.alertText}>{overdueProjects.length} project{overdueProjects.length > 1 ? "s" : ""} overdue — tap to review</Text>
          <Ionicons name="chevron-forward" size={16} color="#ef4444" />
        </TouchableOpacity>
      )}

      {/* ── STAT CARDS ── */}
      <Text style={styles.sectionTitle}>Overview</Text>
      {loading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} /> : (
        <View style={styles.statsGrid}>
          {statCards.map((s) => (
            <TouchableOpacity key={s.label} style={styles.statCard} onPress={() => navigation.navigate(s.screen)} activeOpacity={0.8}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "20" }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── RECENT PROJECTS ── */}
      {recentProjects.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Projects</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Projects")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
            {recentProjects.slice(0, 5).map((p: any) => {
              const color = STATUS_COLOR[p.status] || "#6b7280";
              return (
                <TouchableOpacity key={p.id} style={styles.projectCard} onPress={() => navigation.navigate("Projects")} activeOpacity={0.8}>
                  <View style={[styles.projectStatusBar, { backgroundColor: color }]} />
                  <View style={styles.projectBody}>
                    <Text style={styles.projectName} numberOfLines={2}>{p.project_name}</Text>
                    <View style={styles.projectRow}>
                      <Ionicons name="person-outline" size={11} color={colors.textDim} />
                      <Text style={styles.projectSub} numberOfLines={1}> {p.customer?.name || "—"}</Text>
                    </View>
                    <View style={styles.projectRow}>
                      <Ionicons name="location-outline" size={11} color={colors.textDim} />
                      <Text style={styles.projectSub} numberOfLines={1}> {p.location}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: color + "20" }]}>
                      <Text style={[styles.statusText, { color }]}>{formatStatus(p.status)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* ── QUICK ACTIONS ── */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {[
          { label: "New Project",    icon: "add-circle-outline",      color: PALETTE[0], screen: "Projects" },
          { label: "Add Property",   icon: "home-outline",            color: PALETTE[1], screen: "More" },
          { label: "Add Customer",   icon: "person-add-outline",      color: PALETTE[2], screen: "More" },
          { label: "Add Expense",    icon: "card-outline",            color: PALETTE[3], screen: "More" },
          { label: "Documents",      icon: "folder-outline",          color: "#06b6d4",  screen: "More" },
          { label: "Reports",        icon: "bar-chart-outline",       color: "#ec4899",  screen: "More" },
        ].map((a) => (
          <TouchableOpacity key={a.label} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.75}>
            <View style={[styles.actionIcon, { backgroundColor: a.color + "20" }]}>
              <Ionicons name={a.icon as any} size={22} color={a.color} />
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  );
}

const banner = StyleSheet.create({
  wrap: { height: 40, overflow: "hidden", marginBottom: spacing.md, position: "relative" },
  track: { flexDirection: "row", alignItems: "center", height: 40 },
  item: { flexDirection: "row", alignItems: "center", width: 160, paddingHorizontal: 8, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  text: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  fadeL: { position: "absolute", left: 0, top: 0, bottom: 0, width: 24, zIndex: 2 },
  fadeR: { position: "absolute", right: 0, top: 0, bottom: 0, width: 24, zIndex: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },

  // Header
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: spacing.lg },
  avatarWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  avatarText: { fontSize: 20, fontWeight: "900", color: "#fff" },
  greetingText: { fontSize: 12, color: colors.textMuted },
  username: { fontSize: 18, fontWeight: "900", color: colors.text },
  dateText: { fontSize: 11, color: colors.textDim, marginTop: 1 },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: { position: "relative", width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: 2, right: 2, backgroundColor: colors.danger, borderRadius: 8, minWidth: 15, height: 15, alignItems: "center", justifyContent: "center", paddingHorizontal: 2 },
  badgeText: { fontSize: 8, color: "#fff", fontWeight: "900" },

  // Revenue card
  revenueCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  revenueRow: { flexDirection: "row", alignItems: "center" },
  revenueLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  revenueValue: { fontSize: 20, fontWeight: "900", color: "#34d399" },
  revenueDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  revenueBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.primary + "15", paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full },
  revenueBtnText: { fontSize: 12, color: colors.primary, fontWeight: "700" },

  // Alert
  alertCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#ef444415", borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: "#ef444430" },
  alertText: { flex: 1, fontSize: 13, color: "#ef4444", fontWeight: "600" },

  // Stats
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: "600" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: spacing.lg },
  statCard: { flex: 1, minWidth: "45%", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  statIcon: { width: 38, height: 38, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  statValue: { fontSize: 26, fontWeight: "900", color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  // Recent projects horizontal scroll
  hScroll: { marginBottom: spacing.lg, marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
  projectCard: { width: 180, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginRight: 10, overflow: "hidden" },
  projectStatusBar: { height: 4 },
  projectBody: { padding: spacing.md },
  projectName: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 8 },
  projectRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  projectSub: { fontSize: 11, color: colors.textDim, flex: 1 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, marginTop: 8 },
  statusText: { fontSize: 10, fontWeight: "700" },

  // Quick actions
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCard: { flex: 1, minWidth: "30%", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: "center", paddingVertical: spacing.lg },
  actionIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  actionLabel: { fontSize: 11, fontWeight: "600", color: colors.text, textAlign: "center" },
});
