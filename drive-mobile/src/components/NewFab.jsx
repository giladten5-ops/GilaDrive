// src/components/NewFab.js
import { Pressable, Text, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../ui/tokens";

export default function NewFab({ onPress }) {
  return (
    // Pressable is used instead of Button to allow for custom circular styling
    <Pressable onPress={onPress} style={styles.fab}>
      <Text style={styles.plus}>＋</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    // 'absolute' takes the button out of the normal scroll flow 
    // and pins it to a specific spot on the screen.
    position: "absolute",
    right: spacing.lg,
    // We set it to 90 so it floats exactly above the BottomTabs (which are 74px tall)
    bottom: 90, 
    
    width: 56,
    height: 56,
    borderRadius: 18, // Modern "squircle" look rather than a perfect circle
    backgroundColor: colors.searchPill,
    borderWidth: 1,
    borderColor: colors.border,
    
    // Centering the plus icon inside the square
    alignItems: "center",
    justifyContent: "center",

    // iOS Shadow properties
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    
    // Android Shadow property (Elevation)
    elevation: 4,
  },
  plus: { 
    fontSize: 28, 
    color: colors.text, 
    // Small manual adjustment to visually center the '+' symbol vertically
    marginTop: -2 
  },
});