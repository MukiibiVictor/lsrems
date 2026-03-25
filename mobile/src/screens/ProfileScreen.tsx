import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

export function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: "person-outline", label: "Account Details", color: "#10b981" },
    { icon: "notifications-outline", label: "Notifications", color: "#3b82f6" },
    { icon: "shield-checkmark-outline", label: "Security", color: "#8b5cf6" },
    { icon: "help-circle-outline", label: "Help & Support", color: "#f59e0b" },
    { icon: "information-circle-outline", label: "About LSREMS", color: "#6b7280" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.username || user?.email || "U")[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.username || "User"}</Text>
        <Text style={styles.email}>{user?.email || ""}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role || "staff"}</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: item.color + "15" }]}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>LSREMS Mobile v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 48 },
  avatarSection: { alignItems: "center", marginBottom: spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
    marginBottom: spacing.md, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  avatarText: { fontSize: 32, fontWeight: "900", color: "#fff" },
  name: { fontSize: 20, fontWeight: "800", color: colors.text },
  email: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  roleBadge: {
    marginTop: 8, backgroundColor: colors.primary + "20",
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full,
  },
  roleText: { fontSize: 12, color: colors.primary, fontWeight: "700", textTransform: "capitalize" },
  menu: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: "row", alignItems: "center", padding: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  menuIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 14, color: colors.text, fontWeight: "500" },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.danger + "15", borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.danger + "30",
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: colors.danger },
  version: { textAlign: "center", color: colors.textDim, fontSize: 12, marginTop: spacing.xl },
});
