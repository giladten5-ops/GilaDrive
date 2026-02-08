// src/components/BottomTabs.js
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../ui/theme";

// A configuration array to keep the UI data separate from the rendering logic
const TABS = [
  { key: "home", label: "Home" },
  { key: "create", label: "Create" },
  { key: "upload", label: "Upload" },
];

export default function BottomTabs({ active, onHome, onCreate, onUpload }) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    wrap: {
      height: 74,
      flexDirection: "row",
      backgroundColor: colors.searchPill,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      alignItems: "center",
      justifyContent: "space-around",
      paddingBottom: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    tab: { 
      alignItems: "center", 
      justifyContent: "center", 
      width: "33.3333%"
    },
    label: { 
      fontSize: 13, 
      color: colors.muted, 
      fontWeight: "600" 
    },
    on: { color: colors.text },
  });
  return (
    <View style={styles.wrap}>
      {/* We loop through the TABS array to generate the buttons automatically */}
      {TABS.map((t) => {
        // 'on' is a boolean that checks if this specific tab matches the 'active' prop
        const on = t.key === active;
        const handlePress =
          t.key === "home" ? onHome : t.key === "create" ? onCreate : onUpload;
        
        return (
          <Pressable 
            key={t.key} 
            onPress={handlePress} 
            style={styles.tab}
          >
            {/* If 'on' is true, we apply the styles.on color to the icon and text */}
            <Text style={[styles.label, on && styles.on]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
