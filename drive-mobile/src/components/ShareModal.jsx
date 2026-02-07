import { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../ui/tokens";
import PromptModal from "./PromptModal";

export default function ShareModal({ visible, file, onClose, onShare }) {
  const [username, setUsername] = useState("");
  const [perm, setPerm] = useState("read"); // 'read' | 'write'
  const [step, setStep] = useState("form"); // 'form' | 'username'

  useEffect(() => {
    if (visible) {
      setUsername("");
      setPerm("read");
      setStep("form");
    }
  }, [visible]);

  if (!visible) return null;

  if (step === "username") {
    return (
      <PromptModal
        visible={visible}
        title={`Share "${file?.name ?? "item"}"`}
        label="Username"
        value={username}
        onChangeValue={setUsername}
        placeholder="e.g. alice"
        confirmText="Next"
        cancelText="Cancel"
        onCancel={onClose}
        onConfirm={() => {
          if (!username.trim()) return;
          setStep("form");
        }}
      />
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title} numberOfLines={1}>
            Share "{file?.name ?? "item"}"
          </Text>

          <Pressable style={styles.userRow} onPress={() => setStep("username")}>
            <Text style={styles.userLabel}>User</Text>
            <Text style={styles.userValue} numberOfLines={1}>
              {username.trim() ? username.trim() : "Tap to enter"}
            </Text>
          </Pressable>

          <Text style={styles.section}>Permission</Text>
          <View style={styles.permRow}>
            <Pressable
              onPress={() => setPerm("read")}
              style={[styles.permBtn, perm === "read" && styles.permBtnOn]}
            >
              <Text style={[styles.permText, perm === "read" && styles.permTextOn]}>Read</Text>
            </Pressable>
            <Pressable
              onPress={() => setPerm("write")}
              style={[styles.permBtn, perm === "write" && styles.permBtnOn]}
            >
              <Text style={[styles.permText, perm === "write" && styles.permTextOn]}>Write</Text>
            </Pressable>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.btn} onPress={onClose}>
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnPrimary, !username.trim() && { opacity: 0.5 }]}
              disabled={!username.trim()}
              onPress={() => onShare?.({ username: username.trim(), permissionType: perm })}
            >
              <Text style={[styles.btnText, styles.btnPrimaryText]}>Share</Text>
            </Pressable>
          </View>
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
  title: { fontSize: 16, fontWeight: "900", color: colors.text },
  userRow: {
    marginTop: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  userLabel: { color: colors.muted, fontWeight: "700", fontSize: 12 },
  userValue: { marginTop: 6, color: colors.text, fontWeight: "800" },
  section: { marginTop: spacing.md, color: colors.muted, fontWeight: "700", fontSize: 12 },
  permRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  permBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  permBtnOn: { borderColor: colors.primary, backgroundColor: "#E6F0FF" },
  permText: { color: colors.text, fontWeight: "800" },
  permTextOn: { color: colors.primary },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  btnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  btnText: { fontWeight: "900", color: colors.text },
  btnPrimaryText: { color: "#fff" },
});

