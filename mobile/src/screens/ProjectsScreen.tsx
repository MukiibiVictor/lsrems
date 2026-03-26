import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl, Modal, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";
import { projectService, customerService, api } from "../services/api";

const STATUS_COLOR: Record<string, string> = {
  pending: "#f59e0b",
  survey_in_progress: "#3b82f6",
  submitted_to_land_office: "#8b5cf6",
  completed: "#10b981",
};
const STATUSES = ["pending", "survey_in_progress", "submitted_to_land_office", "completed"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const PRIORITY_COLOR: Record<string, string> = { low: "#6b7280", medium: "#3b82f6", high: "#f59e0b", urgent: "#ef4444" };

function formatStatus(s: string) { return s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()); }

const EMPTY_FORM = { project_name: "", location: "", status: "pending", priority: "medium", customer_id: 0, customer_name: "", surveyor_id: null as number | null, scheduled_start_date: "", scheduled_end_date: "" };

export function ProjectsScreen() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "mine" | "unassigned">("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [surveyors, setSurveyors] = useState<any[]>([]);
  const searchTimer = useRef<any>(null);

  const load = async () => {
    try {
      let data: any[] = [];
      if (tab === "mine") data = await projectService.myJobs();
      else if (tab === "unassigned") data = await projectService.unassigned();
      else data = await projectService.list();
      const [users] = await Promise.allSettled([api.get("/users/").then(r => r.data.results || r.data)]);
      if (data) { setProjects(data); setFiltered(data); }
      if (users.status === "fulfilled") setSurveyors(Array.isArray(users.value) ? users.value : []);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, [tab]);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(projects.filter(p => p.project_name?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q) || p.customer?.name?.toLowerCase().includes(q)));
  }, [search, projects]);

  // Customer search with debounce
  useEffect(() => {
    if (!customerQuery.trim()) { setCustomerSuggestions([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        const data = await customerService.list();
        const all = Array.isArray(data) ? data : [];
        setCustomerSuggestions(all.filter((c: any) => c.name?.toLowerCase().includes(customerQuery.toLowerCase())).slice(0, 6));
      } catch { setCustomerSuggestions([]); }
    }, 300);
  }, [customerQuery]);

  const openAdd = () => {
    setEditing(null); setForm({ ...EMPTY_FORM }); setErrors({});
    setCustomerQuery(""); setCustomerSuggestions([]);
    setModalVisible(true);
  };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ project_name: p.project_name || "", location: p.location || "", status: p.status || "pending", priority: p.priority || "medium", customer_id: p.customer?.id || 0, customer_name: p.customer?.name || "", surveyor_id: p.surveyor?.id || null, scheduled_start_date: p.scheduled_start_date || "", scheduled_end_date: p.scheduled_end_date || "" });
    setCustomerQuery(p.customer?.name || ""); setCustomerSuggestions([]);
    setErrors({}); setModalVisible(true);
  };

  const selectCustomer = (c: any) => {
    setForm((f: any) => ({ ...f, customer_id: c.id, customer_name: c.name }));
    setCustomerQuery(c.name); setCustomerSuggestions([]);
  };

  const validate = () => {
    const e: any = {};
    if (!form.project_name.trim()) e.project_name = "Required";
    if (!form.location.trim()) e.location = "Required";
    if (!form.customer_id) e.customer_id = "Select a customer";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: any = { project_name: form.project_name, location: form.location, status: form.status, priority: form.priority, customer_id: form.customer_id };
      if (form.surveyor_id) payload.surveyor_id = form.surveyor_id;
      if (form.scheduled_start_date) payload.scheduled_start_date = form.scheduled_start_date;
      if (form.scheduled_end_date) payload.scheduled_end_date = form.scheduled_end_date;
      if (editing) await projectService.update(editing.id, payload);
      else await projectService.create(payload);
      setModalVisible(false); load();
    } catch (e: any) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : "Failed to save project";
      Alert.alert("Error", msg);
    } finally { setSaving(false); }
  };

  const remove = (id: number) => Alert.alert("Delete", "Delete this project?", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => { try { await projectService.remove(id); load(); } catch { Alert.alert("Error", "Failed to delete"); } } },
  ]);

  const renderItem = ({ item }: { item: any }) => {
    const color = STATUS_COLOR[item.status] || "#6b7280";
    const pColor = PRIORITY_COLOR[item.priority] || "#6b7280";
    return (
      <View style={styles.card}>
        <View style={[styles.statusBar, { backgroundColor: color }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardId}>#{item.id}</Text>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: color + "20" }]}><Text style={[styles.badgeText, { color }]}>{formatStatus(item.status)}</Text></View>
              <View style={[styles.badge, { backgroundColor: pColor + "20" }]}><Text style={[styles.badgeText, { color: pColor }]}>{item.priority}</Text></View>
            </View>
          </View>
          <Text style={styles.cardTitle}>{item.project_name}</Text>
          <View style={styles.row}><Ionicons name="location-outline" size={12} color={colors.textDim} /><Text style={styles.cardSub}> {item.location}</Text></View>
          <View style={styles.row}><Ionicons name="person-outline" size={12} color={colors.textDim} /><Text style={styles.cardSub}> {item.customer?.name || "—"}</Text></View>
          {item.surveyor && <View style={styles.row}><Ionicons name="construct-outline" size={12} color={colors.textDim} /><Text style={styles.cardSub}> {item.surveyor.username}</Text></View>}
          {item.scheduled_start_date && <View style={styles.row}><Ionicons name="calendar-outline" size={12} color={colors.textDim} /><Text style={styles.cardSub}> {item.scheduled_start_date} → {item.scheduled_end_date || "TBD"}</Text></View>}
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}><Ionicons name="pencil-outline" size={14} color={colors.primary} /><Text style={[styles.actionText, { color: colors.primary }]}> Edit</Text></TouchableOpacity>
            {!item.surveyor && (
              <TouchableOpacity onPress={async () => { try { await projectService.assignSelf(item.id); load(); Alert.alert("✓", "You have claimed this project!"); } catch (e: any) { Alert.alert("Error", e?.response?.data?.detail || "Failed"); } }} style={styles.actionBtn}>
                <Ionicons name="hand-right-outline" size={14} color="#8b5cf6" /><Text style={[styles.actionText, { color: "#8b5cf6" }]}> Claim</Text>
              </TouchableOpacity>
            )}
            {item.surveyor && item.status !== "completed" && (
              <TouchableOpacity onPress={() => Alert.prompt("Complete Project", "Add completion notes (optional):", async (notes) => { try { await projectService.complete(item.id, notes || ""); load(); } catch (e: any) { Alert.alert("Error", e?.response?.data?.detail || "Failed"); } })} style={styles.actionBtn}>
                <Ionicons name="checkmark-circle-outline" size={14} color="#10b981" /><Text style={[styles.actionText, { color: "#10b981" }]}> Complete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => remove(item.id)} style={styles.actionBtn}><Ionicons name="trash-outline" size={14} color={colors.danger} /><Text style={[styles.actionText, { color: colors.danger }]}> Delete</Text></TouchableOpacity>
          </View>        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={colors.textDim} style={{ marginRight: 6 }} />
          <TextInput style={styles.searchInput} placeholder="Search projects..." placeholderTextColor={colors.textDim} value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Ionicons name="add" size={22} color="#fff" /></TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(["all", "mine", "unassigned"] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => { setTab(t); setSearch(""); }}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === "all" ? "All" : t === "mine" ? "My Jobs" : "Available"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} /> : (
        <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No projects found</Text>} />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editing ? "Edit Project" : "New Project"}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={22} color={colors.text} /></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Project Name */}
                <View style={styles.field}>
                  <Text style={styles.label}>Project Name *</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="briefcase-outline" size={15} color={colors.textDim} style={{ marginRight: 8 }} />
                    <TextInput style={styles.input} value={form.project_name} onChangeText={v => setForm((f: any) => ({ ...f, project_name: v }))} placeholder="Project name" placeholderTextColor={colors.textDim} />
                  </View>
                  {errors.project_name && <Text style={styles.errorText}>{errors.project_name}</Text>}
                </View>

                {/* Location */}
                <View style={styles.field}>
                  <Text style={styles.label}>Location *</Text>
                  <View style={[styles.inputWrap, { alignItems: "flex-start", paddingTop: 10 }]}>
                    <Ionicons name="location-outline" size={15} color={colors.textDim} style={{ marginRight: 8, marginTop: 2 }} />
                    <TextInput style={[styles.input, { height: 64 }]} value={form.location} onChangeText={v => setForm((f: any) => ({ ...f, location: v }))} placeholder="Location" placeholderTextColor={colors.textDim} multiline />
                  </View>
                  {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
                </View>

                {/* Customer search */}
                <View style={styles.field}>
                  <Text style={styles.label}>Customer *</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="person-outline" size={15} color={colors.textDim} style={{ marginRight: 8 }} />
                    <TextInput style={styles.input} value={customerQuery}
                      onChangeText={v => { setCustomerQuery(v); setForm((f: any) => ({ ...f, customer_id: 0 })); }}
                      placeholder="Type to search customer..." placeholderTextColor={colors.textDim} />
                    {form.customer_id > 0 && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                  </View>
                  {errors.customer_id && <Text style={styles.errorText}>{errors.customer_id}</Text>}
                  {customerSuggestions.length > 0 && (
                    <View style={styles.suggestions}>
                      {customerSuggestions.map(c => (
                        <TouchableOpacity key={c.id} style={styles.suggestionItem} onPress={() => selectCustomer(c)}>
                          <Text style={styles.suggestionName}>{c.name}</Text>
                          {c.phone && <Text style={styles.suggestionSub}>{c.phone}</Text>}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Surveyor */}
                <View style={styles.field}>
                  <Text style={styles.label}>Assign Surveyor</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity style={[styles.chip, form.surveyor_id === null && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                        onPress={() => setForm((f: any) => ({ ...f, surveyor_id: null }))}>
                        <Text style={[styles.chipText, form.surveyor_id === null && { color: "#fff" }]}>None</Text>
                      </TouchableOpacity>
                      {surveyors.map((s: any) => (
                        <TouchableOpacity key={s.id} style={[styles.chip, form.surveyor_id === s.id && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                          onPress={() => setForm((f: any) => ({ ...f, surveyor_id: s.id }))}>
                          <Text style={[styles.chipText, form.surveyor_id === s.id && { color: "#fff" }]}>{s.username}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Status */}
                <View style={styles.field}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.chipRow}>
                    {STATUSES.map(s => (
                      <TouchableOpacity key={s} style={[styles.chip, form.status === s && { backgroundColor: STATUS_COLOR[s], borderColor: STATUS_COLOR[s] }]}
                        onPress={() => setForm((f: any) => ({ ...f, status: s }))}>
                        <Text style={[styles.chipText, form.status === s && { color: "#fff" }]}>{formatStatus(s)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Priority */}
                <View style={styles.field}>
                  <Text style={styles.label}>Priority</Text>
                  <View style={styles.chipRow}>
                    {PRIORITIES.map(p => (
                      <TouchableOpacity key={p} style={[styles.chip, form.priority === p && { backgroundColor: PRIORITY_COLOR[p], borderColor: PRIORITY_COLOR[p] }]}
                        onPress={() => setForm((f: any) => ({ ...f, priority: p }))}>
                        <Text style={[styles.chipText, form.priority === p && { color: "#fff" }]}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Dates */}
                {[["scheduled_start_date", "Start Date (YYYY-MM-DD)", "calendar-outline"], ["scheduled_end_date", "End Date (YYYY-MM-DD)", "calendar-outline"]].map(([key, label, icon]) => (
                  <View key={key} style={styles.field}>
                    <Text style={styles.label}>{label}</Text>
                    <View style={styles.inputWrap}>
                      <Ionicons name={icon as any} size={15} color={colors.textDim} style={{ marginRight: 8 }} />
                      <TextInput style={styles.input} value={form[key]} onChangeText={v => setForm((f: any) => ({ ...f, [key]: v }))} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textDim} />
                    </View>
                  </View>
                ))}

              </ScrollView>
              <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editing ? "Update Project" : "Create Project"}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: "row", paddingHorizontal: spacing.lg, gap: 8, marginBottom: spacing.sm },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  tabBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: "600", color: colors.textMuted },
  tabTextActive: { color: "#fff" },
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: "row", alignItems: "center", padding: spacing.lg, gap: 10 },
  searchWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, height: 44 },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },
  addBtn: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 32 },
  card: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: 12, overflow: "hidden" },
  statusBar: { width: 4 },
  cardContent: { flex: 1, padding: spacing.md },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardId: { fontSize: 12, color: colors.textDim, fontWeight: "600" },
  badges: { flexDirection: "row", gap: 6 },
  badge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.full },
  badgeText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  cardSub: { fontSize: 12, color: colors.textDim, flex: 1 },
  cardActions: { flexDirection: "row", gap: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center" },
  actionText: { fontSize: 12, fontWeight: "600" },
  empty: { textAlign: "center", color: colors.textDim, marginTop: 48 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  modal: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, maxHeight: "94%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  field: { marginBottom: spacing.md },
  label: { fontSize: 12, color: colors.textMuted, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLight, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, minHeight: 48 },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  chipText: { fontSize: 12, color: colors.textMuted, fontWeight: "600", textTransform: "capitalize" },
  suggestions: { backgroundColor: colors.surfaceLight, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginTop: 4, overflow: "hidden" },
  suggestionItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  suggestionName: { fontSize: 14, fontWeight: "600", color: colors.text },
  suggestionSub: { fontSize: 12, color: colors.textDim, marginTop: 2 },
  errorText: { fontSize: 11, color: colors.danger, marginTop: 4 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, height: 52, alignItems: "center", justifyContent: "center", marginTop: spacing.md },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  danger: "#ef4444",
});
