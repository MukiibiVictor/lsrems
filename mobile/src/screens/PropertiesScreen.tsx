import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";
import { propertyService } from "../services/api";

const STATUS_COLOR: Record<string, string> = {
  available: "#10b981", sold: "#6b7280", rented: "#3b82f6", reserved: "#f59e0b",
};

export function PropertiesScreen() {
  const [properties, setProperties] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const data = await propertyService.list();
      setProperties(data);
      setFiltered(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(properties.filter(p =>
      p.property_name?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q)
    ));
  }, [search, properties]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons name="home-outline" size={20} color={colors.primary} />
        </View>
        <View style={[styles.badge, { backgroundColor: (STATUS_COLOR[item.status] || "#6b7280") + "20" }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] || "#6b7280" }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>{item.property_name}</Text>
      <View style={styles.cardRow}>
        <Ionicons name="location-outline" size={13} color={colors.textDim} />
        <Text style={styles.cardSub} numberOfLines={1}>{item.location}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardType}>{item.property_type}</Text>
        {item.price && (
          <Text style={styles.cardPrice}>
            UGX {Number(item.price).toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.textDim} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search properties..."
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
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No properties found</Text>}
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
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardIcon: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.primary + "15", alignItems: "center", justifyContent: "center" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  badgeText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
  cardTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 4 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 8 },
  cardSub: { fontSize: 12, color: colors.textDim, flex: 1 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  cardType: { fontSize: 11, color: colors.textMuted, textTransform: "capitalize", backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  cardPrice: { fontSize: 12, fontWeight: "700", color: colors.primary },
  empty: { textAlign: "center", color: colors.textDim, marginTop: 48 },
});
