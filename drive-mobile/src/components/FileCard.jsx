// src/components/FileCard.js
import { View, Text, Pressable, StyleSheet } from "react-native";
import { radius } from "../ui/tokens";
import { useTheme } from "../ui/theme";

export default function FileCard({ item, onPress, onMenuPress }) {
  const { colors } = useTheme();
  const isFolder = item.type === "folder";
  const extTag = getExtTag(item?.name);

  const styles = StyleSheet.create({
    wrap: { 
      flex: 1, // Allows the card to grow/shrink in the grid
      margin: 8, 
      backgroundColor: colors.bg, // Optional: add a slight card background
      borderRadius: radius.md,
    },
    topRow: { 
      flexDirection: "row", 
      alignItems: "center", 
      paddingVertical: 8,
      paddingHorizontal: 4 
    },
    icon: { fontSize: 18, marginRight: 8 },
    name: { 
      flex: 1, 
      fontSize: 14, 
      color: colors.text 
    },
    preview: {
      height: 100, // Reduced height for smaller grid items
      borderRadius: radius.md,
      backgroundColor: colors.border + '40', // Semi-transparent background
      alignItems: "center", 
      justifyContent: "center",
    },
    previewTag: { 
      paddingHorizontal: 12, 
      paddingVertical: 4, 
      borderRadius: 4, 
      color: "#fff", 
      fontSize: 12,
      fontWeight: "900" 
    },
    folderIcon: { fontSize: 40 } // Using an emoji or icon for folder preview
  });

  return (
    <Pressable onPress={() => onPress(item)} style={styles.wrap}>
      <View style={styles.preview}>
        {isFolder ? (
           <Text style={styles.folderIcon}>📁</Text>
        ) : (
          <Text style={[styles.previewTag, { backgroundColor: extTag.bg }]}>
            {extTag.label}
          </Text>
        )}
      </View>

      <View style={styles.topRow}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Pressable onPress={() => onMenuPress(item)} hitSlop={15}>
          <Text style={{ color: colors.muted, fontSize: 18 }}>⋮</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function getExtTag(name) {
  const n = String(name || "").toLowerCase();
  if (n.endsWith(".pdf")) return { label: "PDF", bg: "#EA4335" }; // Red
  if (n.endsWith(".doc") || n.endsWith(".docx")) return { label: "DOC", bg: "#1A73E8" }; // Blue
  if (n.endsWith(".ppt") || n.endsWith(".pptx")) return { label: "PPT", bg: "#FB8C00" }; // Orange
  if (n.endsWith(".xls") || n.endsWith(".xlsx")) return { label: "XLS", bg: "#34A853" }; // Green
  
  // Default fallback for unknown file types
  return { label: "FILE", bg: "#5F6368" }; 
}