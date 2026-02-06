// src/screens/DriveScreen.js
import { useEffect, useMemo, useRef, useState } from "react";
import { 
  SafeAreaView, 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  Alert 
} from "react-native";
import { listFiles, getFile, updateFile, deleteFile, starFile, unstarFile, searchFiles } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../ui/tokens";

// Components
import DriveHeader from "../components/DriveHeader";
import SectionHeader from "../components/SectionHeader";
import BottomTabs from "../components/BottomTabs";
import NewFab from "../components/NewFab";
import FileCard from "../components/FileCard";
import DriveRow from "../components/DriveRow";
import Breadcrumbs from "../components/BreadCrumbs";
import FileDetailsModal from "../components/FileDetailsModal";
import FileOptionsMenu from "../components/FileOptionsMenu";
import TextEditorModal from "../components/TextEditorModal";

export default function DriveScreen() {
  const { logout } = useAuth();

  // --- State ---
  const [activeView, setActiveView] = useState("home"); 
  const [parentId, setParentId] = useState(null); 
  const [crumbs, setCrumbs] = useState([{ id: null, name: "My Drive" }]);
  const [viewMode, setViewMode] = useState("grid"); 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState(""); 
  const [searchMode, setSearchMode] = useState(false); 

  const [menuFile, setMenuFile] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editContent, setEditContent] = useState(""); 
  const [isSaving, setIsSaving] = useState(false);
  const requestId = useRef(0);

  // --- Filters ---
  const filters = useMemo(() => {
    if (activeView === "home") return parentId ? { parentId } : {}; 
    return { view: activeView, parentId: parentId ?? "" };
  }, [activeView, parentId]);

  // --- Fetching ---
  async function refresh() {
    setErr("");
    setLoading(true);
    try {
      const data = await listFiles(filters);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) { 
      setErr(e.message); 
    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => { 
    setSearchMode(false);
    setQ("");
    refresh(); 
  }, [activeView, parentId]);

  // --- Actions ---
  const isImage = (name) => {
    const ext = String(name || "").toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  async function openItem(item) {
    if (item.type === "folder") {
      setParentId(item.id);
      setCrumbs((prev) => [...prev, { id: item.id, name: item.name }]);
      return;
    }
    setSelected(item);
    if (isImage(item.name)) {
      setDetailsOpen(true);
    } else {
      setIsEditorOpen(true);
      setEditContent("Loading...");
      const id = ++requestId.current;
      try {
        const data = await getFile(item.id);
        if (requestId.current !== id) return;
        setEditContent(data?.content ?? "");
      } catch (e) {
        if (requestId.current !== id) return;
        setEditContent("Error loading file.");
      }
    }
  }

  async function doSearch() {
    const trimmed = q?.trim();
    if (!trimmed) { setSearchMode(false); return refresh(); }
    setLoading(true);
    try {
      const res = await searchFiles(trimmed);
      setItems(Array.isArray(res) ? res : []);
      setSearchMode(true);
    } catch (e) { setErr("Search failed"); }
    finally { setLoading(false); }
  }

  const handleToggleStar = async (file) => {
    const nextStarred = !file.isStarred;
    setItems(prev => prev.map(f => f.id === file.id ? { ...f, isStarred: nextStarred } : f));
    try {
      if (nextStarred) await starFile(file.id);
      else await unstarFile(file.id);
    } catch (e) { refresh(); }
  };

  async function handleMenuAction(actionId, file) {
    if (actionId === 'star') handleToggleStar(file);
    else if (actionId === 'delete') {
      try { await deleteFile(file.id); refresh(); }
      catch (e) { Alert.alert("Error", "Delete failed."); }
    }
  }

  const handleSaveText = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await updateFile(selected.id, { content: editContent });
      setIsEditorOpen(false);
      refresh();
    } catch (e) { Alert.alert("Error", "Save failed."); }
    finally { setIsSaving(false); }
  };

  return (
    <SafeAreaView style={styles.root}>
      <DriveHeader 
        searchValue={q}
        onChangeSearch={setQ}
        onSubmitSearch={doSearch}
        onAvatarPress={logout} // Directly calling logout now
      />

      {crumbs.length > 1 && (
        <View style={styles.crumbsWrap}>
          <Breadcrumbs crumbs={crumbs} onCrumbPress={(idx) => {
            setCrumbs(crumbs.slice(0, idx + 1));
            setParentId(crumbs[idx].id);
          }} />
        </View>
      )}

      <SectionHeader title={searchMode ? "Search Results" : "Files"} viewMode={viewMode} onToggleView={setViewMode} />
      
      {loading ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 140 }}
          renderItem={({ item }) => (
            viewMode === "grid" 
              ? <FileCard item={item} onMenuPress={setMenuFile} onPress={openItem} />
              : <DriveRow item={item} onMenuPress={setMenuFile} onPress={openItem} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ color: colors.muted }}>{searchMode ? "No matches" : "No items"}</Text>
            </View>
          }
        />
      )}

      <NewFab onPress={() => {}} />

      <BottomTabs 
        active={activeView} 
        onChange={(k) => { setActiveView(k); setParentId(null); setCrumbs([{id: null, name: "My Drive"}]); }} 
      />

      <TextEditorModal
        visible={isEditorOpen}
        fileName={selected?.name}
        value={editContent}
        onChange={setEditContent}
        onSave={handleSaveText}
        onClose={() => setIsEditorOpen(false)}
        isSaving={isSaving}
      />

      <FileDetailsModal open={detailsOpen} file={selected} onClose={() => setDetailsOpen(false)} onStarToggle={() => handleToggleStar(selected)} />
      
      <FileOptionsMenu visible={!!menuFile} file={menuFile} onClose={() => setMenuFile(null)} onAction={handleMenuAction} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  crumbsWrap: { paddingHorizontal: 14, marginTop: 6 },
  empty: { padding: 40, alignItems: "center" }
});