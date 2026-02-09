// src/components/FileCard.js
import { View, Text, Pressable, StyleSheet } from "react-native";
import { spacing, radius } from "../ui/tokens";
import { useTheme } from "../ui/theme";

/**
 * FileCard: A grid-view component for files and folders.
 * It provides a visual preview and quick access to a contextual menu.
 */
export default function FileCard({ item, onPress, onMenuPress }) {
  const { colors } = useTheme();
  // Check if it's a folder to decide which icon and preview text to show
  const isFolder = item.type === "folder";
  
  // Get the brand color and label (PDF, DOC, etc.) based on the name extension
  const extTag = getExtTag(item?.name);

  const styles = StyleSheet.create({
    wrap: { 
      marginHorizontal: spacing.md, 
      marginTop: 12, 
      marginBottom: 8 
    },
    topRow: { 
      flexDirection: "row", 
      alignItems: "center", 
      paddingHorizontal: 6 
    },
    icon: { 
      width: 26, 
      textAlign: "center", 
      marginRight: 10 
    },
    name: { 
      flex: 1, 
      fontSize: 16, 
      fontWeight: "600", 
      color: colors.text 
    },
    menuContainer: { 
      padding: 4 
    },
    menu: { 
      fontSize: 22, 
      color: colors.muted, 
      fontWeight: 'bold' 
    },
    preview: {
      marginTop: 10,
      height: 170,
      borderRadius: radius.lg,
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    previewTag: { 
      paddingHorizontal: 18, 
      paddingVertical: 10, 
      borderRadius: 10, 
      color: "#fff", 
      fontWeight: "900" 
    },
    previewFolder: { 
      color: colors.muted, 
      fontWeight: "800" 
    },
    metaRow: { 
      marginTop: 10, 
      flexDirection: "row", 
      alignItems: "center", 
      paddingHorizontal: 6 
    },
    avatar: { 
      width: 34, 
      height: 34, 
      borderRadius: 17, 
      backgroundColor: colors.primary, 
      alignItems: "center", 
      justifyContent: "center", 
      marginRight: 10 
    },
    avatarText: { 
      color: "#fff", 
      fontWeight: "800" 
    },
    metaMain: { 
      color: colors.text, 
      fontWeight: "700" 
    },
    metaSub: { 
      color: colors.muted, 
      marginTop: 2 
    },
    star: { 
      color: colors.star, 
      fontSize: 16, 
      marginLeft: 10 
    },
  });

  return (
    /* The whole card is clickable to open the file or enter the folder.
      We pass the 'item' back to the parent so it knows what was clicked.
    */
    <Pressable onPress={() => onPress(item)} style={styles.wrap}>
      
      {/* 1. Top Row: Icon, Filename, and the Options Menu button */}
      <View style={styles.topRow}>
        <Text style={styles.icon}>{isFolder ? "📁" : "📄"}</Text>

        {/* numberOfLines={1} prevents long names from pushing the menu button off-screen */}
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        
        {/* The Vertical Dots menu. We use hitSlop to expand the touch area 
           without changing the actual size of the button.
        */}
        <Pressable 
          onPress={() => onMenuPress(item)} 
          hitSlop={15} 
          style={styles.menuContainer}
        >
          <Text style={styles.menu}>⋮</Text>
        </Pressable>
      </View>

      {/* 2. Preview Area: The large central box that represents the file type */}
      <View style={styles.preview}>
        {isFolder ? (
          <Text style={styles.previewFolder}>Folder</Text>
        ) : (
          /* For files, we show a colored tag (e.g., Red for PDF) */
          <Text style={[styles.previewTag, extTag.bg ? { backgroundColor: extTag.bg } : null]}>
            {extTag.label}
          </Text>
        )}
      </View>

      {/* 3. Meta Row: Avatar and activity info (Mirroring the Drive UI) */}
      <View style={styles.metaRow}>
        {/* Circle avatar with the user's initial */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>G</Text>
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={styles.metaMain}>You opened</Text>
          <Text style={styles.metaSub}>Recently</Text>
        </View>

        {/* The star icon only appears if the item is currently starred */}
        {item.isStarred ? <Text style={styles.star}>★</Text> : null}
      </View>
    </Pressable>
  );
}

/**
 * Helper: Maps common file extensions to Google-like brand colors.
 */
function getExtTag(name) {
  const n = String(name || "").toLowerCase();
  if (n.endsWith(".pdf")) return { label: "PDF", bg: "#EA4335" }; // Red
  if (n.endsWith(".doc") || n.endsWith(".docx")) return { label: "DOC", bg: "#1A73E8" }; // Blue
  if (n.endsWith(".ppt") || n.endsWith(".pptx")) return { label: "PPT", bg: "#FB8C00" }; // Orange
  if (n.endsWith(".xls") || n.endsWith(".xlsx")) return { label: "XLS", bg: "#34A853" }; // Green
  
  // Default fallback for unknown file types
  return { label: "FILE", bg: "#5F6368" }; 
}
