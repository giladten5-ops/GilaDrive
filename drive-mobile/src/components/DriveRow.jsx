import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing } from "../ui/tokens";

export default function DriveRow({ item, onPress, onMenuPress }) {
  const isFolder = item.type === "folder";

  return (
    <Pressable onPress={onPress} style={styles.row}>
      {/* Icon: Circular container with a simple emoji */}
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{isFolder ? "📁" : "📄"}</Text>
      </View>

      {/* Info: Flex 1 pushes the menu button to the far right */}
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>
          {isFolder ? "Folder" : "File"}
          {item.starred ? " • Starred" : ""}
        </Text>
      </View>

      {/* Menu Button: We use hitSlop to make the small '⋮' easier to tap */}
      <Pressable 
        onPress={() => onMenuPress(item)} 
        hitSlop={20} 
        style={styles.menuBtn}
      >
        <Text style={styles.menuIcon}>⋮</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  icon: { fontSize: 18 },
  name: { fontSize: 14, fontWeight: "600", color: colors.text },
  meta: { marginTop: 2, fontSize: 12, color: colors.muted },
  menuBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  menuIcon: { 
    fontSize: 22, 
    color: colors.muted,
    fontWeight: 'bold'
  },
});