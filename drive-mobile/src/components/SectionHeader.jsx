// src/components/SectionHeader.js
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../ui/tokens";

export default function SectionHeader({ title = "Files", viewMode, onToggleView }) {
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

const styles = StyleSheet.create({
  row: {
    marginTop: 10,
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 52,
    flexDirection: "row", // Horizontal layout for Title --- Toggle
    alignItems: "center",
    justifyContent: "space-between", // Pushes title to far left, toggle to far right
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: "500", color: colors.text },
  
  // The small gray capsule holding the two buttons
  toggle: {
    flexDirection: "row",
    backgroundColor: "#F1F3F4", // Light gray background common in Google UI
    borderRadius: 16,
    padding: 4,
  },
  toggleBtn: {
    width: 40,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  // The 'pill' effect that shows which mode is currently selected
  toggleBtnActive: { backgroundColor: colors.searchPill },
  
  toggleIcon: { color: colors.muted, fontSize: 18 },
  toggleIconActive: { color: colors.text },
});