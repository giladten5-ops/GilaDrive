import { useState } from "react";
import { Text, Button, View, TextInput, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginUser, setToken } from "../api/api"; // adjust path if needed
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../ui/theme";

export default function Login({ goHome, onLoggedIn }) {
  const { colors } = useTheme();
  const { setUser } = useAuth();
  // We use local state to 'control' the inputs. 
  // This means the screen knows exactly what is typed at every moment.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // UI state variables:
  // 'err' stores error messages from the server to show the user.
  // 'loading' tracks if a network request is currently flying.
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // The main logic function that runs when the 'Login' button is pressed.
  async function doLogin() {
    setErr("");         // Clear any previous errors
    setLoading(true);   // Start the loading spinner/disable button
    
    try {
      // Call the API utility function. This sends a POST request to the backend.
      const data = await loginUser({ username, password });

      // After a successful login, the server should send back a JWT or Session token.
      const token = data?.token;
      if (!token) throw new Error("Token missing in response");

      // Save the token to local storage (AsyncStorage) so the app remembers who you are.
      await setToken(token);
      await setUser({
        userId: data?.userId ?? null,
        username: username.trim(),
        name: data?.name ?? username.trim(),
        image: data?.image ?? null,
      });

      // This callback tells the 'RootNavigator' to switch from Guest screens to the Drive screen.
      if (onLoggedIn) onLoggedIn();
    } catch (e) {
      // If the API throws an error (like 401 Unauthorized), we catch it and update 'err'.
      setErr(e.message || "Login failed");
    } finally {
      // We set loading back to false so the user can try again if they failed.
      setLoading(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: colors.bg }}>
        <Text style={{ fontSize: 24, marginBottom: 16, color: colors.text }}>Login</Text>

        {/* Input for the username. autoCapitalize is off because usernames are usually lowercase. */}
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="username"
          autoCapitalize="none"
          placeholderTextColor={colors.muted}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
            padding: 10,
            borderRadius: 8,
            marginBottom: 12,
          }}
        />

        {/* Input for the password. secureTextEntry masks the text for privacy. */}
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="password"
          secureTextEntry
          placeholderTextColor={colors.muted}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
            padding: 10,
            borderRadius: 8,
            marginBottom: 12,
          }}
        />

        {/* If 'err' has a value, we render a red error message. Otherwise, we render nothing. */}
        {err ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{err}</Text> : null}

        {/* We disable the button when loading=true to prevent the user from clicking 10 times. */}
        <Button
          title={loading ? "Logging in..." : "Login"}
          onPress={doLogin}
          disabled={loading}
        />

        <View style={{ height: 12 }} />
        {/* Simple navigation callback to go back to the previous (Home) screen. */}
        <Button title="Back to Home" onPress={goHome} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
