import { Text, Button, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ui/theme";

export default function HomeScreen({ onGoLogin, onGoRegister }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg }}>
      <Text style={{ fontSize: 24, color: colors.text }}>Home Screen</Text>

      <View style={{ height: 12 }} />

      <Button title="Go to Login" onPress={onGoLogin} />
      <Button title="Go to Register" onPress={() => onGoRegister()} />
    </SafeAreaView>
  );
}
