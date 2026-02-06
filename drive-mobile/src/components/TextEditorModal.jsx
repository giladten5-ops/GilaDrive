// src/components/TextEditorModal.js
import { Modal, View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { colors, spacing, radius } from "../ui/tokens";

export default function TextEditorModal({
  visible,
  fileName,
  value,
  onChange,
  onSave,
  onClose,
  isSaving,
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.container}
      >
        {/* Cute Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>{fileName}</Text>
          <Pressable onPress={onSave} disabled={isSaving}>
            <Text style={[styles.saveText, isSaving && { opacity: 0.5 }]}>
              {isSaving ? "..." : "Save"}
            </Text>
          </Pressable>
        </View>

        {/* Text Area */}
        <TextInput
          style={styles.input}
          multiline
          value={value}
          onChangeText={onChange}
          autoFocus
          placeholder="Start typing your magic..."
          placeholderTextColor={colors.muted}
          spellCheck={false}
          autoCapitalize="none"
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF5F7" }, // Very light pink/blush
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#FFE0E9",
  },
  title: { flex: 1, textAlign: "center", fontWeight: "700", marginHorizontal: 10, color: "#D16A86" },
  cancelText: { color: colors.muted, fontWeight: "600" },
  saveText: { color: "#FF4D8D", fontWeight: "800", fontSize: 16 },
  input: {
    flex: 1,
    padding: 20,
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", // Coding feel
    color: "#4A4A4A",
    textAlignVertical: "top",
  },
});
