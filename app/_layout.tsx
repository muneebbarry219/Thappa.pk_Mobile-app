import { useCallback, useEffect, useRef, useState } from "react";
import { Slot, useGlobalSearchParams, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold, Outfit_900Black } from "@expo-google-fonts/outfit";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";
import { registerForPushNotificationsAsync } from "../src/notifications/registerPushToken";
import { NotificationsProvider } from "../src/notifications/NotificationContext";
import { CampaignProvider } from "../src/campaigns/CampaignContext";
import { SplashProvider } from "../src/launch/SplashContext";
import { PromptProvider } from "../src/components/PromptProvider";
import { fonts } from "../src/theme";

function RootNavigation({ splashFinished }: { splashFinished: boolean }) {
  const { user, loading, isPreview } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const inAuthGroup = segments[0] === "(auth)";
  const inTabsGroup = segments[0] === "(tabs)";
  const inProtectedDetail = ["discover-campaigns", "discover-restaurants", "campaign", "card", "business", "notifications", "stamp"].includes(segments[0] || "");
  const { t: stampToken } = useGlobalSearchParams<{ t?: string }>();
  // A stamp QR opened while signed out is remembered and finished right after sign-in.
  const pendingStampToken = useRef<string | null>(null);

  useEffect(() => {
    // Expo Router cannot navigate until its root navigator has mounted.
    if (!splashFinished || loading || !rootNavigationState?.key) return;

    if (!user && !inAuthGroup) {
      if (segments[0] === "stamp" && typeof stampToken === "string") pendingStampToken.current = stampToken;
      router.replace("/(auth)/login");
    } else if (user && pendingStampToken.current) {
      const token = pendingStampToken.current;
      pendingStampToken.current = null;
      router.replace({ pathname: "/stamp", params: { t: token } });
    } else if (user && !inTabsGroup && !inProtectedDetail) {
      router.replace("/(tabs)/home");
    }
  }, [inAuthGroup, inProtectedDetail, inTabsGroup, loading, rootNavigationState?.key, router, segments, splashFinished, stampToken, user]);

  useEffect(() => {
    if (user && !isPreview) {
      registerForPushNotificationsAsync();
    }
  }, [user, isPreview]);

  return null;
}

export default function RootLayout() {
  const [splashFinished, setSplashFinished] = useState(false);
  const dismissSplash = useCallback(() => setSplashFinished(true), []);

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <NotificationsProvider>
        <CampaignProvider>
          <PromptProvider>
            <SplashProvider value={{ dismissSplash }}>
              <StatusBar style="light" />
              <RootNavigation splashFinished={splashFinished} />
              <Slot />
            </SplashProvider>
          </PromptProvider>
        </CampaignProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
