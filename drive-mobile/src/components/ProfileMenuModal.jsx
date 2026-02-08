import { Modal, View, Text, Pressable, StyleSheet, Image, TouchableWithoutFeedback } from "react-native";
import { spacing, radius } from "../ui/tokens";
import { useTheme } from "../ui/theme";

export default function ProfileMenuModal({ visible, user, onClose, onViewPhoto, onChangePhoto, onLogout }) {
  const { colors } = useTheme();
  if (!visible) return null;

  const label = (user?.name || user?.username || "Profile").trim();
  const initial = label ? label[0].toUpperCase() : "U";
  const avatarUri = typeof user?.image === "string" && user.image.trim() ? user.image : null;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.35)",
    },
    sheet: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    avatarFallback: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: "#fff", fontWeight: "800" },
    avatarImg: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.bg },
    name: { color: colors.text, fontWeight: "800", fontSize: 16 },
    username: { color: colors.muted, marginTop: 2 },
    item: {
      paddingVertical: 14,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      marginBottom: spacing.sm,
    },
    itemText: { color: colors.text, fontWeight: "700" },
    logout: { backgroundColor: colors.surface },
    logoutText: { color: colors.danger, fontWeight: "800" },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.header}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{label}</Text>
                  {user?.username ? <Text style={styles.username}>@{user.username}</Text> : null}
                </View>
              </View>

              <Pressable style={styles.item} onPress={onViewPhoto}>
                <Text style={styles.itemText}>View profile picture</Text>
              </Pressable>
              <Pressable style={styles.item} onPress={onChangePhoto}>
                <Text style={styles.itemText}>Change profile picture</Text>
              </Pressable>
              <Pressable style={[styles.item, styles.logout]} onPress={onLogout}>
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
