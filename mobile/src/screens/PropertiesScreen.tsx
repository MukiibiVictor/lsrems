import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl, Modal, ScrollView, Alert, Image,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";
import { propertyService } from "../services/api";

const STATUS_COLOR: Record<string, string> = {
  available: "#10b981", sold: "#6b7280", rented: "#3b82f6", reserved: "#f59e0b",
};
const STATUSES = ["available", "reserved", "rented", "sold"];
const TYPES = ["land", "house", "commercial", "apartment"];

const EMPTY_FORM = { property_name: "", location: "", size: "", property_type: "land", status: "available", price: "", description: "" };

export function PropertiesScreen() {
  const [properties, setProperties] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const load = async () => {
    try { const data = await propertyService.list(); setProperties(data); setFiltered(data); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(properties.filter(p => p.property_name?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q)));
  }, [search, properties]);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setErrors({}); setModalVisible(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ property_name: p.property_name || "", location: p.location || "", size: p.size || "", property_type: p.property_type || "land", status: p.status || "available", price: p.price ? String(p.price) : "", description: p.description || "" });
    setErrors({});
    setModalVisible(true);
  };

  const validate = () => {
    const e: any = {};
    if (!form.property_name.trim()) e.property_name = "Required";
    if (!form.location.trim()) e.location = "Required";
    if (!form.size.trim()) e.size = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, price: form.price ? parseFloat(form.price) : null };
      if (editing) await propertyService.update(editing.id, payload);
      else await propertyService.create(payload);
      setModalVisible(false); load();
    } catch (e: any) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : "Failed to save property";
      Alert.alert("Error", msg);
    } finally { setSaving(false); }
  };

  const remove = (id: number) => Alert.alert("Delete", "Delete this property?", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => { try { await propertyService.remove(id); load(); } catch { Alert.alert("Error", "Failed to delete"); } } },
  ]);

  const renderItem = ({ item }: { item: any }) => {
    const color = STATUS_COLOR[item.status] || "#6b7280";
    return (
      <View style={styles.card}>
        {item.primary_image_url
          ? <Image source={{ uri: item.primary_image_url }} style={styles.cardImage} resizeMode="cover" />
          : <View style={styles.cardImagePlaceholder}><Ionicons name="home-outline" size={32} color={colors.textDim} /></View>}
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.property_name}</Text>
            <View style={[styles.badge, { backgroundColor: color + "20" }]}>
              <Text style={[styles.badgeText, { color }]}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.row}><Ionicons name="location-outline" size={12} color={colors.textDim} /><Text style={styles.cardSub} numberOfLines={1}> {item.location}</Text></View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardType}>{item.property_type} · {item.size}</Text>
            {item.price && <Text style={styles.cardPrice}>UGX {Number(item.price).toLocaleString()}</Text>}
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}><Ionicons name="pencil-outline" size={14} color={colors.primary} /><Text style={[styles.actionText, { color: colors.primary }]}> Edit</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => remove(item.id)} style={styles.actionBtn}><Ionicons name="trash-outline" size={14} color={colors.danger} /><Text style={[styles.actionText, { color: colors.danger }]}> Delete</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={colors.textDim} style={{ marginRight: 6 }} />
          <TextInput style={styles.searchInput} placeholder="Search properties..." placeholderTextColor={colors.textDim} value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Ionicons name="add" size={22} color="#fff" /></TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} /> : (
        <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No properties found</Text>} />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editing ? "Edit Property" : "Add Property"}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={22} color={colors.text} /></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Text fields */}
                {([["property_name", "Property Name *", "home-outline", "default"], ["location", "Location *", "location-outline", "default"], ["size", "Size * (e.g. 50x100ft)", "resize-outline", "default"], ["price", "Price (UGX)", "cash-outline", "numeric"], ["description", "Description", "document-text-outline", "default"]] as [string,string,string,string][]).map(([key, label, icon, kb]) => (
                  <View key={key} style={styles.field}>
                    <Text style={styles.label}>{label}</Text>
                    <View style={[styles.inputWrap, key === "description" && { alignItems: "flex-start", paddingTop: 10 }]}>
                      <Ionicons name={icon as any} size={15} color={colors.textDim} style={{ marginRight: 8, marginTop: key === "description" ? 2 : 0 }} />
                      <TextInput style={[styles.input, key === "description" && { height: 72 }]}
                        value={form[key]} onChangeText={v => setForm((f: any) => ({ ...f, [key]: v }))}
                        placeholder={label} placeholderTextColor={colors.textDim}
                        keyboardType={kb as any} multiline={key === "description"} />
                    </View>
                    {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
                  </View>
                ))}

                {/* Property Type */}
                <View style={styles.field}>
                  <Text style={styles.label}>Property Type *</Text>
                  <View style={styles.chipRow}>
                    {TYPES.map(t => (
                      <TouchableOpacity key={t} style={[styles.chip, form.property_type === t && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                        onPress={() => setForm((f: any) => ({ ...f, property_type: t }))}>
                        <Text style={[styles.chipText, form.property_type === t && { color: "#fff" }]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Status */}
                <View style={styles.field}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.chipRow}>
                    {STATUSES.map(s => (
                      <TouchableOpacity key={s} style={[styles.chip, form.status === s && { backgroundColor: STATUS_COLOR[s], borderColor: STATUS_COLOR[s] }]}
                        onPress={() => setForm((f: any) => ({ ...f, status: s }))}>
                        <Text style={[styles.chipText, form.status === s && { color: "#fff" }]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editing ? "Update Property" : "Add Property"}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: "row", alignItems: "center", padding: spacing.lg, gap: 10 },
  searchWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, height: 44 },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },
  addBtn: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 32 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: 14, overflow: "hidden" },
  cardImage: { width: "100%", height: 170 },
  cardImagePlaceholder: { width: "100%", height: 110, backgroundColor: colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  cardBody: { padding: spacing.md },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.text, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  badgeText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  cardSub: { fontSize: 12, color: colors.textDim, flex: 1 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardType: { fontSize: 11, color: colors.textMuted, textTransform: "capitalize" },
  cardPrice: { fontSize: 13, fontWeight: "800", color: colors.primary },
  cardActions: { flexDirection: "row", gap: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center" },
  actionText: { fontSize: 12, fontWeight: "600" },
  empty: { textAlign: "center", color: colors.textDim, marginTop: 48 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  modal: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, maxHeight: "92%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  field: { marginBottom: spacing.md },
  label: { fontSize: 12, color: colors.textMuted, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLight, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, minHeight: 48 },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  chipText: { fontSize: 12, color: colors.textMuted, fontWeight: "600", textTransform: "capitalize" },
  errorText: { fontSize: 11, color: colors.danger, marginTop: 4 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, height: 52, alignItems: "center", justifyContent: "center", marginTop: spacing.md },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  danger: "#ef4444",
});
