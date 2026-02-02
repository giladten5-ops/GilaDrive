// src/screens/DriveScreen.js
import { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { listFiles, getFile, starFile, unstarFile, deleteFile, searchFiles } from "../api/api";

import DriveHeader from "../components/DriveHeader";
import SectionHeader from "../components/SectionHeader";
import BottomTabs from "../components/BottomTabs";
import NewFab from "../components/NewFab";
import FileCard from "../components/FileCard";
import DriveRow from "../components/DriveRow";
import Breadcrumbs from "../components/BreadCrumbs";
import FileDetailsModal from "../components/FileDetailsModal";
import { colors } from "../ui/tokens";

export default function DriveScreen() {
  const { logout } = useAuth();

  // 'activeView' tracks which tab we are on (Home, Starred, etc.)
  const [activeView, setActiveView] = useState("home"); 
  // 'parentId' is the ID of the folder we are currently looking inside
  const [parentId, setParentId] = useState("");
  // 'crumbs' is an array that tracks our folder path: [{id: "", name: "My Drive"}, {id: "123", name: "Photos"}]
  const [crumbs, setCrumbs] = useState([{ id:"", name: "My Drive" }]);

  const [viewMode, setViewMode] = useState("grid"); // Switches between Card view and List view
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState(""); // The current search text
  const [searchMode, setSearchMode] = useState(false); // Are we looking at search results or a folder?

  // 'selected' stores the file/folder the user just tapped on to see details
  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [content, setContent] = useState(""); // The text inside a file
  const [contentError, setContentError] = useState("");

  // 'requestId' prevents "Race Conditions" (e.g. clicking two files quickly and showing the wrong content)
  const requestId = useRef(0);

  // 'filters' computes what we send to the API based on the view and folder we are in
  const filters = useMemo(() => {
    const pid = typeof parentId === "string" && parentId.trim() === "" ? null : parentId;
    if (activeView === "home") return { parentId: parentId ?? "" };
    return { view: activeView, parentId: parentId ?? "" };
  }, [activeView, parentId]);

  // Fetches the list of files from the server
  async function refresh() {
    setErr("");
    setLoading(true);
    try {
      const data = await listFiles(filters);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }

  // Every time the user changes tabs or enters a folder, refresh the list
  useEffect(() => {
    setSearchMode(false);
    setQ("");
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, parentId]);

  async function openItem(item) {
    // If it's a folder, we don't open a modal; we just "enter" it by updating parentId
    if (item.type === "folder") {
      setParentId(item.id);
      setCrumbs((prev) => [...prev, { id: item.id, name: item.name }]);
      return;
    }

    // If it's a file, we open the details modal and fetch its content
    setSelected(item);
    setDetailsOpen(true);
    setContent("");
    setContentError("");

    const id = ++requestId.current; // Increment request ID for this specific fetch
    try {
      const data = await getFile(item.id);
      // Only update state if this is still the "current" request
      if (requestId.current !== id) return;
      setContent(data?.content ?? "");
    } catch (e) {
      if (requestId.current !== id) return;
      setContentError(e?.message || "Failed to load file content");
    }
  }

  // When a user clicks a breadcrumb (e.g. clicking "My Drive" while inside "Photos")
  function onCrumbPress(idx) {
    const target = crumbs[idx];
    // Slice the crumbs array to remove everything after the clicked folder
    setCrumbs((prev) => prev.slice(0, idx + 1));
    setParentId(target.id ?? null);
  }

  async function doSearch() {
    const trimmed = String(q ?? "").trim();
    if (!trimmed) {
      setSearchMode(false);
      return refresh();
    }
    setErr("");
    setLoading(true);
    try {
      const res = await searchFiles(trimmed);
      setItems(Array.isArray(res) ? res : []);
      setSearchMode(true);
    } catch (e) {
      setErr(e?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  // Handles Starring/Unstarring and updates the local list so the UI changes instantly
  async function toggleStar() {
    if (!selected) return;
    try {
      if (selected.starred) await unstarFile(selected.id);
      else await starFile(selected.id);

      // Update the "selected" item state
      setSelected((s) => (s ? { ...s, starred: !s.starred } : s));
      // Update the item inside the big list so the star icon changes there too
      setItems((prev) => prev.map((x) => (x.id === selected.id ? { ...x, starred: !x.starred } : x)));

      // If we are in the "Starred" tab, refresh the list since an item might need to disappear
      if (activeView === "starred") refresh();
    } catch (e) {
      setErr(e?.message || "Failed to update star");
    }
  }

  async function doDelete() {
    if (!selected) return;
    try {
      await deleteFile(selected.id);
      setDetailsOpen(false);
      setSelected(null);
      refresh(); // Reload list to show the item is gone
    } catch (e) {
      setErr(e?.message || "Failed to delete");
    }
  }

  // Reset navigation states when switching main tabs at the bottom
  function setViewFromBottomTab(key) {
    setActiveView(key);
    setParentId(null);
    setCrumbs([{ id: null, name: "My Drive" }]);
  }


  const bottomActive = activeView;

  // Decide which component to use based on 'viewMode' (grid icon vs list icon)
  const renderItem = ({ item }) =>
    viewMode === "grid" ? (
      <FileCard item={item} onPress={() => openItem(item)} />
    ) : (
      <DriveRow item={item} onPress={() => openItem(item)} />
    );

  return (
    <SafeAreaView style={styles.root}>
      <DriveHeader
        searchValue={q}
        onChangeSearch={setQ}
        onSubmitSearch={doSearch}
        onOpenMenu={() => {}}
        onRightAction={() => {}}
        onAvatarPress={logout}
      />

      {/* Only show the path bar if we are deeper than the root folder */}
      {crumbs.length > 1 ? (
        <View style={styles.crumbsWrap}>
          <Breadcrumbs crumbs={crumbs} onCrumbPress={onCrumbPress} />
        </View>
      ) : null}

      <SectionHeader title="Files" viewMode={viewMode} onToggleView={setViewMode} />

      {err ? (
        <View style={styles.errWrap}>
          <Text style={styles.errText}>{err}</Text>
        </View>
      ) : null}

      {loading ? (
        <div style={styles.center}>
          <ActivityIndicator />
        </div>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 140 }} // Room for FAB and Tabs
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ color: colors.muted }}>{searchMode ? "No results" : "No items"}</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button (FAB) for creating new things */}
      <NewFab onPress={() => {}} />

      <BottomTabs active={bottomActive} onChange={setViewFromBottomTab} />

      {/* The full-screen modal that shows file info and content */}
      <FileDetailsModal
        open={detailsOpen}
        file={selected}
        content={content}
        contentError={contentError}
        onClose={() => setDetailsOpen(false)}
        onStarToggle={toggleStar}
        onDelete={doDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: "center" },
  crumbsWrap: { paddingHorizontal: 14, marginTop: 6 },
  errWrap: { paddingHorizontal: 14, marginTop: 10 },
  errText: { color: colors.danger, fontWeight: "700" },
  empty: { padding: 24, alignItems: "center" },
});