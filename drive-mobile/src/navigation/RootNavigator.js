import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import DriveScreen from "../screens/DriveScreen";
import RegisterScreen from "../screens/registrationScreen";
import { useAuth } from "../auth/AuthContext";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { booting, isAuthed, setAuthed } = useAuth();

  if (booting) return null;

  return (
    <Stack.Navigator>
      {!isAuthed ? (

        <>
          <Stack.Screen name="Home" options={{ title: "Home" }}>
            {(props) => (
              <HomeScreen
                {...props}
                onGoLogin={() => props.navigation.navigate("Login")}
                onGoRegister={() => props.navigation.navigate("Register")}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Login" options={{ title: "Login" }}>
            {(props) => (
              <LoginScreen
                {...props}
                goHome={() => props.navigation.navigate("Home")}
                onLoggedIn={() => setAuthed(true)}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Register" options={{ title: "Register" }}>
            {(props) => (
              <RegisterScreen
                {...props}
                goLogin={() => props.navigation.navigate("Login")}
                onRegistered={() => props.navigation.navigate("Login")}
              />
            )}
          </Stack.Screen>
        </>
      ) : (
        <Stack.Screen
          name="Drive"
          component={DriveScreen}
          options={{ title: "Drive" }}
        />
      )}

        

    </Stack.Navigator>
  );
}
