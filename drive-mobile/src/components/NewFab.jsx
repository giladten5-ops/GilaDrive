// src/components/NewFab.js
import { Pressable, Text, StyleSheet } from "react-native";
import { spacing } from "../ui/tokens";
import { useTheme } from "../ui/theme";

export default function NewFab({ onPress }) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    fab: {
      position: "absolute",
      right: spacing.lg,
      bottom: 90, 
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: colors.searchPill,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    plus: { 
      fontSize: 28, 
      color: colors.text, 
      marginTop: -2 
    },
  });
  return (
    // Pressable is used instead of Button to allow for custom circular styling
    <Pressable onPress={onPress} style={styles.fab}>
      <Text style={styles.plus}>＋</Text>
    </Pressable>
  );
}
