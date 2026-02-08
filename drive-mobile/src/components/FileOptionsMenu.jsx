import { Modal, View, Text, Pressable, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { colors } from "../ui/tokens";

export default function FileOptionsMenu({ visible, file, onClose, onAction }) {
  if (!file) return null;

  // Use isStarred to match the backend/web logic
  const isStarred = !!file.isStarred;
  const isTrashed = !!file.isTrashed;

  const options = isTrashed
    ? [
        { id: "restore", label: "Restore" },
        { id: "delete", label: "Delete forever", color: colors.danger },
      ]
    : [
        {
          id: "star",
          label: isStarred ? "Remove from starred" : "Add to starred",
        },
        { id: "rename", label: "Rename" },
        { id: "share", label: "Share" },
        { id: "move", label: "Move to" },
        { id: "delete", label: "Move to trash", color: colors.danger },
      ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />

              <View style={styles.header}>
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              </View>

              <View style={styles.divider} />

              {options.map((opt) => (
                <Pressable 
                  key={opt.id} 
                  style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}
                  onPress={() => {
                    onAction(opt.id, file);
                    onClose();
                  }}
                >
                  <Text style={[styles.optionLabel, opt.color ? { color: opt.color } : null]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
  },
  handle: {
    width: 32,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24 },
  fileName: { fontSize: 16, fontWeight: '500', color: colors.text, flex: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24 },
  pressed: { backgroundColor: 'rgba(0,0,0,0.05)' },
  optionLabel: { fontSize: 16, color: colors.text },
});
