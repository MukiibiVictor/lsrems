import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radius } from "../constants/theme";

const MENU = [
  { label: "Properties",   icon: "business-outline",        color: "#10b981", screen: "Properties" },
  { label: "Customers",    icon: "people-outline",           color: "#3b82f6", screen: "Customers" },
  { label: "Transactions", icon: "swap-horizontal-outline",  color: "#8b5cf6", screen: "Transactions" },
  { label: "Expenses",     icon: "receipt-outline",          color: "#f59e0b", screen: "Expenses" },
  { label: "Documents",    icon: "folder-outline",           color: "#06b6d4", screen: "Documents" },
  { label: "Reports",      icon: "bar-chart-outline",        color: "#ec4899", screen: "Reports" },
];

export function MoreScreen() {
  const navigation = useNavigation<any>();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>More</Text>
      <View style={styles.grid}>
        {MENU.map(item => (
          <TouchableOpacity key={item.label} style={styles.card} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.75}>
            <View style={[styles.icon, { backgroundColor: item.color + "20" }]}>
              <Ionicons name={item.icon as any} size={26} color={item.color} />
            </View>
            <Text style={styles.label}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textDim} style={{ marginTop: 2 }} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: "900", color: colors.text, marginBottom: spacing.lg },
  grid: { gap: 10 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  icon: { width: 46, height: 46, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  label: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.text },
});
