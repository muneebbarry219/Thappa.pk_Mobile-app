import { Tabs } from "expo-router";
import { IconCircle } from "../../src/components/IconCircle";
import { colors } from "../../src/theme";

function TabIcon({ name, focused, prominent = false }: { name: "home" | "pricetags" | "scan" | "gift" | "person"; focused?: boolean; prominent?: boolean }) {
  const size = prominent ? 54 : 32;
  return <IconCircle name={name} size={size} iconSize={prominent ? 25 : 17} backgroundColor={focused || prominent ? colors.yellowSoft : colors.cream} iconColor={focused || prominent ? colors.forest : colors.muted} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.cream },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: "800", fontSize: 18 },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.paper, borderTopWidth: 0, elevation: 0, height: 76, paddingTop: 8 },
        tabBarLabelStyle: { fontWeight: "700", fontSize: 10, paddingBottom: 7 },
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home", headerShown: false, tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }} />
      <Tabs.Screen name="campaigns" options={{ title: "Campaigns", tabBarIcon: ({ focused }) => <TabIcon name="pricetags" focused={focused} /> }} />
      <Tabs.Screen name="scan" options={{ title: "Scan QR", tabBarIcon: ({ focused }) => <TabIcon name="scan" focused={focused} prominent />, tabBarIconStyle: { marginTop: -24 }, tabBarLabelStyle: { fontWeight: "700", fontSize: 10, paddingBottom: 7, marginTop: -1 } }} />
      <Tabs.Screen name="rewards" options={{ title: "Rewards", tabBarIcon: ({ focused }) => <TabIcon name="gift" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} /> }} />
    </Tabs>
  );
}
