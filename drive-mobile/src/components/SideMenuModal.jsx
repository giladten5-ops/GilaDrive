import { Modal, View, Text, Pressable, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { colors, spacing, radius } from "../ui/tokens";

const ITEMS = [
  { key: "home", label: "My Drive", icon: "📁" },
  { key: "recent", label: "Recent", icon: "🕒" },
  { key: "starred", label: "Starred", icon: "⭐" },
  { key: "shared", label: "Shared", icon: "👥" },
  { key: "trash", label: "Trash", icon: "🗑️" },
];

export default function SideMenuModal({ visible, active, onClose, onSelect, onLogout }) {
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
                    <Text style={styles.icon}>{it.icon}</Text>
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
                <Text style={styles.icon}>⇥</Text>
                <Text style={[styles.label, { color: colors.danger }]}>Logout</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

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
  rowOn: { backgroundColor: "#E6F0FF" },
  icon: { width: 28, fontSize: 16 },
  label: { color: colors.text, fontWeight: "800" },
  labelOn: { color: colors.primary },
});

