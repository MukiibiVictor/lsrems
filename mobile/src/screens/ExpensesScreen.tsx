import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";
import { expenseService } from "../services/api";

export function ExpensesScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ description: "", amount: "", category: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const data = await expenseService.list(); setItems(data); setFiltered(data); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter(i => i.description?.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q)));
  }, [search, items]);

  const openAdd = () => { setEditing(null); setForm({ description: "", amount: "", category: "", notes: "" }); setModalVisible(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ description: item.description || "", amount: String(item.amount || ""), category: item.category || "", notes: item.notes || "" }); setModalVisible(true); };

  const save = async () => {
    if (!form.description.trim() || !form.amount) { Alert.alert("Error", "Description and amount are required"); return; }
    setSaving(true);
    try {
      if (editing) await expenseService.update(editing.id, form);
      else await expenseService.create(form);
      setModalVisible(false); load();
    } catch { Alert.alert("Error", "Failed to save expense"); }
    finally { setSaving(false); }
  };

  const remove = (id: number) => Alert.alert("Delete", "Delete this expense?", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => { await expenseService.remove(id); load(); } },
  ]);

  const total = filtered.reduce((s, i) => s + Number(i.amount || 0), 0);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardIcon}><Ionicons name="receipt-outline" size={20} color={colors.warning} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.description}</Text>
        <View style={styles.cardRow}>
          {item.category && <View style={styles.badge}><Text style={styles.badgeText}>{item.category}</Text></View>}
          {item.created_at && <Text style={styles.cardSub}>{item.created_at?.slice(0, 10)}</Text>}
        </View>
      </View>
      <View style={{ alignItems: "flex-end", gap: 8 }}>
        <Text style={styles.amount}>UGX {Number(item.amount || 0).toLocaleString()}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}><Ionicons name="pencil-outline" size={14} color={colors.primary} /></TouchableOpacity>
          <TouchableOpacity onPress={() => remove(item.id)} style={styles.actionBtn}><Ionicons name="trash-outline" size={14} color={colors.danger} /></TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={colors.textDim} style={{ marginRight: 6 }} />
          <TextInput style={styles.searchInput} placeholder="Search expenses..." placeholderTextColor={colors.textDim} value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Ionicons name="add" size={22} color="#fff" /></TouchableOpacity>
      </View>

      {/* Total strip */}
      <View style={styles.totalStrip}>
        <Text style={styles.totalLabel}>Total Expenses</Text>
        <Text style={styles.totalAmount}>UGX {total.toLocaleString()}</Text>
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} /> : (
        <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No expenses found</Text>} />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? "Edit Expense" : "Add Expense"}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={22} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {[["description", "Description", "document-text-outline", "default"], ["amount", "Amount (UGX)", "cash-outline", "numeric"], ["category", "Category", "pricetag-outline", "default"], ["notes", "Notes", "chatbubble-outline", "default"]].map(([key, label, icon, kb]) => (
                <View key={key} style={styles.field}>
                  <Text style={styles.label}>{label}</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name={icon as any} size={16} color={colors.textDim} style={{ marginRight: 8 }} />
                    <TextInput style={styles.input} value={(form as any)[key]} onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
                      placeholder={label} placeholderTextColor={colors.textDim} keyboardType={kb as any} />
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editing ? "Update" : "Add Expense"}</Text>}
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
  totalStrip: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.surface, marginHorizontal: spacing.lg, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  totalLabel: { fontSize: 13, color: colors.textMuted },
  totalAmount: { fontSize: 16, fontWeight: "800", color: colors.warning },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 32 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  cardIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: "#f59e0b20", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 4 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { fontSize: 11, color: colors.textMuted, textTransform: "capitalize" },
  cardSub: { fontSize: 12, color: colors.textDim },
  amount: { fontSize: 14, fontWeight: "800", color: "#f59e0b" },
  actions: { flexDirection: "row", gap: 6 },
  actionBtn: { width: 28, height: 28, borderRadius: radius.sm, backgroundColor: colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  empty: { textAlign: "center", color: colors.textDim, marginTop: 48 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modal: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  field: { marginBottom: spacing.md },
  label: { fontSize: 12, color: colors.textMuted, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLight, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, minHeight: 48 },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, height: 52, alignItems: "center", justifyContent: "center", marginTop: spacing.md },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  warning: "#f59e0b",
});
