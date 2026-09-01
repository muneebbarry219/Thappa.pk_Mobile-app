import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#14213d" },
        headerTintColor: "white",
        tabBarActiveTintColor: "#fca311",
        tabBarInactiveTintColor: "#9ca3af",
      }}
    >
      <Tabs.Screen name="home" options={{ title: "My Cards", tabBarIcon: () => <TabIcon emoji="🎫" /> }} />
      <Tabs.Screen name="scan" options={{ title: "Scan", tabBarIcon: () => <TabIcon emoji="📷" /> }} />
      <Tabs.Screen name="rewards" options={{ title: "Rewards", tabBarIcon: () => <TabIcon emoji="🎁" /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: () => <TabIcon emoji="👤" /> }} />
    </Tabs>
  );
}
