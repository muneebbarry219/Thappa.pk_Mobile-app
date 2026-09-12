import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { IconCircle } from "../../src/components/IconCircle";
import { colors, fonts } from "../../src/theme";

function TabIcon({ name, focused, prominent = false }: { name: "home" | "pricetags" | "qr-code" | "gift" | "person"; focused?: boolean; prominent?: boolean }) {
  const size = prominent ? 64 : (focused ? 42 : 32);
  const iconSize = prominent ? 32 : (focused ? 21 : 17);
  return (
    <IconCircle
      name={name}
      size={size}
      iconSize={iconSize}
      backgroundColor={prominent || focused ? colors.yellow : colors.paper}
      iconColor={colors.forest}
      style={prominent ? styles.floatingQr : undefined}
    />
  );
}

function TabBarBackground() {
  return (
    <View pointerEvents="none" style={styles.navBackground}>
      <View style={styles.qrSlope} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.cream },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: fonts.extraBold, fontWeight: "800", fontSize: 18 },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 8,
          height: 78,
          overflow: "visible",
          shadowColor: colors.ink,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarShowLabel: false,
        tabBarItemStyle: { justifyContent: "center", paddingTop: 5 },
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home", headerShown: false, tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }} />
      <Tabs.Screen name="campaigns" options={{ title: "Campaigns", tabBarIcon: ({ focused }) => <TabIcon name="pricetags" focused={focused} /> }} />
      <Tabs.Screen name="scan" options={{ title: "Scan QR", tabBarIcon: ({ focused }) => <TabIcon name="qr-code" focused={focused} prominent />, tabBarIconStyle: { marginTop: -32 } }} />
      <Tabs.Screen name="rewards" options={{ title: "Rewards", tabBarIcon: ({ focused }) => <TabIcon name="gift" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  navBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderTopWidth: 1,
    borderTopColor: colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.paper,
  },
  qrSlope: {
    position: "absolute",
    alignSelf: "center",
    top: -28,
    width: 112,
    height: 56,
    borderRadius: 56,
    backgroundColor: colors.paper,
  },
  floatingQr: {
    borderWidth: 5,
    borderColor: colors.paper,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
  },
});
