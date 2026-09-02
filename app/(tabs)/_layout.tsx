import { Tabs } from "expo-router";
import { Text } from "../../src/components/AppText";
import { colors } from "../../src/theme";

function TabIcon({ label, focused }: { label: string; focused?: boolean }) {
  return <Text style={{ fontSize: 17, fontWeight: "800", color: focused ? colors.forest : colors.muted }}>{label}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.cream },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: "800", fontSize: 18 },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.line, height: 68, paddingTop: 7 },
        tabBarLabelStyle: { fontWeight: "700", fontSize: 11, paddingBottom: 5 },
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "My stamps", tabBarIcon: ({ focused }) => <TabIcon label="●" focused={focused} /> }} />
      <Tabs.Screen name="scan" options={{ title: "Scan", tabBarIcon: ({ focused }) => <TabIcon label="⌁" focused={focused} /> }} />
      <Tabs.Screen name="rewards" options={{ title: "Rewards", tabBarIcon: ({ focused }) => <TabIcon label="✦" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ focused }) => <TabIcon label="◒" focused={focused} /> }} />
    </Tabs>
  );
}
