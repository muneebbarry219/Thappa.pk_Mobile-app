import { View, ActivityIndicator } from "react-native";

// _layout.tsx's RootNavigation effect handles the actual redirect to
// (auth)/login or (tabs)/home based on auth state; this just renders a
// blank loading frame for the brief moment before that effect fires.
export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: "#14213d", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#fca311" />
    </View>
  );
}
