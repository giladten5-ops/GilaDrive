// src/components/FileCard.js
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../ui/tokens";

export default function FileCard({ item, onPress }) {
  // Determine if we're rendering a folder or a file
  const isFolder = item.type === "folder";
  // Get the specific label and color based on the file extension
  const extTag = getExtTag(item?.name);

  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      {/* 1. Top Row: Icon, Name, and Menu dots */}
      <View style={styles.topRow}>
        <Text style={styles.icon}>{isFolder ? "📁" : "📄"}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        {/* Placeholder for an options menu (like Rename, Move, etc.) */}
        <Text style={styles.menu}>⋮</Text>
      </View>

      {/* 2. Preview Area: Large central box showing the file type or folder status */}
      <View style={styles.preview}>
        {isFolder ? (
          <Text style={styles.previewFolder}>Folder</Text>
        ) : (
          <Text style={[styles.previewTag, extTag.bg ? { backgroundColor: extTag.bg } : null]}>
            {extTag.label}
          </Text>
        )}
      </View>

      {/* 3. Meta Row: User avatar and last activity info */}
      <View style={styles.metaRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>G</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.metaMain}>You opened</Text>
          <Text style={styles.metaSub}>Recently</Text>
        </View>
        {/* Only render the star if the item is actually starred */}
        {item.starred ? <Text style={styles.star}>★</Text> : null}
      </View>
    </Pressable>
  );
}

/**
 * Helper function to determine the visual "tag" for a file.
 * It maps common extensions to Google-like brand colors.
 */
function getExtTag(name) {
  const n = String(name || "").toLowerCase();
  if (n.endsWith(".pdf")) return { label: "PDF", bg: "#EA4335" }; // Red
  if (n.endsWith(".doc") || n.endsWith(".docx")) return { label: "DOC", bg: "#1A73E8" }; // Blue
  if (n.endsWith(".ppt") || n.endsWith(".pptx")) return { label: "PPT", bg: "#FB8C00" }; // Orange
  if (n.endsWith(".xls") || n.endsWith(".xlsx")) return { label: "XLS", bg: "#34A853" }; // Green
  if (n.endsWith(".txt")) return { label: "TXT", bg: "#5F6368" }; // Gray
  return { label: "FILE", bg: "#5F6368" };
}

const styles = StyleSheet.create({
  wrap: { 
    marginHorizontal: spacing.md, 
    marginTop: 12,
    // Cards usually look better with a bit of bottom margin to separate them
    marginBottom: 8 
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  icon: { width: 26, textAlign: "center", marginRight: 10 },
  name: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.text },
  menu: { fontSize: 18, color: colors.muted, paddingHorizontal: 8 },

  preview: {
    marginTop: 10,
    height: 170, // Fixed height makes the grid look uniform
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  previewTag: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    color: "#fff",
    fontWeight: "900",
  },
  previewFolder: { color: colors.muted, fontWeight: "800" },

  metaRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17, // Half of width/height for a circle
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { color: "#fff", fontWeight: "800" },
  metaMain: { color: colors.text, fontWeight: "700" },
  metaSub: { color: colors.muted, marginTop: 2 },
  star: { color: colors.star, fontSize: 16, marginLeft: 10 },
});