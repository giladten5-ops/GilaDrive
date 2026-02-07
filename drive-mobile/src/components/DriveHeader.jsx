// src/components/DriveHeader.js
import { View, Text, Pressable, TextInput, StyleSheet, Image } from "react-native";
import { colors, spacing, radius } from "../ui/tokens";

export default function DriveHeader({
  searchValue,
  onChangeSearch,
  onSubmitSearch,
  onOpenMenu,
  onRightAction,   // Used for the "Sparkle/AI" action
  onAvatarPress,
  avatarUri,
  avatarInitial,
}) {
  const avatarLabel = avatarInitial || "👤";
  const resolvedAvatarUri = typeof avatarUri === "string" && avatarUri.trim() ? avatarUri : null;

  return (
    <View style={styles.wrap}>
      {/* Menu Button (Hamburger) */}
      <Pressable onPress={onOpenMenu} hitSlop={10} style={styles.iconBtn}>
        <Text style={styles.icon}>≡</Text>
      </Pressable>

      {/* The Search Bar "Pill" container */}
      <View style={styles.searchPill}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={searchValue}
          onChangeText={onChangeSearch}
          placeholder="Search in Drive"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          // 'returnKeyType="search"' changes the keyboard button to say "Search"
          returnKeyType="search"
          // 'onSubmitEditing' triggers when the user presses the search button on keyboard
          onSubmitEditing={onSubmitSearch}
          autoCapitalize="none"
        />
      </View>

      {/* Sparkle Action Button */}
      <Pressable onPress={onRightAction} hitSlop={10} style={styles.iconBtn}>
        <Text style={styles.icon}>✦</Text>
      </Pressable>

      {/* Profile/Avatar Button - currently shows a Greek 'lambda' as a placeholder */}
      <Pressable onPress={onAvatarPress} hitSlop={10} style={styles.avatar}>
        {resolvedAvatarUri ? (
          <Image source={{ uri: resolvedAvatarUri }} style={styles.avatarImg} />
        ) : (
          <Text style={styles.avatarText}>{avatarLabel}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg,
    gap: 10, // Modern gap property creates even spacing between items
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
    flex: 1, // Takes up all remaining space between the icons
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.searchPill,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  searchIcon: { color: colors.muted, fontSize: 16, marginRight: 10 },
  searchInput: { 
    flex: 1, 
    color: colors.text, 
    fontSize: 14, 
    paddingVertical: 0 // Removes default Android/iOS inner padding
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
