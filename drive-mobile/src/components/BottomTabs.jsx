// src/components/BottomTabs.js
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../ui/theme";

const TABS = [
  { key: "home", label: "Home" },
  { key: "starred", label: "Starred" },
  { key: "shared", label: "Shared" },
];

export default function BottomTabs({ active, onTabPress }) {
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
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    tab: { alignItems: "center", justifyContent: "center", width: "33%" },
    label: { fontSize: 13, color: colors.muted, fontWeight: "600" },
    on: { color: colors.text },
  });

  return (
    <View style={styles.wrap}>
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Pressable key={t.key} onPress={() => onTabPress(t.key)} style={styles.tab}>
            <Text style={[styles.label, on && styles.on]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}