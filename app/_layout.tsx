import { useEffect, useState } from "react";
import { Slot, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from "@expo-google-fonts/inter";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";
import { registerForPushNotificationsAsync } from "../src/notifications/registerPushToken";
import { NotificationsProvider } from "../src/notifications/NotificationContext";
import { CampaignProvider } from "../src/campaigns/CampaignContext";

function RootNavigation() {
  const { user, loading, isPreview } = useAuth();
  const [splashFinished, setSplashFinished] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const inAuthGroup = segments[0] === "(auth)";
  const inTabsGroup = segments[0] === "(tabs)";

  useEffect(() => {
    const splashTimer = setTimeout(() => setSplashFinished(true), 3000);
    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    // Expo Router cannot navigate until its root navigator has mounted.
    if (!splashFinished || loading || !rootNavigationState?.key) return;

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && !inTabsGroup) {
      router.replace("/(tabs)/home");
    }
  }, [inAuthGroup, inTabsGroup, loading, rootNavigationState?.key, router, splashFinished, user]);

  useEffect(() => {
    if (user && !isPreview) {
      registerForPushNotificationsAsync();
    }
  }, [user, isPreview]);

  return null;
}

export default function RootLayout() {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  return (
    <AuthProvider>
      <NotificationsProvider>
        <CampaignProvider>
          <StatusBar style="light" />
          <RootNavigation />
          <Slot />
        </CampaignProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
