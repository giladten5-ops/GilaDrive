// src/components/DriveHeader.js
import { View, Text, Pressable, TextInput, StyleSheet, Image } from "react-native";
import { spacing, radius } from "../ui/tokens";
import { useTheme } from "../ui/theme";

export default function DriveHeader({
  searchValue,
  onChangeSearch,
  onSubmitSearch,
  onOpenMenu,
  onAvatarPress,
  avatarUri,
  avatarInitial,
}) {
  const { colors, mode, toggleTheme } = useTheme();
  const avatarLabel = avatarInitial || "U";
  const resolvedAvatarUri = typeof avatarUri === "string" && avatarUri.trim() ? avatarUri : null;
  const themeIcon = mode === "dark" ? "☀︎" : "☾";

  const styles = StyleSheet.create({
    wrap: {
      height: 64,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      backgroundColor: colors.bg,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    icon: { fontSize: 18, color: colors.text },
    searchPill: {
      flex: 1,
      height: 52,
      borderRadius: radius.pill,
      backgroundColor: colors.searchPill,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 8,
      paddingRight: 12,
      paddingHorizontal: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    //searchIcon: { color: colors.muted, fontSize: 16, marginRight: 10 },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      paddingVertical: 0,
      marginLeft: 4,
    },
    themeBtn: {
      height: 34,
      width: 34,
      paddingHorizontal: 0,
      borderRadius: 10,
      borderWidth: 0,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    
    themeIcon: {
      color: colors.text,
      fontSize: 20,
      lineHeight: 20,
      fontWeight: "700"
    },

    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      overflow: "hidden",
    },
    avatarText: { color: colors.primary, fontWeight: "900" },
    avatarImg: { width: "100%", height: "100%" },
  });

  return (
    <View style={styles.wrap}>

      {/* EVERYTHING is now inside the searchPill */}
      <View style={styles.searchPill}>

        <Pressable onPress={onOpenMenu} hitSlop={10} style={styles.iconBtn}>
          <Text style={styles.icon}>≡</Text>
        </Pressable>

        <TextInput
          value={searchValue}
          onChangeText={onChangeSearch}
          placeholder="Search in Drive"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={onSubmitSearch}
          autoCapitalize="none"
        />

        <Pressable
          onPress={toggleTheme}
          hitSlop={10}
          style={styles.themeBtn}
          accessibilityLabel="Toggle theme"
        >
          <Text style={styles.themeIcon}>{themeIcon}</Text>
        </Pressable>

        <Pressable onPress={onAvatarPress} hitSlop={10} style={styles.avatar}>
          {resolvedAvatarUri ? (
            <Image source={{ uri: resolvedAvatarUri }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>{avatarLabel}</Text>
          )}
        </Pressable>

      </View>
    </View>
  );
}
