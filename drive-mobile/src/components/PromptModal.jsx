import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, radius } from "../ui/tokens";
import { useTheme } from "../ui/theme";

export default function PromptModal({
  visible,
  title,
  label,
  value,
  onChangeValue,
  placeholder,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  multiline = false,
  secureTextEntry = false,
  keyboardType = "default",
}) {
  const { colors } = useTheme();
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
      maxWidth: 360,
      alignSelf: "center",
      width: "100%",
    },
    title: { fontSize: 16, fontWeight: "800", color: colors.text },
    label: { marginTop: spacing.sm, color: colors.muted, fontWeight: "600" },
    input: {
      marginTop: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      color: colors.text,
    },
    inputMultiline: { height: 120, textAlignVertical: "top" },
    row: { flexDirection: "row", marginTop: spacing.lg, marginBottom: spacing.lg, gap: spacing.sm },
    btn: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingVertical: 12,
      borderRadius: radius.md,
      alignItems: "center",
    },
    btnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
    btnText: { fontWeight: "800", color: colors.text },
    btnPrimaryText: { color: "#fff" },
  });
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      supportedOrientations={['portrait', 'landscape']}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <SafeAreaView edges={['bottom', 'left', 'right']}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.sheet}
              >
                <Text style={styles.title}>{title}</Text>
                {label ? <Text style={styles.label}>{label}</Text> : null}

                <TextInput
                  value={value}
                  onChangeText={onChangeValue}
                  placeholder={placeholder}
                  placeholderTextColor={colors.muted}
                  style={[styles.input, multiline && styles.inputMultiline]}
                  autoCapitalize="none"
                  secureTextEntry={secureTextEntry}
                  keyboardType={keyboardType}
                  multiline={multiline}
                />

                <View style={styles.row}>
                  <Pressable onPress={onCancel} style={styles.btn}>
                    <Text style={styles.btnText}>{cancelText}</Text>
                  </Pressable>
                  <Pressable
                    onPress={onConfirm}
                    style={[styles.btn, styles.btnPrimary]}
                    disabled={!onConfirm}
                  >
                    <Text style={[styles.btnText, styles.btnPrimaryText]}>{confirmText}</Text>
                  </Pressable>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
