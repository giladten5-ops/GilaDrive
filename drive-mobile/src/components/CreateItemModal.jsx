import { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../ui/tokens";
import PromptModal from "./PromptModal";

export default function CreateItemModal({ visible, onClose, onCreate, onUploadFromDevice, onAfterClose }) {
  const [step, setStep] = useState(null); // null | 'folder' | 'file'
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (visible) {
      setStep(null);
      setName("");
      setContent("");
    }
  }, [visible]);

  if (!visible) return null;

  if (step === "folder" || step === "file") {
    return (
      <PromptModal
        visible={visible}
        title={step === "folder" ? "New folder" : "New file"}
        label={step === "folder" ? "Folder name" : "File name"}
        value={name}
        onChangeValue={setName}
        placeholder={step === "folder" ? "e.g. Homework" : "e.g. notes.txt"}
        confirmText="Create"
        cancelText="Cancel"
        onCancel={onClose}
        onConfirm={() => {
          const trimmed = name.trim();
          if (!trimmed) return;
          onCreate?.({ type: step, name: trimmed, content: step === "file" ? content : undefined });
        }}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onDismiss={onAfterClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Create</Text>

          <Pressable style={styles.rowBtn} onPress={() => setStep("folder")}>
            <Text style={styles.rowIcon}>📁</Text>
            <Text style={styles.rowText}>Folder</Text>
          </Pressable>

          <Pressable style={styles.rowBtn} onPress={() => setStep("file")}>
            <Text style={styles.rowIcon}>📄</Text>
            <Text style={styles.rowText}>File</Text>
          </Pressable>

          <Pressable style={styles.rowBtn} onPress={onUploadFromDevice}>
            <Text style={styles.rowIcon}>⬆️</Text>
            <Text style={styles.rowText}>Upload from device</Text>
          </Pressable>

          <View style={{ height: spacing.md }} />
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 16, fontWeight: "900", color: colors.text, marginBottom: spacing.md },
  rowBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    marginBottom: spacing.sm,
  },
  rowIcon: { width: 34, fontSize: 18 },
  rowText: { color: colors.text, fontWeight: "800" },
  cancelBtn: {
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelText: { color: colors.muted, fontWeight: "800" },
});
