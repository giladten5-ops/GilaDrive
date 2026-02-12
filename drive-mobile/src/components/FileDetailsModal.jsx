// src/components/FileDetailsModal.jsx
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
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
      zIndex: 10,
    },
    iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    iconText: { fontSize: 20, color: colors.text },
    starOn: { color: colors.star },
    starOff: { color: colors.border },

    title: { fontSize: 16, fontWeight: "800", color: colors.text },
    subtitle: { marginTop: 2, fontSize: 12.5, color: colors.muted },

    contentBox: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.bg,
    },
    contentText: { color: colors.text, lineHeight: 20 },
    imagePreview: {
      width: "100%",
      height: "100%",
      resizeMode: "contain"
    },

    // Floating Trash Button
    deleteFab: {
      position: "absolute",
      right: 20,
      bottom: 30,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteIcon: { fontSize: 24 },

    errorBox: {
      margin: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 12,
    },
    errorText: { color: colors.danger, fontWeight: "700" },
  });

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose} supportedOrientations={['portrait', 'landscape']}>
      <SafeAreaView style={styles.root}>
        <View style={styles.root}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={10} style={styles.iconBtn}>
              <Text style={styles.iconText}>←</Text>
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {file?.name ?? "File"}
              </Text>
              <Text style={styles.subtitle}>{"image"} {starred ? " • Starred" : ""} </Text>
            </View>

            <Pressable onPress={onStarToggle} hitSlop={10} style={styles.iconBtn}>
              <Text style={[styles.iconText, starred ? styles.starOn : styles.starOff]}>
                {starred ? "★" : "☆"}
              </Text>
            </Pressable>
          </View>

          {/* Content Area */}
          {isFile ? (
            <View style={{ flex: 1 }}>
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

              {/* Floating Trash Button */}
              <Pressable
                onPress={onDelete}
                style={({ pressed }) => [
                  styles.deleteFab,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}