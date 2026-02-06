import { useState } from "react";
import { SafeAreaView, Text, Button, View, TextInput, StyleSheet, ScrollView } from "react-native";
import { registerUser } from "../api/api";
import { colors } from "../ui/tokens";

export default function RegisterScreen({ goLogin, onRegistered }) {
  // Local state for the registration form fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Feedback state for errors and network activity
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    // Basic "Front-end" validation to prevent unnecessary API calls
    if (!name || !username || !password) {
      return setErr("Please fill in all fields");
    }

    setErr("");
    setLoading(true);
    try {
      // Sends data to the Node.js backend. 
      // We pass null for image for now—you could add an image picker later!
      await registerUser({ username, name, password, image: null });
      
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

  return (
    <SafeAreaView style={styles.root}>
      {/* ScrollView ensures the form is usable on smaller screens or when the keyboard pops up */}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          style={styles.input}
        />

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
        />

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
    backgroundColor: colors.surface 
  },
  error: { color: colors.danger, marginBottom: 12, fontWeight: "600" },
});