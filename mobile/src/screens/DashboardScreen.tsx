import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { propertyService, projectService, transactionService, expenseService } from "../services/api";

interface StatCard { label: string; value: string | number; icon: string; color: string; }

export function DashboardScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ properties: 0, projects: 0, transactions: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [props, projs, txns, exps] = await Promise.allSettled([
        propertyService.list(),
        projectService.list(),
        transactionService.list(),
        expenseService.list(),
      ]);
      setStats({
        properties: props.status === "fulfilled" ? props.value.length : 0,
        projects: projs.status === "fulfilled" ? projs.value.length : 0,
        transactions: txns.status === "fulfilled" ? txns.value.length : 0,
        expenses: exps.status === "fulfilled" ? exps.value.length : 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const statCards: StatCard[] = [
    { label: "Properties", value: stats.properties, icon: "business-outline", color: "#10b981" },
    { label: "Projects", value: stats.projects, icon: "map-outline", color: "#3b82f6" },
    { label: "Transactions", value: stats.transactions, icon: "swap-horizontal-outline", color: "#8b5cf6" },
    { label: "Expenses", value: stats.expenses, icon: "receipt-outline", color: "#f59e0b" },
  ];

  const quickActions = [
    { label: "New Project", icon: "add-circle-outline", color: "#10b981" },
    { label: "Add Property", icon: "home-outline", color: "#3b82f6" },
    { label: "Record Expense", icon: "card-outline", color: "#f59e0b" },
    { label: "Add Customer", icon: "person-add-outline", color: "#8b5cf6" },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day,</Text>
          <Text style={styles.username}>{user?.username || user?.email || "User"} 👋</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Brand strip */}
      <View style={styles.brandStrip}>
        <View style={styles.brandIcon}>
          <Ionicons name="business" size={20} color="#fff" />
        </View>
        <View>
          <Text style={styles.brandName}>LSREMS</Text>
          <Text style={styles.brandSub}>Land Surveying & Real Estate</Text>
        </View>
      </View>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Overview</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 32 }} />
      ) : (
        <View style={styles.statsGrid}>
          {statCards.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "20" }]}>
                <Ionicons name={s.icon as any} size={22} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((a) => (
          <TouchableOpacity key={a.label} style={styles.actionCard} activeOpacity={0.75}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 32 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.lg },
  greeting: { fontSize: 14, color: colors.textMuted },
  username: { fontSize: 22, fontWeight: "800", color: colors.text },
  logoutBtn: { padding: 8, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  brandStrip: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  brandIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  brandName: { fontSize: 16, fontWeight: "800", color: colors.text },
  brandSub: { fontSize: 11, color: colors.textMuted },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: spacing.xl },
  statCard: {
    flex: 1, minWidth: "45%", backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, alignItems: "flex-start",
  },
  statIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  statValue: { fontSize: 28, fontWeight: "900", color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionCard: {
    flex: 1, minWidth: "45%", backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", paddingVertical: spacing.lg,
  },
  actionIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  actionLabel: { fontSize: 13, fontWeight: "600", color: colors.text, textAlign: "center" },
});
