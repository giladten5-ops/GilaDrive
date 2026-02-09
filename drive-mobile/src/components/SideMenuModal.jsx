import { Modal, View, Text, Pressable, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { spacing, radius } from "../ui/tokens";
import { useTheme } from "../ui/theme";

const ITEMS = [
  { key: "home", label: "My Drive" },
  { key: "recent", label: "Recent" },
  { key: "starred", label: "Starred" },
  { key: "shared", label: "Shared" },
  { key: "trash", label: "Trash" },
];

export default function SideMenuModal({ visible, active, onClose, onSelect, onLogout }) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", flexDirection: "row" },
    drawer: {
      width: 280,
      backgroundColor: colors.surface,
      paddingTop: spacing.xl,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    title: { fontSize: 20, fontWeight: "900", color: colors.text, marginBottom: spacing.lg },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      marginBottom: 6,
    },
    rowOn: { backgroundColor: colors.primary + "22" },
    label: { color: colors.text, fontWeight: "800" },
    labelOn: { color: colors.primary },
  });
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.drawer}>
              <Text style={styles.title}>Drive</Text>

              {ITEMS.map((it) => {
                const on = it.key === active;
                return (
                  <Pressable
                    key={it.key}
                    onPress={() => {
                      onSelect?.(it.key);
                      onClose?.();
                    }}
                    style={[styles.row, on && styles.rowOn]}
                  >
                    <Text style={[styles.label, on && styles.labelOn]}>{it.label}</Text>
                  </Pressable>
                );
              })}

              <View style={{ flex: 1 }} />
              <Pressable
                onPress={() => {
                  onLogout?.();
                  onClose?.();
                }}
                style={[styles.row, { borderColor: colors.border }]}
              >
                <Text style={[styles.label, { color: colors.danger }]}>Logout</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
