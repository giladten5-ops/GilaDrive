// src/components/CreateItemModal.jsx
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FolderPlus, FileText, Upload, Camera, X } from "lucide-react-native";
import { useTheme } from "../ui/theme";

export default function CreateItemModal({ visible, onClose, onSelectAction }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.searchPill,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 12,
      paddingBottom: insets.bottom,
      width: "100%",
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    dragHandle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      marginBottom: 10,
    },
    title: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    list: {
      paddingHorizontal: 8,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 18,
      paddingHorizontal: 24,
    },
    iconWrap: {
      marginRight: 20,
    },
    itemLabel: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "500"
    },
  });

  const actions = [
    { id: "folder", label: "Folder", Icon: FolderPlus },
    { id: "file", label: "New File", Icon: FileText },
    { id: "upload", label: "Upload", Icon: Upload },
    { id: "camera", label: "Scan / Camera", Icon: Camera },
  ];

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <Text style={styles.title}>Create Something New</Text>
            <Pressable onPress={onClose}><X color={colors.muted} size={20} /></Pressable>
          </View>

          <View style={styles.list}>
            {actions.map((act) => (
              <Pressable
                key={act.id}
                style={({ pressed }) => [
                  styles.item,
                  { backgroundColor: pressed ? "rgba(255,255,255,0.05)" : "transparent" }
                ]}
                onPress={() => {
                  onClose();
                  onSelectAction(act.id);
                }}
              >
                <View style={styles.iconWrap}>
                  <act.Icon color={colors.text} size={24} />
                </View>
                <Text style={styles.itemLabel}>{act.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}