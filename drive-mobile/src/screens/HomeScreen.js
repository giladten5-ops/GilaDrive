import { Text, Button, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen({ onGoLogin, onGoRegister }) {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24 }}>Home Screen</Text>

      <View style={{ height: 12 }} />

      <Button title="Go to Login" onPress={onGoLogin} />
      <Button title="Go to Register" onPress={() => onGoRegister()} />
    </SafeAreaView>
  );
}
