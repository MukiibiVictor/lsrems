import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";
import { transactionService } from "../services/api";

const TYPE_COLOR: Record<string, string> = { income: "#10b981", expense: "#ef4444", transfer: "#3b82f6" };

export function TransactionsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ description: "", amount: "", transaction_type: "income", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const data = await transactionService.list(); setItems(data); setFiltered(data); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter(i => i.description?.toLowerCase().includes(q)));
  }, [search, items]);

  const openAdd = () => { setEditing(null); setForm({ description: "", amount: "", transaction_type: "income", notes: "" }); setModalVisible(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ description: item.description || "", amount: String(item.amount || ""), transaction_type: item.transaction_type || "income", notes: item.notes || "" }); setModalVisible(true); };

  const save = async () => {
    if (!form.description.trim() || !form.amount) { Alert.alert("Error", "Description and amount are required"); return; }
    setSaving(true);
    try {
      if (editing) await transactionService.update(editing.id, form);
      else await transactionService.create(form);
      setModalVisible(false); load();
    } catch { Alert.alert("Error", "Failed to save transaction"); }
    finally { setSaving(false); }
  };

  const remove = (id: number) => Alert.alert("Delete", "Delete this transaction?", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => { await transactionService.remove(id); load(); } },
  ]);

  const formatAmount = (a: any) => `UGX ${Number(a || 0).toLocaleString()}`;

  const renderItem = ({ item }: { item: any }) => {
    const color = TYPE_COLOR[item.transaction_type] || "#6b7280";
    return (
      <View style={styles.card}>
        <View style={[styles.typeBar, { backgroundColor: color }]} />
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.description}</Text>
            <Text style={[styles.amount, { color }]}>{formatAmount(item.amount)}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardSub}>{item.transaction_type}</Text>
            {item.created_at && <Text style={styles.cardSub}>{item.created_at?.slice(0, 10)}</Text>}
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}><Ionicons name="pencil-outline" size={15} color={colors.primary} /></TouchableOpacity>
          <TouchableOpacity onPress={() => remove(item.id)} style={styles.actionBtn}><Ionicons name="trash-outline" size={15} color={colors.danger} /></TouchableOpacity>
        </View>
      </View>
    );
  };

  const types = ["income", "expense", "transfer"];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={colors.textDim} style={{ marginRight: 6 }} />
          <TextInput style={styles.searchInput} placeholder="Search transactions..." placeholderTextColor={colors.textDim} value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Ionicons name="add" size={22} color="#fff" /></TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} /> : (
        <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No transactions found</Text>} />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? "Edit Transaction" : "New Transaction"}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={22} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.field}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.typeRow}>
                  {types.map(t => (
                    <TouchableOpacity key={t} style={[styles.typeChip, form.transaction_type === t && { backgroundColor: colors.primary }]}
                      onPress={() => setForm(f => ({ ...f, transaction_type: t }))}>
                      <Text style={[styles.typeChipText, form.transaction_type === t && { color: "#fff" }]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {[["description", "Description", "document-text-outline", "default"], ["amount", "Amount (UGX)", "cash-outline", "numeric"], ["notes", "Notes", "chatbubble-outline", "default"]].map(([key, label, icon, kb]) => (
                <View key={key} style={styles.field}>
                  <Text style={styles.label}>{label}</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name={icon as any} size={16} color={colors.textDim} style={{ marginRight: 8 }} />
                    <TextInput style={styles.input} value={(form as any)[key]} onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
                      placeholder={label} placeholderTextColor={colors.textDim} keyboardType={kb as any} multiline={key === "notes"} />
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editing ? "Update" : "Add Transaction"}</Text>}
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
  card: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: 10, overflow: "hidden" },
  typeBar: { width: 4, alignSelf: "stretch" },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: colors.text, flex: 1, marginRight: 8 },
  amount: { fontSize: 14, fontWeight: "800" },
  cardSub: { fontSize: 12, color: colors.textDim, textTransform: "capitalize" },
  actions: { flexDirection: "column", gap: 6, padding: 10 },
  actionBtn: { width: 30, height: 30, borderRadius: radius.sm, backgroundColor: colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  empty: { textAlign: "center", color: colors.textDim, marginTop: 48 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modal: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  field: { marginBottom: spacing.md },
  label: { fontSize: 12, color: colors.textMuted, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  typeChipText: { fontSize: 13, color: colors.textMuted, fontWeight: "600", textTransform: "capitalize" },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLight, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, minHeight: 48 },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, height: 52, alignItems: "center", justifyContent: "center", marginTop: spacing.md },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
