// src/components/DriveRow.js
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing } from "../ui/tokens";

export default function DriveRow({ item, onPress }) {
  // Helper boolean to decide which icon and metadata label to show
  const isFolder = item.type === "folder";

  return (
    <Pressable onPress={onPress} style={styles.row}>
      {/* 1. Left Section: The Icon Wrapper */}
      <View style={styles.iconWrap}>
        {/* Simple emoji icons used as placeholders for folders vs files */}
        <Text style={styles.icon}>{isFolder ? "📁" : "📄"}</Text>
      </View>

      {/* 2. Middle Section: Name and Metadata */}
      {/* 'flex: 1' makes this section grow to take up all space between the icon and the star */}
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={styles.name}>
          {item.name}
        </Text>
        <Text style={styles.meta}>
          {isFolder ? "Folder" : "File"}
          {/* Only append the "Starred" text if the property is true */}
          {item.starred ? " • Starred" : ""}
        </Text>
      </View>

      {/* 3. Right Section: Star Indicator */}
      {/* We show a colored star for active items and a hollow one for inactive ones */}
      {item.starred ? (
        <Text style={styles.star}>★</Text>
      ) : (
        <Text style={styles.starOff}>☆</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", // Horizontal layout: [Icon] [Text Content] [Star]
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    // Add a border bottom if you want a divider between rows
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21, // Perfect circle (width / 2)
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  icon: { fontSize: 18 },
  name: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: colors.text 
  },
  meta: { 
    marginTop: 2, 
    fontSize: 12, 
    color: colors.muted 
  },
  star: { 
    fontSize: 16, 
    color: "#F9AB00", // Gold color for starred items
    marginLeft: spacing.sm 
  },
  starOff: { 
    fontSize: 16, 
    color: colors.border, 
    marginLeft: spacing.sm 
  },
});