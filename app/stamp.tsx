import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "../src/components/AppText";
import { IconCircle } from "../src/components/IconCircle";
import { StampRow } from "../src/components/StampRow";
import { apiClient, apiErrorMessage } from "../src/api/client";
import { useAuth } from "../src/auth/AuthContext";
import { useCampaigns } from "../src/campaigns/CampaignContext";
import { useLaunchSplash } from "../src/launch/SplashContext";
import { useNotifications } from "../src/notifications/NotificationContext";
import { notifyStampAdded } from "../src/notifications/registerPushToken";
import { colors, radius } from "../src/theme";

type StampState =
  | { kind: "working" }
  | {
      kind: "stamped";
      businessName: string;
      headline: string;
      stamps: number;
      required: number;
      rewardUnlocked: boolean;
      rewardDescription: string;
    }
  | { kind: "error"; message: string };

const AUTO_RETURN_MS = 4000;

/**
 * Opened by a campaign stamp QR (thappa://stamp?campaign=…&cafe=…&t=…), from the
 * phone camera or the in-app scanner. Adds the stamp straight away if the
 * customer has joined the campaign, otherwise hands over to the join screen.
 */
export default function StampScreen() {
  const { t } = useLocalSearchParams<{ t?: string }>();
  const router = useRouter();
  const { user, loading, isPreview } = useAuth();
  const { dismissSplash } = useLaunchSplash();
  const { refreshCampaigns } = useCampaigns();
  const { addNotification } = useNotifications();
  const [state, setState] = useState<StampState>({ kind: "working" });
  const handledToken = useRef<string | null>(null);

  // Opened straight from the camera, the app skips the launch screen that normally dismisses the splash.
  useEffect(() => {
    dismissSplash();
  }, [dismissSplash]);

  useEffect(() => {
    if (loading || !user) return;
    if (!t) {
      setState({ kind: "error", message: "This QR code is incomplete. Ask staff to generate a new one." });
      return;
    }
    if (handledToken.current === t) return;
    handledToken.current = t;

    if (isPreview) {
      setState({ kind: "error", message: "Sign in with a Thappa account to collect stamps from a QR code." });
      return;
    }

    (async () => {
      try {
        const { data } = await apiClient.post("/customer/campaigns/stamp", { qrToken: t });
        if (data.status === "NOT_JOINED") {
          router.replace({ pathname: "/campaign/[id]", params: { id: String(data.campaign._id), qr: t } });
          return;
        }

        const { campaign } = data;
        const remaining = Math.max(0, campaign.stampsRequired - data.stampsCollected);
        setState({
          kind: "stamped",
          businessName: campaign.businessName,
          headline: campaign.headline,
          stamps: data.stampsCollected,
          required: campaign.stampsRequired,
          rewardUnlocked: data.rewardUnlocked,
          rewardDescription: campaign.rewardDescription,
        });
        addNotification({
          headline: data.rewardUnlocked ? "Reward unlocked!" : "Stamp added!",
          description: data.rewardUnlocked
            ? `${campaign.rewardDescription} at ${campaign.businessName} is ready to claim.`
            : `Stamp added for ${campaign.headline} at ${campaign.businessName}. ${remaining} more to go!`,
        });
        void notifyStampAdded(campaign.businessName, remaining);
        void refreshCampaigns();
      } catch (err) {
        setState({ kind: "error", message: apiErrorMessage(err) });
      }
    })();
  }, [addNotification, isPreview, loading, refreshCampaigns, router, t, user]);

  useEffect(() => {
    if (state.kind !== "stamped") return;
    const timer = setTimeout(() => router.replace("/(tabs)/home"), AUTO_RETURN_MS);
    return () => clearTimeout(timer);
  }, [router, state.kind]);

  if (state.kind === "working") {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.forest} size="large" />
        <Text style={styles.workingText}>Adding your stamp…</Text>
      </SafeAreaView>
    );
  }

  if (state.kind === "error") {
    return (
      <SafeAreaView style={styles.container}>
        <IconCircle name="alert" size={72} iconSize={30} />
        <Text style={styles.title}>Couldn’t add your stamp</Text>
        <Text style={styles.copy}>{state.message}</Text>
        <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => router.replace("/(tabs)/home")}>
          <Text style={styles.buttonText}>Go to home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const remaining = Math.max(0, state.required - state.stamps);
  return (
    <SafeAreaView style={styles.container}>
      <IconCircle name={state.rewardUnlocked ? "gift" : "checkmark"} size={72} iconSize={30} />
      <Text style={styles.eyebrow}>{state.businessName.toUpperCase()}</Text>
      <Text style={styles.title}>{state.rewardUnlocked ? "Reward unlocked!" : "Stamp added!"}</Text>
      <Text style={styles.headline}>{state.headline}</Text>
      <View style={styles.stampWrap}>
        <StampRow current={state.stamps} required={state.required} />
      </View>
      <Text style={styles.copy}>
        {state.rewardUnlocked
          ? `${state.rewardDescription} is ready. Show your reward code at the counter.`
          : `${remaining} more ${remaining === 1 ? "stamp" : "stamps"} until ${state.rewardDescription}.`}
      </Text>
      <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => router.replace("/(tabs)/home")}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, backgroundColor: colors.cream },
  workingText: { color: colors.ink, fontSize: 15, fontWeight: "800", marginTop: 16 },
  eyebrow: { color: colors.forest, fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginTop: 20 },
  title: { color: colors.ink, fontSize: 26, lineHeight: 32, fontWeight: "900", textAlign: "center", marginTop: 6 },
  headline: { color: colors.forest, fontSize: 15, lineHeight: 21, fontWeight: "800", textAlign: "center", marginTop: 6 },
  stampWrap: { alignSelf: "stretch", backgroundColor: colors.paper, borderRadius: radius.card, padding: 16, marginTop: 20 },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 14, marginBottom: 24 },
  button: { backgroundColor: colors.forest, borderRadius: radius.pill, paddingVertical: 15, paddingHorizontal: 32, alignItems: "center" },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: "900" },
});
