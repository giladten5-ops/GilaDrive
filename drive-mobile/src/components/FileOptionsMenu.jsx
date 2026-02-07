import { Modal, View, Text, Pressable, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { colors } from "../ui/tokens";

export default function FileOptionsMenu({ visible, file, onClose, onAction }) {
  if (!file) return null;

  // Use isStarred to match the backend/web logic
  const isStarred = !!file.isStarred;
  const isTrashed = !!file.isTrashed;

  const options = isTrashed
    ? [
        { id: "restore", label: "Restore", icon: "⤴︎" },
        { id: "delete", label: "Delete forever", icon: "🗑️", color: colors.danger },
      ]
    : [
        {
          id: "star",
          label: isStarred ? "Remove from starred" : "Add to starred",
          icon: isStarred ? "⭐" : "☆",
        },
        { id: "rename", label: "Rename", icon: "✎" },
        { id: "share", label: "Share", icon: "🔗" },
        { id: "move", label: "Move to", icon: "📁" },
        { id: "delete", label: "Move to trash", icon: "🗑️", color: colors.danger },
      ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />

              <View style={styles.header}>
                <View style={styles.fileIcon}>
                   <Text style={{fontSize: 20}}>{file.name?.endsWith('.pdf') ? '📕' : '📄'}</Text>
                </View>
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
                  <Text style={styles.optionIcon}>{opt.icon}</Text>
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
  fileIcon: { marginRight: 16 },
  fileName: { fontSize: 16, fontWeight: '500', color: colors.text, flex: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24 },
  pressed: { backgroundColor: 'rgba(0,0,0,0.05)' },
  optionIcon: { fontSize: 20, width: 40, textAlign: 'center', color: colors.text },
  optionLabel: { fontSize: 16, color: colors.text },
});
