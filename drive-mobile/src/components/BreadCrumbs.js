// src/components/Breadcrumbs.js
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../ui/tokens";

export default function Breadcrumbs({ crumbs, onCrumbPress }) {
  // Safety check: if there are no crumbs, don't render anything at all
  if (!Array.isArray(crumbs) || crumbs.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {/* We map through the path array (e.g., ["My Drive", "Photos", "2024"]) */}
      {crumbs.map((c, idx) => {
        // 'isLast' tells us if this is the folder the user is currently looking at
        const isLast = idx === crumbs.length - 1;

        return (
          <View key={c.id ?? String(idx)} style={styles.part}>
            <Pressable
              // We pass the index 'idx' back to the parent so it knows where to "slice" the path
              onPress={() => onCrumbPress(idx)}
              // You can't click the current folder (it's already open!)
              disabled={isLast}
              // This function-style 'style' prop handles the visual feedback when tapping
              style={({ pressed }) => [styles.btn, pressed && !isLast ? styles.pressed : null]}
              // 'hitSlop' makes the small button easier to tap by expanding the touch area
              hitSlop={8}
            >
              {/* 'numberOfLines={1}' ensures long folder names don't break the layout */}
              <Text numberOfLines={1} style={[styles.text, isLast ? styles.last : styles.link]}>
                {c.name}
              </Text>
            </Pressable>

            {/* Render the '›' separator between items, but not after the very last one */}
            {!isLast ? <Text style={styles.sep}>›</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    // 'flexWrap: wrap' ensures that if the path is very long, it flows to the next line
    flexWrap: "wrap", 
    alignItems: "center",
  },
  part: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
    marginBottom: 6,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999, // Makes the breadcrumb look like a pill/capsule
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  text: { maxWidth: 180, fontSize: 12.5 },
  // Blue/Primary color indicates it is a clickable link
  link: { color: colors.primary, fontWeight: "700" },
  // Darker/Text color indicates it is the current static location
  last: { color: colors.text, fontWeight: "700" },
  sep: { marginHorizontal: 6, color: colors.muted, fontSize: 16, marginTop: -1 },
});