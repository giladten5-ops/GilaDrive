import { useState } from "react";
import { SafeAreaView, Text, Button, View, TextInput, StyleSheet, ScrollView } from "react-native";
import { registerUser } from "../api/api";
import { colors } from "../ui/tokens";

export default function RegisterScreen({ goLogin, onRegistered }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !username || !password) {
      return setErr("Please fill in all fields");
    }

    setErr("");
    setLoading(true);
    try {
      // Note: your api.js expect { username, name, image, password }
      // We pass null for image for now
      await registerUser({ username, name, password, image: null });
      
      // Usually after registration, we send them to login or auto-login
      if (onRegistered) onRegistered(); 
    } catch (e) {
      setErr(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
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

        {err ? <Text style={styles.error}>{err}</Text> : null}

        <Button
          title={loading ? "Creating Account..." : "Register"}
          onPress={handleRegister}
          disabled={loading}
        />

        <View style={{ height: 12 }} />
        <Button title="Already have an account? Login" onPress={goLogin} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, justifyContent: "center", flexGrow: 1 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 8, marginBottom: 16, backgroundColor: colors.surface },
  error: { color: colors.danger, marginBottom: 12, fontWeight: "600" },
});