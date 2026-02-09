// src/components/Breadcrumbs.jsx
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../ui/theme";

export default function Breadcrumbs({ crumbs, onCrumbPress }) {
  const { colors } = useTheme();
  if (!Array.isArray(crumbs) || crumbs.length === 0) return null;

  const styles = StyleSheet.create({
    wrap: {
      flexDirection: "row",
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
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pressed: { opacity: 0.7 },
    text: { maxWidth: 180, fontSize: 12.5 },
    link: { color: colors.primary, fontWeight: "700" },
    last: { color: colors.text, fontWeight: "700" },
    sep: { marginHorizontal: 6, color: colors.muted, fontSize: 16, marginTop: -1 },
  });

  return (
    <View style={styles.wrap}>
      {crumbs.map((c, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <View key={c.id ?? String(idx)} style={styles.part}>
            <Pressable
              onPress={() => onCrumbPress(idx)}
              disabled={isLast}
              style={({ pressed }) => [styles.btn, pressed && !isLast ? styles.pressed : null]}
              hitSlop={8}
            >
              <Text numberOfLines={1} style={[styles.text, isLast ? styles.last : styles.link]}>
                {c.name}
              </Text>
            </Pressable>

            {!isLast ? <Text style={styles.sep}>›</Text> : null}
          </View>
        );
      })}
    </View>
  );
}
