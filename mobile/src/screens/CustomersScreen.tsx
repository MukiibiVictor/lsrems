import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl, Modal, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";
import { customerService } from "../services/api";

export function CustomersScreen() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await customerService.list();
      setCustomers(data); setFiltered(data);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(customers.filter(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)));
  }, [search, customers]);

  const openAdd = () => { setEditing(null); setForm({ name: "", email: "", phone: "", address: "" }); setModalVisible(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name || "", email: c.email || "", phone: c.phone || "", address: c.address || "" }); setModalVisible(true); };

  const save = async () => {
    if (!form.name.trim()) { Alert.alert("Error", "Name is required"); return; }
    setSaving(true);
    try {
      if (editing) await customerService.update(editing.id, form);
      else await customerService.create(form);
      setModalVisible(false); load();
    } catch { Alert.alert("Error", "Failed to save customer"); }
    finally { setSaving(false); }
  };

  const remove = (id: number) => {
    Alert.alert("Delete", "Delete this customer?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await customerService.remove(id); load(); } },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(item.name || "?")[0].toUpperCase()}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {item.email && <Text style={styles.cardSub}>{item.email}</Text>}
          {item.phone && <View style={styles.row}><Ionicons name="call-outline" size={12} color={colors.textDim} /><Text style={styles.cardSub}> {item.phone}</Text></View>}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}><Ionicons name="pencil-outline" size={16} color={colors.primary} /></TouchableOpacity>
        <TouchableOpacity onPress={() => remove(item.id)} style={styles.actionBtn}><Ionicons name="trash-outline" size={16} color={colors.danger} /></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={colors.textDim} style={{ marginRight: 6 }} />
          <TextInput style={styles.searchInput} placeholder="Search customers..." placeholderTextColor={colors.textDim} value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Ionicons name="add" size={22} color="#fff" /></TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} /> : (
        <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No customers found</Text>} />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? "Edit Customer" : "Add Customer"}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={22} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {[["name", "Full Name", "person-outline"], ["email", "Email", "mail-outline"], ["phone", "Phone", "call-outline"], ["address", "Address", "location-outline"]].map(([key, label, icon]) => (
                <View key={key} style={styles.field}>
                  <Text style={styles.label}>{label}</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name={icon as any} size={16} color={colors.textDim} style={{ marginRight: 8 }} />
                    <TextInput style={styles.input} value={(form as any)[key]} onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
                      placeholder={label} placeholderTextColor={colors.textDim} keyboardType={key === "email" ? "email-address" : key === "phone" ? "phone-pad" : "default"} />
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editing ? "Update" : "Add Customer"}</Text>}
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
  card: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  cardLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "800", color: colors.primary },
  cardTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  cardSub: { fontSize: 12, color: colors.textDim, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  empty: { textAlign: "center", color: colors.textDim, marginTop: 48 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modal: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  field: { marginBottom: spacing.md },
  label: { fontSize: 12, color: colors.textMuted, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLight, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, height: 48 },
  input: { flex: 1, color: colors.text, fontSize: 15 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, height: 52, alignItems: "center", justifyContent: "center", marginTop: spacing.md },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  danger: colors.danger,
});
