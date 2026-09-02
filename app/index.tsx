import { View, ActivityIndicator } from "react-native";
import { colors } from "../src/theme";

// _layout.tsx's RootNavigation effect handles the actual redirect to
// (auth)/login or (tabs)/home based on auth state; this just renders a
// blank loading frame for the brief moment before that effect fires.
export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={colors.yellow} />
    </View>
  );
}
