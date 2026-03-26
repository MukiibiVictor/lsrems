import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl, Modal, ScrollView, Alert,
  KeyboardAvoidingView, Platform, Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { colors, spacing, radius } from "../constants/theme";
import { api, projectService } from "../services/api";

const DOC_COLOR: Record<string, string> = {
  survey_map: "#3b82f6",
  land_title: "#10b981",
  boundary_report: "#8b5cf6",
};
const DOC_LABEL: Record<string, string> = {
  survey_map: "Survey Map",
  land_title: "Land Title",
  boundary_report: "Boundary Report",
};
const DOC_TYPES = ["survey_map", "land_title", "boundary_report"] as const;

export function LandTitlesScreen() {
  const [docs, setDocs] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [docType, setDocType] = useState<typeof DOC_TYPES[number]>("survey_map");
  const [saving, setSaving] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const load = async () => {
    try {
      const [docsRes, projRes] = await Promise.allSettled([
        api.get("/land-titles/").then(r => r.data.results || r.data),
        projectService.list(),
      ]);
      if (docsRes.status === "fulfilled") { setDocs(docsRes.value); setFiltered(docsRes.value); }
      if (projRes.status === "fulfilled") setProjects(projRes.value);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(docs.filter(d =>
      d.project?.project_name?.toLowerCase().includes(q) ||
      DOC_LABEL[d.document_type]?.toLowerCase().includes(q)
    ));
  }, [search, docs]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch { Alert.alert("Error", "Failed to pick document"); }
  };

  const upload = async () => {
    if (!selectedFile || !projectId) { Alert.alert("Error", "Select a project and file"); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("project_id", String(projectId));
      formData.append("document_type", docType);
      formData.append("document_file", {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || "application/octet-stream",
      } as any);

      await api.post("/land-titles/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setModalVisible(false);
      setSelectedFile(null);
      setProjectId(null);
      setProjectSearch("");
      load();
    } catch (e: any) {
      Alert.alert("Upload Failed", e?.response?.data?.detail || "Failed to upload document");
    } finally { setSaving(false); }
  };

  const remove = (id: number) => Alert.alert("Delete", "Delete this document?", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => {
      try { await api.delete(`/land-titles/${id}/`); load(); }
      catch { Alert.alert("Error", "Failed to delete"); }
    }},
  ]);

  const download = async (doc: any) => {
    const token = (await import("@react-native-async-storage/async-storage")).default.getItem("auth_token");
    const url = `${api.defaults.baseURL}/land-titles/${doc.id}/download/`;
    Linking.openURL(url);
  };

  const filteredProjects = projects.filter(p =>
    p.project_name?.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => {
    const color = DOC_COLOR[item.document_type] || "#6b7280";
    return (
      <View style={styles.card}>
        <View style={[styles.docIcon, { backgroundColor: color + "20" }]}>
          <Ionicons name="document-text-outline" size={22} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.project?.project_name || "—"}
            </Text>
            <View style={[styles.badge, { backgroundColor: color + "20" }]}>
              <Text style={[styles.badgeText, { color }]}>{DOC_LABEL[item.document_type]}</Text>
            </View>
          </View>
          <Text style={styles.cardSub}>
            DOC-{String(item.id).padStart(3, "0")} · {item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString() : "—"}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => download(item)} style={styles.actionBtn}>
            <Ionicons name="download-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => remove(item.id)} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Stats strip */}
      <View style={styles.statsRow}>
        {DOC_TYPES.map(t => (
          <View key={t} style={styles.statCard}>
            <Text style={[styles.statNum, { color: DOC_COLOR[t] }]}>{docs.filter(d => d.document_type === t).length}</Text>
            <Text style={styles.statLabel}>{DOC_LABEL[t]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={colors.textDim} style={{ marginRight: 6 }} />
          <TextInput style={styles.searchInput} placeholder="Search documents..." placeholderTextColor={colors.textDim} value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setModalVisible(true); setSelectedFile(null); setProjectId(null); setProjectSearch(""); setDocType("survey_map"); }}>
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} /> : (
        <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No documents uploaded yet</Text>} />
      )}

      {/* Upload Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Upload Document</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={22} color={colors.text} /></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Project picker */}
                <View style={styles.field}>
                  <Text style={styles.label}>Survey Project *</Text>
                  <TouchableOpacity style={styles.inputWrap} onPress={() => setShowProjectPicker(!showProjectPicker)}>
                    <Ionicons name="map-outline" size={15} color={colors.textDim} style={{ marginRight: 8 }} />
                    <Text style={[styles.input, { paddingVertical: 14 }, !projectId && { color: colors.textDim }]}>
                      {projectId ? projects.find(p => p.id === projectId)?.project_name : "Select project..."}
                    </Text>
                    <Ionicons name={showProjectPicker ? "chevron-up" : "chevron-down"} size={16} color={colors.textDim} />
                  </TouchableOpacity>
                  {showProjectPicker && (
                    <View style={styles.dropdown}>
                      <TextInput style={styles.dropdownSearch} placeholder="Search projects..." placeholderTextColor={colors.textDim}
                        value={projectSearch} onChangeText={setProjectSearch} />
                      <ScrollView style={{ maxHeight: 180 }} keyboardShouldPersistTaps="handled">
                        {filteredProjects.map(p => (
                          <TouchableOpacity key={p.id} style={styles.dropdownItem} onPress={() => { setProjectId(p.id); setProjectSearch(p.project_name); setShowProjectPicker(false); }}>
                            <Text style={styles.dropdownItemText}>{p.project_name}</Text>
                            <Text style={styles.dropdownItemSub}>{p.location}</Text>
                          </TouchableOpacity>
                        ))}
                        {filteredProjects.length === 0 && <Text style={styles.empty}>No projects found</Text>}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Document type */}
                <View style={styles.field}>
                  <Text style={styles.label}>Document Type *</Text>
                  <View style={styles.chipRow}>
                    {DOC_TYPES.map(t => (
                      <TouchableOpacity key={t} style={[styles.chip, docType === t && { backgroundColor: DOC_COLOR[t], borderColor: DOC_COLOR[t] }]}
                        onPress={() => setDocType(t)}>
                        <Text style={[styles.chipText, docType === t && { color: "#fff" }]}>{DOC_LABEL[t]}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* File picker */}
                <View style={styles.field}>
                  <Text style={styles.label}>File (PDF or Image) *</Text>
                  <TouchableOpacity style={styles.filePicker} onPress={pickDocument}>
                    <Ionicons name={selectedFile ? "document-attach" : "cloud-upload-outline"} size={28} color={selectedFile ? colors.primary : colors.textDim} />
                    <Text style={[styles.filePickerText, selectedFile && { color: colors.text }]}>
                      {selectedFile ? selectedFile.name : "Tap to select file"}
                    </Text>
                    <Text style={styles.filePickerSub}>PDF, JPG, PNG</Text>
                  </TouchableOpacity>
                </View>

              </ScrollView>
              <TouchableOpacity style={[styles.saveBtn, (!selectedFile || !projectId) && { opacity: 0.5 }]} onPress={upload} disabled={saving || !selectedFile || !projectId}>
                {saving ? <ActivityIndicator color="#fff" /> : (
                  <><Ionicons name="cloud-upload-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>Upload Document</Text></>
                )}
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
  statsRow: { flexDirection: "row", padding: spacing.lg, gap: 10 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  statNum: { fontSize: 22, fontWeight: "900" },
  statLabel: { fontSize: 10, color: colors.textMuted, textAlign: "center", marginTop: 2 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: 10 },
  searchWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, height: 44 },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },
  addBtn: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 32 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  docIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: colors.text, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.full },
  badgeText: { fontSize: 10, fontWeight: "700" },
  cardSub: { fontSize: 12, color: colors.textDim },
  actions: { flexDirection: "row", gap: 6 },
  actionBtn: { width: 34, height: 34, borderRadius: radius.sm, backgroundColor: colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  empty: { textAlign: "center", color: colors.textDim, marginTop: 32, padding: spacing.md },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  modal: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  field: { marginBottom: spacing.md },
  label: { fontSize: 12, color: colors.textMuted, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLight, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, minHeight: 48 },
  input: { flex: 1, color: colors.text, fontSize: 15 },
  dropdown: { backgroundColor: colors.surfaceLight, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginTop: 4, overflow: "hidden" },
  dropdownSearch: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, color: colors.text, fontSize: 14 },
  dropdownItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  dropdownItemText: { fontSize: 14, fontWeight: "600", color: colors.text },
  dropdownItemSub: { fontSize: 12, color: colors.textDim, marginTop: 2 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  chipText: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  filePicker: { backgroundColor: colors.surfaceLight, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.border, borderStyle: "dashed", padding: spacing.xl, alignItems: "center", gap: 8 },
  filePickerText: { fontSize: 14, color: colors.textDim, fontWeight: "600" },
  filePickerSub: { fontSize: 11, color: colors.textDim },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: spacing.md },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  danger: "#ef4444",
});
