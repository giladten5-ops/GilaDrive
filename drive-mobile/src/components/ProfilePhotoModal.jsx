import { Modal, View, Text, Pressable, StyleSheet, Image } from "react-native";
import { spacing, radius } from "../ui/tokens";
import { useTheme } from "../ui/theme";

export default function ProfilePhotoModal({ visible, user, onClose }) {
  const { colors } = useTheme();
  if (!visible) return null;

  const label = (user?.name || user?.username || "Profile").trim();
  const initial = label ? label[0].toUpperCase() : "U";
  const avatarUri = typeof user?.image === "string" && user.image.trim() ? user.image : null;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
    },
    card: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    title: { color: colors.text, fontWeight: "800", fontSize: 16, marginBottom: spacing.md },
    photoWrap: { marginBottom: spacing.md },
    photo: { width: 140, height: 140, borderRadius: 70 },
    photoFallback: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    photoText: { color: "#fff", fontWeight: "900", fontSize: 40 },
    note: { color: colors.muted, marginBottom: spacing.md },
    closeBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingVertical: 10,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.bg,
    },
    closeText: { color: colors.text, fontWeight: "700" },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Profile picture</Text>
          <View style={styles.photoWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoFallback}>
                <Text style={styles.photoText}>{initial}</Text>
              </View>
            )}
          </View>
          {!avatarUri ? <Text style={styles.note}>No profile picture yet.</Text> : null}
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
