import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "./tokens";

export const driveStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },

  surface: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
  },

  pill: {
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: "#EFE7E2", // warm tint like the screenshot
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },

  shadow: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  hPad: { paddingHorizontal: spacing.md },
});
