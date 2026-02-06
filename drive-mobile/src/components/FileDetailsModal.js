// src/components/FileDetailsModal.js
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { colors } from "../ui/tokens";

export default function FileDetailsModal({
  open,          // Boolean: Controls if the modal is visible
  file,          // Object: The file/folder metadata
  content,       // String: The raw text content of the file
  contentError,  // String: Any error message if content fails to load
  onClose,       // Function: To dismiss the modal
  onStarToggle,  // Function: To star/unstar the item
  onDelete,      // Function: To trigger the delete API call
}) {
  // Logic helpers for conditional rendering
  const isFile = file?.type === "file";
  const starred = !!file?.starred; // Standard "double-bang" to ensure a boolean

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        
        {/* 1. HEADER SECTION */}
        <View style={styles.header}>
          {/* Back/Close Button */}
          <Pressable onPress={onClose} hitSlop={10} style={styles.iconBtn}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>

          {/* Title Area: Shows Name and Type/Star status */}
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {file?.name ?? "File"}
            </Text>
            <Text style={styles.subtitle}>
              {file?.type ? (file.type === "folder" ? "Folder" : "File") : "—"}
              {starred ? " • Starred" : ""}
            </Text>
          </View>

          {/* Quick Toggle Star in Header */}
          <Pressable onPress={onStarToggle} hitSlop={10} style={styles.iconBtn}>
            <Text style={[styles.iconText, starred ? styles.starOn : styles.starOff]}>
              {starred ? "★" : "☆"}
            </Text>
          </Pressable>
        </View>

        {/* 2. BODY SECTION */}
        <View style={styles.body}>
          
          {/* Metadata Card: Displays key-value pairs using InfoRow helper */}
          <View style={styles.card}>
            <InfoRow label="Type" value={file?.type ?? "—"} />
            <View style={styles.cardSep} />
            <InfoRow label="Starred" value={starred ? "Yes" : "No"} />
          </View>

          <View style={{ height: 12 }} />

          {/* Action Buttons: Star/Unstar and Delete */}
          <View style={styles.actionsRow}>
            <Pressable onPress={onStarToggle} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>{starred ? "Unstar" : "Star"}</Text>
            </Pressable>

            <Pressable onPress={onDelete} style={styles.dangerBtn}>
              <Text style={styles.dangerBtnText}>Delete</Text>
            </Pressable>
          </View>

          {/* 3. CONTENT SECTION: Only rendered if the item is a file */}
          {isFile ? (
            <>
              <View style={{ height: 16 }} />
              <Text style={styles.sectionTitle}>Content</Text>
              <View style={{ height: 8 }} />

              {/* Show error box if fetching failed, otherwise show the scrollable text */}
              {contentError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{contentError}</Text>
                </View>
              ) : (
                <View style={styles.contentBox}>
                  {/* ScrollView allows the user to read long files within the modal */}
                  <ScrollView contentContainerStyle={{ padding: 12 }}>
                    <Text selectable style={styles.contentText}>
                      {content ?? ""}
                    </Text>
                  </ScrollView>
                </View>
              )}
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

/**
 * A small internal helper component to keep the metadata list clean.
 */
function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {String(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    height: 64,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 20, color: colors.text },
  starOn: { color: colors.star },
  starOff: { color: colors.border },

  title: { fontSize: 16, fontWeight: "800", color: colors.text },
  subtitle: { marginTop: 2, fontSize: 12.5, color: colors.muted },

  body: { flex: 1, padding: 12 },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    overflow: "hidden",
  },
  cardSep: { height: 1, backgroundColor: colors.border, opacity: 0.9 },
  infoRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLabel: { color: colors.muted, fontSize: 12.5, fontWeight: "700" },
  infoValue: { color: colors.text, fontSize: 12.5, fontWeight: "700", maxWidth: 220 },

  actionsRow: { flexDirection: "row" },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginRight: 10,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
  dangerBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  dangerBtnText: { color: colors.danger, fontWeight: "800" },

  sectionTitle: { color: colors.text, fontWeight: "800" },

  contentBox: {
    flex: 1, // Takes up remaining vertical space in the modal
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    overflow: "hidden",
  },
  contentText: { color: colors.text, lineHeight: 20 },

  errorBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 12,
  },
  errorText: { color: colors.danger, fontWeight: "700" },
});