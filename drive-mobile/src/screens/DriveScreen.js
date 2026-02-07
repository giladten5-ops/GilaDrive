// src/screens/DriveScreen.js
import { useEffect, useMemo, useRef, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  Alert 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  listFiles,
  getFile,
  updateFile,
  deleteFile,
  starFile,
  unstarFile,
  searchFiles,
  uploadFile,
  getUserId,
  addPermission,
} from "../api/api";
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
import SideMenuModal from "../components/SideMenuModal";
import CreateItemModal from "../components/CreateItemModal";
import PromptModal from "../components/PromptModal";
import ShareModal from "../components/ShareModal";
import MovePickerModal from "../components/MovePickerModal";

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

  const [sideOpen, setSideOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [menuFile, setMenuFile] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editContent, setEditContent] = useState(""); 
  const [isSaving, setIsSaving] = useState(false);
  const requestId = useRef(0);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameFile, setRenameFile] = useState(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareFile, setShareFile] = useState(null);

  const [moveOpen, setMoveOpen] = useState(false);
  const [moveFile, setMoveFile] = useState(null);

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

  function setView(nextView) {
    setActiveView(nextView);
    setParentId(null);
    setCrumbs([{ id: null, name: "My Drive" }]);
  }

  // --- Actions ---
  const isImage = (name) => {
    const ext = String(name || "").toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  async function openItem(item) {
    if (item.isTrashed) {
      Alert.alert("In trash", "Restore this item to open it.");
      return;
    }
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
    if (actionId === "star") {
      handleToggleStar(file);
      return;
    }
    if (actionId === "rename") {
      setRenameFile(file);
      setRenameValue(file.name || "");
      setRenameOpen(true);
      return;
    }
    if (actionId === "share") {
      setShareFile(file);
      setShareOpen(true);
      return;
    }
    if (actionId === "move") {
      setMoveFile(file);
      setMoveOpen(true);
      return;
    }
    if (actionId === "restore") {
      try {
        await updateFile(file.id, { restore: true });
        refresh();
      } catch (e) {
        Alert.alert("Error", e.message || "Restore failed.");
      }
      return;
    }
    if (actionId === "delete") {
      const title = file.isTrashed ? "Delete forever?" : "Move to trash?";
      const msg = file.isTrashed
        ? "This will permanently delete the item."
        : "You can restore it from Trash later.";
      Alert.alert(title, msg, [
        { text: "Cancel", style: "cancel" },
        {
          text: file.isTrashed ? "Delete" : "Move",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFile(file.id);
              refresh();
            } catch (e) {
              Alert.alert("Error", e.message || "Delete failed.");
            }
          },
        },
      ]);
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

  async function handleCreate({ type, name, content }) {
    try {
      setCreateOpen(false);
      await uploadFile({
        name,
        type,
        parentId,
        content,
      });
      refresh();
    } catch (e) {
      Alert.alert("Error", e.message || "Create failed.");
    }
  }

  async function handleRenameConfirm() {
    const file = renameFile;
    const next = renameValue.trim();
    if (!file || !next) return;
    try {
      setRenameOpen(false);
      await updateFile(file.id, { name: next });
      refresh();
    } catch (e) {
      Alert.alert("Error", e.message || "Rename failed.");
    }
  }

  async function handleShare({ username, permissionType }) {
    if (!shareFile) return;
    try {
      const res = await getUserId(username);
      await addPermission(shareFile.id, { userId: res.userId, permissionType });
      setShareOpen(false);
      Alert.alert("Shared", `Shared with ${res.username} (${permissionType})`);
    } catch (e) {
      Alert.alert("Error", e.message || "Share failed.");
    }
  }

  async function handleMove(destinationParentId) {
    if (!moveFile) return;
    try {
      setMoveOpen(false);
      await updateFile(moveFile.id, { parentId: destinationParentId });
      refresh();
    } catch (e) {
      Alert.alert("Error", e.message || "Move failed.");
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <SideMenuModal
        visible={sideOpen}
        active={activeView}
        onClose={() => setSideOpen(false)}
        onSelect={(v) => setView(v)}
        onLogout={logout}
      />

      <DriveHeader 
        searchValue={q}
        onChangeSearch={setQ}
        onSubmitSearch={doSearch}
        onOpenMenu={() => setSideOpen(true)}
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

      {activeView === "home" ? <NewFab onPress={() => setCreateOpen(true)} /> : null}

      <BottomTabs 
        active={activeView} 
        onChange={(k) => setView(k)} 
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

      <CreateItemModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      <PromptModal
        visible={renameOpen}
        title="Rename"
        label="New name"
        value={renameValue}
        onChangeValue={setRenameValue}
        placeholder="Enter name"
        confirmText="Save"
        cancelText="Cancel"
        onCancel={() => setRenameOpen(false)}
        onConfirm={handleRenameConfirm}
      />

      <ShareModal
        visible={shareOpen}
        file={shareFile}
        onClose={() => setShareOpen(false)}
        onShare={handleShare}
      />

      <MovePickerModal
        visible={moveOpen}
        file={moveFile}
        onClose={() => setMoveOpen(false)}
        onMove={handleMove}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  crumbsWrap: { paddingHorizontal: 14, marginTop: 6 },
  empty: { padding: 40, alignItems: "center" }
});
