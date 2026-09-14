import { useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "../../src/components/AppText";
import { IconCircle } from "../../src/components/IconCircle";
import { formatCategory, formatExpiry, isCampaignLive } from "../../src/campaigns/catalog";
import { useCampaigns } from "../../src/campaigns/CampaignContext";
import { apiErrorMessage } from "../../src/api/client";
import { colors, radius } from "../../src/theme";
import { useAlertPrompt } from "../../src/components/PromptProvider";

export default function CampaignDetailScreen() {
  // `qr` is set when a stamp QR was scanned before the customer joined this campaign.
  const { id, qr } = useLocalSearchParams<{ id: string; qr?: string }>();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { availableCampaigns, campaignsLoaded, isJoined, joinCampaign } = useCampaigns();
  const Alert = useAlertPrompt();
  const [joining, setJoining] = useState(false);
  const campaign = availableCampaigns.find((item) => item._id === id && isCampaignLive(item));

  if (!campaign) {
    if (!campaignsLoaded) {
      return <SafeAreaView style={styles.notFound}><ActivityIndicator color={colors.forest} /></SafeAreaView>;
    }
    return <SafeAreaView style={styles.notFound}><Text style={styles.notFoundText}>This campaign has ended or is no longer available.</Text><TouchableOpacity style={styles.backToCampaigns} onPress={() => router.back()}><Text style={styles.backToCampaignsText}>Go back</Text></TouchableOpacity></SafeAreaView>;
  }
  const campaignId = campaign._id;
  const campaignBusiness = campaign.businessId.name;
  const joined = isJoined(campaignId);

  function handleScan() {
    router.push({ pathname: "/(tabs)/scan", params: { openCamera: "1" } });
  }

  async function handleJoin() {
    if (joined) return handleScan();

    setJoining(true);
    try {
      await joinCampaign(campaignId);
      if (qr) {
        // Use the same QR to add the stamp now that the customer has joined.
        router.replace({ pathname: "/stamp", params: { t: qr } });
        return;
      }
      Alert.alert("You’re in!", `${campaignBusiness} is now in your active campaigns. Scan their Thappa QR at checkout to collect stamps.`, [
        { text: "Stay here", style: "cancel" },
        { text: "View active campaigns", onPress: () => router.push("/(tabs)/campaigns") },
      ]);
    } catch (err) {
      Alert.alert("Couldn’t join campaign", apiErrorMessage(err));
    } finally {
      setJoining(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={[styles.heroWrap, { height: Math.round(height * 0.3) }]}>
        <Image source={require("../../assets/campaign-hero.png")} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.heroShade} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={styles.backButton} onPress={() => router.back()}>
          <IconCircle name="chevron-back" size={42} iconSize={22} backgroundColor="rgba(255,255,255,0.92)" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoryPill}><Text style={styles.category}>{formatCategory(campaign.businessId.category)}</Text></View>
        <Text style={styles.title}>{campaignBusiness}</Text>
        <Text style={styles.headline}>{campaign.headline}</Text>
        <Text style={styles.description}>{campaign.description}</Text>
        <View style={styles.goalRow}>
          <IconCircle name="ribbon" size={40} iconSize={19} />
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{campaign.stampsRequired} stamps to your reward</Text>
            <Text style={styles.goalCopy}>Reward: {campaign.rewardDescription}</Text>
            <Text style={styles.goalCopy}>Ends {formatExpiry(campaign.expiresAt)}</Text>
          </View>
        </View>
        {qr && !joined && <Text style={styles.qrHint}>Join this campaign to collect the stamp from the code you just scanned.</Text>}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={joined ? "Scan QR to collect a stamp" : `Join ${campaignBusiness} campaign`}
          style={[styles.joinButton, joined && styles.joinedButton]}
          onPress={handleJoin}
          disabled={joining}
        >
          <Text style={[styles.joinButtonText, joined && styles.joinedButtonText]}>
            {joined ? "Scan QR to collect a stamp" : joining ? "Joining..." : qr ? "Join & collect stamp" : "Join campaign"}
          </Text>
        </TouchableOpacity>
        {joined && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="View active campaigns"
            style={styles.secondaryButton}
            onPress={() => router.push("/(tabs)/campaigns")}
          >
            <Text style={styles.secondaryButtonText}>View active campaigns</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  heroWrap: { position: "relative", backgroundColor: colors.forest },
  heroImage: { width: "100%", height: "100%" },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(15, 45, 28, 0.16)" },
  backButton: { position: "absolute", top: 13, left: 16 },
  content: { padding: 22, paddingTop: 25, paddingBottom: 34, flexGrow: 1 },
  categoryPill: { alignSelf: "flex-start", backgroundColor: colors.yellowSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  category: { color: colors.forest, fontSize: 10, fontWeight: "900", letterSpacing: 0.9, textTransform: "uppercase" },
  title: { color: colors.ink, fontSize: 31, lineHeight: 36, fontWeight: "900", letterSpacing: -0.8, marginTop: 13 },
  headline: { color: colors.forest, fontSize: 17, lineHeight: 23, fontWeight: "900", marginTop: 8 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 9 },
  goalRow: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: colors.paper, borderRadius: radius.card, padding: 15, marginTop: 25, marginBottom: 20 },
  goalInfo: { flex: 1 },
  goalTitle: { color: colors.ink, fontSize: 14, fontWeight: "900" },
  goalCopy: { color: colors.muted, fontSize: 12, marginTop: 3 },
  joinButton: { backgroundColor: colors.forest, minHeight: 52, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", marginTop: "auto", paddingVertical: 15, marginBottom: 2 },
  joinButtonText: { color: colors.white, fontSize: 15, fontWeight: "900" },
  joinedButton: { backgroundColor: colors.yellow },
  joinedButtonText: { color: colors.ink },
  secondaryButton: { alignItems: "center", justifyContent: "center", paddingVertical: 13, marginTop: 4 },
  secondaryButtonText: { color: colors.forest, fontSize: 13, fontWeight: "800" },
  qrHint: { color: colors.forest, fontSize: 13, lineHeight: 19, fontWeight: "800", textAlign: "center", marginBottom: 12 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, backgroundColor: colors.cream },
  notFoundText: { color: colors.ink, fontSize: 18, fontWeight: "900", textAlign: "center" },
  backToCampaigns: { backgroundColor: colors.forest, borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 12, marginTop: 16 },
  backToCampaignsText: { color: colors.white, fontWeight: "900" },
});
