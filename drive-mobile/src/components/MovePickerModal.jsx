import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { listFiles } from "../api/api";
import { colors, spacing, radius } from "../ui/tokens";

export default function MovePickerModal({ visible, file, onClose, onMove }) {
  const [parentId, setParentId] = useState(null);
  const [crumbs, setCrumbs] = useState([{ id: null, name: "My Drive" }]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (visible) {
      setParentId(null);
      setCrumbs([{ id: null, name: "My Drive" }]);
      setErr("");
    }
  }, [visible]);

  const filters = useMemo(() => {
    if (parentId == null) return {};
    return { parentId };
  }, [parentId]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const data = await listFiles(filters);
        const onlyFolders = (Array.isArray(data) ? data : []).filter((i) => i.type === "folder");
        if (!cancelled) setFolders(onlyFolders);
      } catch (e) {
        if (!cancelled) setErr(e.message || "Failed to load folders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, filters]);

  const disabledMoveHere = parentId != null && file?.id && String(parentId) === String(file.id);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>Close</Text>
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Move to
          </Text>
          <View style={styles.headerBtn} />
        </View>

        <View style={styles.crumbs}>
          {crumbs.map((c, idx) => (
            <Pressable
              key={`${c.id ?? "root"}-${idx}`}
              onPress={() => {
                setCrumbs(crumbs.slice(0, idx + 1));
                setParentId(c.id);
              }}
              style={styles.crumbBtn}
            >
              <Text style={styles.crumbText} numberOfLines={1}>
                {c.name}
              </Text>
              {idx < crumbs.length - 1 ? <Text style={styles.crumbSep}>›</Text> : null}
            </Pressable>
          ))}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : err ? (
          <View style={styles.center}>
            <Text style={{ color: colors.danger, fontWeight: "700" }}>{err}</Text>
          </View>
        ) : (
          <FlatList
            data={folders}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={{ color: colors.muted }}>No folders here</Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  setParentId(item.id);
                  setCrumbs((prev) => [...prev, { id: item.id, name: item.name }]);
                }}
              >
                <Text style={styles.rowText} numberOfLines={1}>
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        )}

        <View style={styles.bottom}>
          <Pressable
            style={[styles.moveBtn, disabledMoveHere && { opacity: 0.5 }]}
            disabled={disabledMoveHere}
            onPress={() => onMove?.(parentId)}
          >
            <Text style={styles.moveText}>Move here</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    height: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontWeight: "900", color: colors.text },
  headerBtn: { width: 60, alignItems: "center" },
  headerBtnText: { color: colors.primary, fontWeight: "900" },
  crumbs: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  crumbBtn: { flexDirection: "row", alignItems: "center", marginRight: 6 },
  crumbText: { color: colors.muted, fontWeight: "700", maxWidth: 220 },
  crumbSep: { marginLeft: 6, marginRight: 6, color: colors.border },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { padding: 40, alignItems: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  rowText: { color: colors.text, fontWeight: "800", flex: 1 },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    backgroundColor: "rgba(246,248,252,0.95)",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  moveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  moveText: { color: "#fff", fontWeight: "900" },
});
