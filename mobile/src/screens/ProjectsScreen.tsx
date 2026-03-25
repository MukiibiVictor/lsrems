import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";
import { projectService } from "../services/api";

const STATUS_COLOR: Record<string, string> = {
  pending: "#f59e0b",
  survey_in_progress: "#3b82f6",
  submitted_to_land_office: "#8b5cf6",
  completed: "#10b981",
};

function formatStatus(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

export function ProjectsScreen() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const data = await projectService.list();
      setProjects(data);
      setFiltered(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(projects.filter(p =>
      p.project_name?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q)
    ));
  }, [search, projects]);

  const renderItem = ({ item }: { item: any }) => {
    const color = STATUS_COLOR[item.status] || "#6b7280";
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        <View style={styles.cardTop}>
          <Text style={styles.cardId}>#{item.id}</Text>
          <View style={[styles.badge, { backgroundColor: color + "20" }]}>
            <Text style={[styles.badgeText, { color }]}>{formatStatus(item.status)}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.project_name}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={13} color={colors.textDim} />
          <Text style={styles.cardSub}>{item.location}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={13} color={colors.textDim} />
          <Text style={styles.cardSub}>{item.customer?.name || "—"}</Text>
        </View>
        {item.created_at && (
          <Text style={styles.date}>{item.created_at.slice(0, 10)}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.textDim} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
          placeholderTextColor={colors.textDim}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No projects found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, margin: spacing.lg,
    borderRadius: radius.md, paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.border, height: 46,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 32 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: 12,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardId: { fontSize: 12, color: colors.textDim, fontWeight: "600" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  badgeText: { fontSize: 10, fontWeight: "700" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  cardSub: { fontSize: 12, color: colors.textDim, flex: 1 },
  date: { fontSize: 11, color: colors.textDim, marginTop: 6, textAlign: "right" },
  empty: { textAlign: "center", color: colors.textDim, marginTop: 48 },
});
