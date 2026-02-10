// src/components/FileDetailsModal.jsx
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, Image } from "react-native";
import { useTheme } from "../ui/theme";

export default function FileDetailsModal({
  open,
  file,
  content,
  contentError,
  onClose,
  onStarToggle,
  onDelete,
}) {
  const { colors } = useTheme();
  const isFile = file?.type === "file";
  const starred = !!file?.isStarred;
  const isImageContent = typeof content === "string" && content.startsWith("data:image/");

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
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      overflow: "hidden",
    },
    contentText: { color: colors.text, lineHeight: 20 },
    imagePreview: { width: "100%", height: 260, resizeMode: "contain" },

    errorBox: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 12,
    },
    errorText: { color: colors.danger, fontWeight: "700" },
  });

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.iconBtn}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {file?.name ?? "File"}
            </Text>
            <Text style={styles.subtitle}>
              {file?.type ? (file.type === "folder" ? "Folder" : "File") : "—"}
              {starred ? " • Starred" : ""}
            </Text>
          </View>

          <Pressable onPress={onStarToggle} hitSlop={10} style={styles.iconBtn}>
            <Text style={[styles.iconText, starred ? styles.starOn : styles.starOff]}>
              {starred ? "★" : "☆"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.card}>
            <InfoRow styles={styles} label="Type" value={file?.type ?? "—"} />
            <View style={styles.cardSep} />
            <InfoRow styles={styles} label="Starred" value={starred ? "Yes" : "No"} />
          </View>

          <View style={{ height: 12 }} />

          <View style={styles.actionsRow}>
            <Pressable onPress={onStarToggle} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>{starred ? "Unstar" : "Star"}</Text>
            </Pressable>

            {onDelete ? (
              <Pressable onPress={onDelete} style={styles.dangerBtn}>
                <Text style={styles.dangerBtnText}>Delete</Text>
              </Pressable>
            ) : null}
          </View>

          {isFile ? (
            <>
              <View style={{ height: 16 }} />
              <Text style={styles.sectionTitle}>Content</Text>
              <View style={{ height: 8 }} />

              {contentError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{contentError}</Text>
                </View>
              ) : isImageContent ? (
                <View style={styles.contentBox}>
                  <Image source={{ uri: content }} style={styles.imagePreview} />
                </View>
              ) : (
                <View style={styles.contentBox}>
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

function InfoRow({ styles, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {String(value)}
      </Text>
    </View>
  );
}
