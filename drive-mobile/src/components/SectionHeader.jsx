// src/components/SectionHeader.js
import { View, Text, Pressable, StyleSheet } from "react-native";
import { spacing, radius } from "../ui/tokens";
import { useTheme } from "../ui/theme";

export default function SectionHeader({ title = "Files", viewMode, onToggleView }) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    row: {
      marginTop: 10,
      marginHorizontal: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: { fontSize: 18, fontWeight: "500", color: colors.text },
    toggle: {
      flexDirection: "row",
      backgroundColor: colors.bg,
      borderRadius: 16,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleBtn: {
      width: 40,
      height: 36,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    toggleBtnActive: { backgroundColor: colors.searchPill },
    toggleIcon: { color: colors.muted, fontSize: 18 },
    toggleIconActive: { color: colors.text },
  });
  return (
    <View style={styles.row}>
      {/* Dynamic title (e.g., "Files", "Shared", or "Recent") */}
      <Text style={styles.title}>{title}</Text>

      {/* The Toggle Switch Container */}
      <View style={styles.toggle}>
        
        {/* List View Button */}
        <Pressable
          onPress={() => onToggleView("list")}
          // If viewMode is "list", we apply the 'Active' background style
          style={[styles.toggleBtn, viewMode === "list" && styles.toggleBtnActive]}
        >
          {/* If active, the icon color changes to the main text color */}
          <Text style={[styles.toggleIcon, viewMode === "list" && styles.toggleIconActive]}>≣</Text>
        </Pressable>

        {/* Grid View Button */}
        <Pressable
          onPress={() => onToggleView("grid")}
          style={[styles.toggleBtn, viewMode === "grid" && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleIcon, viewMode === "grid" && styles.toggleIconActive]}>▦</Text>
        </Pressable>
      </View>
    </View>
  );
}
