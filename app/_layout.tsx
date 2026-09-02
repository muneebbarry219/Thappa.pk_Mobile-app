import { useEffect } from "react";
import { Slot, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from "@expo-google-fonts/inter";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";
import { registerForPushNotificationsAsync } from "../src/notifications/registerPushToken";

function RootNavigation() {
  const { user, loading, isPreview } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const inAuthGroup = segments[0] === "(auth)";

  useEffect(() => {
    // Expo Router cannot navigate until its root navigator has mounted.
    if (loading || !rootNavigationState?.key) return;

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [inAuthGroup, loading, rootNavigationState?.key, router, user]);

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
      <StatusBar style="light" />
      <RootNavigation />
      <Slot />
    </AuthProvider>
  );
}
