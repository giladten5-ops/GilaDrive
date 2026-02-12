import { useState } from "react";
import { Text, Button, View, TextInput, StyleSheet, ScrollView, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerUser } from "../api/api";
import { useTheme } from "../ui/theme";
import { pickImage } from "../utils/media";

export default function RegisterScreen({ goLogin, onRegistered }) {
  const { colors } = useTheme();
  // Local state for the registration form fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageErr, setImageErr] = useState("");
  const [passwordVerify, setPasswordVerify] = useState("");
  
  // Feedback state for errors and network activity
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    // Basic "Front-end" validation to prevent unnecessary API calls
    if (!name || !username || !password || !passwordVerify) {
      return setErr("Please fill in all fields");
    }
    if (password !== passwordVerify) {
      return setErr("Passwords do not match");
    }

    setErr("");
    setLoading(true);
    try {
      // Sends data to the Node.js backend. 
      // image is optional; if not selected send null
      await registerUser({ username, name, password, image: image || null });
      
      // onRegistered is passed from RootNavigator. 
      // In your case, it navigates the user back to the Login screen.
      if (onRegistered) onRegistered(); 
    } catch (e) {
      // Catch backend errors (e.g., "Username already exists")
      setErr(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePickImage(fromCamera) {
    setImageErr("");
    try {
      const picked = await pickImage({ fromCamera });
      if (!picked) return;
      setImage(picked.dataUrl);
      setImagePreview(picked.dataUrl);
    } catch (e) {
      setImage(null);
      setImagePreview("");
      setImageErr(e.message || "Failed to pick image");
    }
  }

  function handleClearImage() {
    setImage(null);
    setImagePreview("");
    setImageErr("");
  }

  const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    container: { padding: 20, justifyContent: "center", flexGrow: 1 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: colors.text },
    input: { 
      borderWidth: 1, 
      borderColor: colors.border, 
      padding: 12, 
      borderRadius: 8, 
      marginBottom: 16, 
      backgroundColor: colors.surface,
      color: colors.text,
    },
    error: { color: colors.danger, marginBottom: 12, fontWeight: "600" },
    photoBlock: {
      marginBottom: 18,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    photoLabel: { color: colors.text, fontWeight: "700", marginBottom: 10 },
    photoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    photo: { width: 74, height: 74, borderRadius: 37, backgroundColor: colors.bg },
    photoFallback: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    photoFallbackText: { color: "#fff", fontWeight: "800", fontSize: 28 },
    photoBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: colors.bg,
    },
    photoBtnText: { color: colors.text, fontWeight: "700", fontSize: 13 },
    photoBtnDanger: { backgroundColor: colors.surface },
    photoBtnDangerText: { color: colors.danger },
  });

  return (
    <SafeAreaView style={styles.root}>
      {/* ScrollView ensures the form is usable on smaller screens or when the keyboard pops up */}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          autoCapitalize="none"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <TextInput
          value={passwordVerify}
          onChangeText={setPasswordVerify}
          placeholder="Verify Password"
          secureTextEntry
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        <View style={styles.photoBlock}>
          <Text style={styles.photoLabel}>Profile picture (optional)</Text>
          <View style={styles.photoRow}>
            {imagePreview ? (
              <Image source={{ uri: imagePreview }} style={styles.photo} />
            ) : (
              <View style={styles.photoFallback}>
                <Text style={styles.photoFallbackText}>U</Text>
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Pressable style={styles.photoBtn} onPress={() => handlePickImage(false)}>
                <Text style={styles.photoBtnText}>Choose from gallery</Text>
              </Pressable>
              <View style={{ height: 8 }} />
              <Pressable style={styles.photoBtn} onPress={() => handlePickImage(true)}>
                <Text style={styles.photoBtnText}>Take a photo</Text>
              </Pressable>
              {imagePreview ? (
                <>
                  <View style={{ height: 8 }} />
                  <Pressable style={[styles.photoBtn, styles.photoBtnDanger]} onPress={handleClearImage}>
                    <Text style={[styles.photoBtnText, styles.photoBtnDangerText]}>Remove photo</Text>
                  </Pressable>
                </>
              ) : null}
            </View>
          </View>
          {imageErr ? <Text style={styles.error}>{imageErr}</Text> : null}
        </View>

        {/* Error display - only renders if there is actually an error message */}
        {err ? <Text style={styles.error}>{err}</Text> : null}

        <Button
          title={loading ? "Creating Account..." : "Register"}
          onPress={handleRegister}
          disabled={loading} // Prevent multiple submissions
        />

        <View style={{ height: 12 }} />
        {/* Simple link back to login if the user already has an account */}
        <Button title="Already have an account? Login" onPress={goLogin} />
      </ScrollView>
    </SafeAreaView>
  );
}
