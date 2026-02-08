// src/components/BottomTabs.js
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../ui/tokens";

// A configuration array to keep the UI data separate from the rendering logic
const TABS = [
  { key: "home", label: "Home" },
  { key: "create", label: "Create" },
  { key: "upload", label: "Upload" },
];

export default function BottomTabs({ active, onHome, onCreate, onUpload }) {
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

const styles = StyleSheet.create({
  wrap: {
    height: 74,
    flexDirection: "row", // Aligns the tabs horizontally
    backgroundColor: colors.searchPill,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    alignItems: "center",
    justifyContent: "space-around", // Evenly spaces the 3 tabs across the screen
    paddingBottom: 8, // Adds a little breathing room at the bottom for modern phone gestures
  },
  tab: { 
    alignItems: "center", 
    justifyContent: "center", 
    width: "33.3333%" // 3 tabs = 33.3% each to fill the 100% width
  },
  label: { 
    fontSize: 13, 
    color: colors.muted, 
    fontWeight: "600" 
  },
  // This style overrides the default colors when a tab is selected
  on: { color: colors.text },
});
