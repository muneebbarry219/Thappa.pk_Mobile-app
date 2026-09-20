import { useCallback, useMemo, useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../src/components/AppText";
import { useFocusEffect, useRouter } from "expo-router";
import { apiClient } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { MOCK_STAMP_CARDS } from "../../src/preview/mockData";
import { IconCircle } from "../../src/components/IconCircle";
import { ActiveCampaignCard, useCampaigns, withJoinedCampaigns } from "../../src/campaigns/CampaignContext";
import { campaignIcon, formatCategory, groupCampaignsByBusiness, isCampaignLive } from "../../src/campaigns/catalog";
import { colors, outfitFonts, radius } from "../../src/theme";

export default function HomeScreen() {
  const { isPreview, user } = useAuth();
  const { campaigns, availableCampaigns, joinedCampaignIds, refreshCampaigns } = useCampaigns();
  const [cards, setCards] = useState<ActiveCampaignCard[]>(isPreview ? MOCK_STAMP_CARDS : []);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const displayedCards = isPreview ? campaigns : cards;
  const totalStamps = useMemo(() => displayedCards.reduce((total, card) => total + card.currentStamps, 0), [displayedCards]);
  // Joined campaigns count as active even before the first stamp.
  const activeCampaigns = useMemo(
    () =>
      withJoinedCampaigns(displayedCards, joinedCampaignIds, availableCampaigns).filter(
        (card) => card.currentStamps < card.stampsRequired && (card.currentStamps >= 1 || card.joined),
      ),
    [availableCampaigns, displayedCards, joinedCampaignIds],
  );
  const popularCampaigns = useMemo(
    () => availableCampaigns.filter((campaign) => !joinedCampaignIds.includes(campaign._id)).slice(0, 3),
    [availableCampaigns, joinedCampaignIds],
  );
  // Browsing a place isn't the same as joining one of its offers, so this isn't filtered by joinedCampaignIds.
  const popularRestaurants = useMemo(
    () => groupCampaignsByBusiness(availableCampaigns.filter(isCampaignLive)).slice(0, 3),
    [availableCampaigns],
  );

  const load = useCallback(async () => {
    if (isPreview) return;
    try {
      const [{ data }] = await Promise.all([apiClient.get("/customer/stamp-cards"), refreshCampaigns()]);
      setCards(data.data);
    } catch {
      // The screen remains usable even if a refresh misses.
    }
  }, [isPreview, refreshCampaigns]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.forest} />}
      >
            <View style={styles.pageHeader}>
              <View>
                <Text style={styles.welcome}>Welcome</Text>
                <Text style={styles.username}>{user?.name || "there"}</Text>
              </View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notifications" style={styles.notificationButton} onPress={() => router.push("/notifications")}>
                <IconCircle name="notifications" />
              </TouchableOpacity>
            </View>

            <ImageBackground
              source={require("../../assets/splash screen bg.png")}
              resizeMode="cover"
              style={styles.hero}
              imageStyle={styles.heroPattern}
            >
              <View style={styles.heroTop}>
                <Text style={styles.heroTitle}>Good things are{`\n`}adding up.</Text>
              </View>

              <View style={styles.heroFooter}>
                <View style={styles.statGroup}>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="View your stamps" onPress={() => router.push("/(tabs)/campaigns")}>
                    <Text style={styles.total}>{totalStamps}</Text>
                    <Text style={styles.totalLabel}>stamps done</Text>
                  </TouchableOpacity>
                  <View style={styles.statDivider} />
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="View active campaigns" onPress={() => router.push("/(tabs)/campaigns")}>
                    <Text style={styles.total}>{activeCampaigns.length}</Text>
                    <Text style={styles.totalLabel}>active campaigns</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="View rewards"
                style={styles.ticketButton}
                onPress={() => router.push("/(tabs)/rewards")}
              >
                <Ionicons name="ticket-outline" size={68} color={colors.white} style={styles.backTicket} />
                <Ionicons name="ticket" size={72} color={colors.yellow} style={styles.frontTicket} />
              </TouchableOpacity>
            </ImageBackground>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Your active campaigns</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/campaigns")}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
            </View>
            {activeCampaigns.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeRail}>
                {activeCampaigns.map((campaign) => (
                  <TouchableOpacity key={campaign._id} style={styles.activeCampaign} activeOpacity={0.85} onPress={() => router.push(campaign.pendingCampaignId ? `/campaign/${campaign.pendingCampaignId}` : `/card/${campaign._id}`)}>
                    <IconCircle name="storefront" size={38} iconSize={18} />
                    <Text style={styles.activeBusiness} numberOfLines={1}>{campaign.businessId.name}</Text>
                    <Text style={styles.activeProgress}>{campaign.currentStamps}/{campaign.stampsRequired} stamps</Text>
                    <View style={styles.activeProgressTrack}><View style={[styles.activeProgressFill, { width: `${(campaign.currentStamps / campaign.stampsRequired) * 100}%` }]} /></View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noActive}><Text style={styles.noActiveText}>Join a campaign or scan a Thappa QR code and it will appear here.</Text></View>
            )}
            <View style={styles.popularHeading}>
              <View style={styles.popularHeadingRow}>
                <Text style={styles.sectionTitle}>Popular campaigns</Text>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="See all available campaigns" onPress={() => router.push("/discover-campaigns")}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
              </View>
              <Text style={styles.count}>Join your next favourite</Text>
            </View>
            {popularCampaigns.length ? (
              <View style={{ gap: 12 }}>
                {popularCampaigns.map((item) => (
                  <TouchableOpacity key={item._id} style={styles.popularCampaign} activeOpacity={0.85} onPress={() => router.push(`/campaign/${item._id}`)}>
                    <IconCircle name={campaignIcon(item.businessId.category)} size={46} iconSize={21} />
                    <View style={styles.popularInfo}>
                      <Text style={styles.popularBusiness}>{item.businessId.name}</Text>
                      <Text style={styles.popularCategory}>{formatCategory(item.businessId.category)}</Text>
                      <Text style={styles.popularOffer}>{item.headline}</Text>
                    </View>
                    <View style={styles.stampGoal}><Text style={styles.stampGoalNumber}>{item.stampsRequired}</Text><Text style={styles.stampGoalLabel}>stamps</Text></View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.noActive}><Text style={styles.noActiveText}>No new campaigns right now. Check back soon.</Text></View>
            )}

            <View style={styles.popularHeading}>
              <View style={styles.popularHeadingRow}>
                <Text style={styles.sectionTitle}>Popular restaurants</Text>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="See all restaurants" onPress={() => router.push("/discover-restaurants")}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
              </View>
              <Text style={styles.count}>Browse by place</Text>
            </View>
            {popularRestaurants.length ? (
              <View style={{ gap: 12 }}>
                {popularRestaurants.map((restaurant) => (
                  <TouchableOpacity key={restaurant._id} style={styles.popularCampaign} activeOpacity={0.85} onPress={() => router.push(`/business/${restaurant._id}`)}>
                    <IconCircle name={campaignIcon(restaurant.category)} size={46} iconSize={21} />
                    <View style={styles.popularInfo}>
                      <Text style={styles.popularBusiness}>{restaurant.name}</Text>
                      <Text style={styles.popularCategory}>{formatCategory(restaurant.category)}</Text>
                    </View>
                    <View style={styles.stampGoal}>
                      <Text style={styles.stampGoalNumber}>{restaurant.campaignCount}</Text>
                      <Text style={styles.stampGoalLabel}>{restaurant.campaignCount === 1 ? "campaign" : "campaigns"}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.noActive}><Text style={styles.noActiveText}>No restaurants right now. Check back soon.</Text></View>
            )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 16, paddingTop: 10, paddingBottom: 30, gap: 12 },
  pageHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 17, paddingHorizontal: 2 },
  welcome: { color: colors.muted, fontFamily: outfitFonts.semibold, fontSize: 13, fontWeight: "600" },
  username: { color: colors.ink, fontFamily: outfitFonts.extraBold, fontSize: 23, lineHeight: 27, fontWeight: "800", letterSpacing: -0.5, marginTop: 1 },
  notificationButton: { alignItems: "center", justifyContent: "center" },
  hero: { backgroundColor: colors.forest, borderRadius: radius.large, padding: 22, paddingTop: 23, overflow: "hidden" },
  heroPattern: { borderRadius: radius.large },
  heroTop: { alignItems: "flex-start" },
  heroTitle: { color: colors.white, fontFamily: outfitFonts.black, fontSize: 27, lineHeight: 31, fontWeight: "900", letterSpacing: -0.8 },
  heroFooter: { alignItems: "flex-start", marginTop: 32 },
  statGroup: { flexDirection: "row", alignItems: "center", gap: 13 },
  statDivider: { width: 1, height: 34, backgroundColor: colors.white, opacity: 0.35 },
  total: { color: colors.yellow, fontFamily: outfitFonts.extraBold, fontSize: 29, fontWeight: "800", lineHeight: 31 },
  totalLabel: { color: colors.white, fontFamily: outfitFonts.semibold, fontSize: 11, fontWeight: "600" },
  ticketButton: { position: "absolute", width: 104, height: 90, right: 20, bottom: -34 },
  backTicket: { position: "absolute", right: 31, bottom: 5, transform: [{ rotate: "-15deg" }], opacity: 0.9 },
  frontTicket: { position: "absolute", right: 0, bottom: -4, transform: [{ rotate: "10deg" }] },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 22, marginBottom: 11 },
  sectionTitle: { color: colors.ink, fontFamily: outfitFonts.extraBold, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  count: { color: colors.muted, fontFamily: outfitFonts.medium, fontSize: 12, fontWeight: "500" },
  seeAll: { color: colors.forest, fontFamily: outfitFonts.bold, fontSize: 12, fontWeight: "700" },
  activeRail: { gap: 12, paddingRight: 16 },
  activeCampaign: { width: 164, backgroundColor: colors.paper, borderRadius: radius.card, padding: 14 },
  activeBusiness: { color: colors.ink, fontFamily: outfitFonts.bold, fontSize: 14, fontWeight: "700", marginTop: 12 },
  activeProgress: { color: colors.muted, fontFamily: outfitFonts.medium, fontSize: 11, fontWeight: "500", marginTop: 3 },
  activeProgressTrack: { height: 6, borderRadius: radius.pill, backgroundColor: colors.cream, overflow: "hidden", marginTop: 13 },
  activeProgressFill: { height: "100%", borderRadius: radius.pill, backgroundColor: colors.yellow },
  noActive: { backgroundColor: colors.paper, borderRadius: radius.card, padding: 16 },
  noActiveText: { color: colors.muted, fontFamily: outfitFonts.regular, fontSize: 12, lineHeight: 17 },
  popularHeading: { marginTop: 24, marginBottom: 10 },
  popularHeadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  popularCampaign: { flexDirection: "row", alignItems: "center", backgroundColor: colors.paper, borderRadius: radius.card, padding: 16 },
  popularInfo: { flex: 1, marginLeft: 11 },
  popularBusiness: { color: colors.ink, fontFamily: outfitFonts.bold, fontSize: 15, fontWeight: "700" },
  popularCategory: { color: colors.forest, fontFamily: outfitFonts.bold, fontSize: 10, fontWeight: "700", letterSpacing: 0.7, marginTop: 2, textTransform: "uppercase" },
  popularOffer: { color: colors.muted, fontFamily: outfitFonts.regular, fontSize: 11, lineHeight: 15, marginTop: 4 },
  stampGoal: { alignItems: "center", backgroundColor: colors.cream, borderRadius: radius.small, paddingHorizontal: 9, paddingVertical: 7, marginLeft: 8 },
  stampGoalNumber: { color: colors.forest, fontFamily: outfitFonts.extraBold, fontSize: 16, fontWeight: "800", lineHeight: 18 },
  stampGoalLabel: { color: colors.muted, fontFamily: outfitFonts.bold, fontSize: 8, fontWeight: "700" },
  card: { backgroundColor: colors.paper, borderRadius: radius.card, padding: 17 },
  cardTop: { flexDirection: "row", alignItems: "center" },
  brandDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.yellowSoft, alignItems: "center", justifyContent: "center" },
  brandInitial: { color: colors.forestDeep, fontFamily: outfitFonts.black, fontSize: 18, fontWeight: "900" },
  cardInfo: { flex: 1, marginLeft: 10 },
  cardBusiness: { color: colors.ink, fontFamily: outfitFonts.black, fontSize: 16, fontWeight: "900" },
  cardBranch: { color: colors.muted, fontFamily: outfitFonts.semibold, fontSize: 11, fontWeight: "600", marginTop: 2, textTransform: "capitalize" },
  status: { color: colors.forest, backgroundColor: colors.mint, fontFamily: outfitFonts.black, overflow: "hidden", paddingHorizontal: 9, paddingVertical: 6, borderRadius: radius.pill, fontSize: 11, fontWeight: "900" },
  statusDone: { color: colors.ink, backgroundColor: colors.yellow },
  stamps: { marginTop: 17 },
  cardHint: { color: colors.muted, fontFamily: outfitFonts.semibold, fontSize: 12, fontWeight: "600", marginTop: 12 },
  empty: { alignItems: "center", backgroundColor: colors.paper, borderRadius: radius.card, padding: 29 },
  emptyMark: { color: colors.coral, fontFamily: outfitFonts.bold, fontSize: 29 },
  emptyTitle: { color: colors.ink, fontFamily: outfitFonts.black, fontSize: 17, fontWeight: "900", marginTop: 9 },
  emptySubtitle: { color: colors.muted, fontFamily: outfitFonts.regular, textAlign: "center", fontSize: 13, lineHeight: 19, marginTop: 6 },
  emptyButton: { backgroundColor: colors.forest, borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 12, marginTop: 18 },
  emptyButtonText: { color: colors.white, fontFamily: outfitFonts.black, fontWeight: "900", fontSize: 13 },
});
