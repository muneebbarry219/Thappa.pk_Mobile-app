import { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "../../src/components/AppText";
import { IconCircle } from "../../src/components/IconCircle";
import { formatCategory } from "../../src/campaigns/catalog";
import { useCampaigns } from "../../src/campaigns/CampaignContext";
import { apiErrorMessage } from "../../src/api/client";
import { colors, radius } from "../../src/theme";

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { availableCampaigns, campaignsLoaded, isJoined, joinCampaign } = useCampaigns();
  const [joining, setJoining] = useState(false);
  const campaign = availableCampaigns.find((item) => item._id === id);

  if (!campaign) {
    if (!campaignsLoaded) {
      return <SafeAreaView style={styles.notFound}><ActivityIndicator color={colors.forest} /></SafeAreaView>;
    }
    return <SafeAreaView style={styles.notFound}><Text style={styles.notFoundText}>This campaign is no longer available.</Text><TouchableOpacity style={styles.backToCampaigns} onPress={() => router.back()}><Text style={styles.backToCampaignsText}>Go back</Text></TouchableOpacity></SafeAreaView>;
  }
  const campaignId = campaign._id;
  const campaignBusiness = campaign.businessId.name;
  const joined = isJoined(campaignId);

  async function handleJoin() {
    if (joined) return router.push("/(tabs)/campaigns");

    setJoining(true);
    try {
      await joinCampaign(campaignId);
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
          </View>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={joined ? "View active campaigns" : `Join ${campaignBusiness} campaign`}
          style={[styles.joinButton, joined && styles.joinedButton]}
          onPress={handleJoin}
          disabled={joining}
        >
          <Text style={[styles.joinButtonText, joined && styles.joinedButtonText]}>
            {joined ? "Joined · View active campaigns" : joining ? "Joining..." : "Join campaign"}
          </Text>
        </TouchableOpacity>
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
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, backgroundColor: colors.cream },
  notFoundText: { color: colors.ink, fontSize: 18, fontWeight: "900", textAlign: "center" },
  backToCampaigns: { backgroundColor: colors.forest, borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 12, marginTop: 16 },
  backToCampaignsText: { color: colors.white, fontWeight: "900" },
});
