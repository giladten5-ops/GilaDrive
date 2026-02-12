import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import DriveScreen from "../screens/DriveScreen";
import RegisterScreen from "../screens/registrationScreen";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../ui/theme";

// Create the Stack object which provides the 'Navigator' and 'Screen' components
const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  // We pull 'booting' and 'isAuthed' from our global context
  const { booting, isAuthed, setAuthed } = useAuth();
  const { colors } = useTheme();

  // If the app is still checking for a token in storage, render nothing (or a splash screen)
  // This prevents the user from seeing the Login screen for a split second before being logged in
  if (booting) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        headerShown: false,
      }}
    >
      {/* CONDITIONAL NAVIGATION BLOCK:
          If the user is NOT authenticated (!isAuthed), we render the Guest Stack.
          If they ARE authenticated, we render the Drive Stack.
      */}
      {!isAuthed ? (
        <>

          {/* LOGIN: The starting point for guests */}
          <Stack.Screen name="Login" options={{ title: "Login" }}>
            {(props) => (
              <LoginScreen
                {...props}
                goRegister={() => props.navigation.navigate("Register")}
                onLoggedIn={() => setAuthed(true)}
              />
            )}
          </Stack.Screen>

          {/* REGISTER: Where new users create accounts */}
          <Stack.Screen name="Register" options={{ title: "Register" }}>
            {(props) => (
              <RegisterScreen
                {...props}
                goLogin={() => props.navigation.navigate("Login")}
                // After registering, we send them to Login to verify their credentials
                onRegistered={() => props.navigation.navigate("Login")}
              />
            )}
          </Stack.Screen>
        </>
      ) : (
        /* DRIVE: The main app screen.
           Once this screen is rendered, the 'Guest Stack' above is unmounted 
           and can no longer be reached via the 'Back' button.
        */
        <Stack.Screen
          name="Drive"
          component={DriveScreen}
          options={{ title: "Drive" }}
        />
      )}
    </Stack.Navigator>
  );
}
