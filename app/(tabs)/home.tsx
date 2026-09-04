import { useCallback, useMemo, useState } from "react";
import { View, FlatList, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../src/components/AppText";
import { useFocusEffect, useRouter } from "expo-router";
import { apiClient } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { MOCK_STAMP_CARDS } from "../../src/preview/mockData";
import { IconCircle } from "../../src/components/IconCircle";
import { useCampaigns } from "../../src/campaigns/CampaignContext";
import { colors, radius } from "../../src/theme";

interface StampCardSummary {
  _id: string;
  currentStamps: number;
  stampsRequired: number;
  businessId: { name: string; category: string };
  branchId: { name: string };
}

const POPULAR_CAMPAIGNS = [
  { id: "popular-1", business: "Brew Lab", category: "Cafe", offer: "Buy 5 coffees, get 1 free", stamps: 5, icon: "cafe" as const },
  { id: "popular-2", business: "The Burger Barn", category: "Restaurant", offer: "Your 8th burger is on us", stamps: 8, icon: "restaurant" as const },
  { id: "popular-3", business: "Studio Glow", category: "Beauty", offer: "Collect 6 stamps for a free add-on", stamps: 6, icon: "cut" as const },
];

export default function HomeScreen() {
  const { isPreview, user } = useAuth();
  const { campaigns } = useCampaigns();
  const [cards, setCards] = useState<StampCardSummary[]>(isPreview ? MOCK_STAMP_CARDS : []);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const displayedCards = isPreview ? campaigns : cards;
  const totalStamps = useMemo(() => displayedCards.reduce((total, card) => total + card.currentStamps, 0), [displayedCards]);
  const activeCampaigns = useMemo(
    () => displayedCards.filter((card) => card.currentStamps >= 1 && card.currentStamps < card.stampsRequired),
    [displayedCards],
  );

  const load = useCallback(async () => {
    if (isPreview) return;
    try {
      const { data } = await apiClient.get("/customer/stamp-cards");
      setCards(data.data);
    } catch {
      // The screen remains usable even if a refresh misses.
    }
  }, [isPreview]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={POPULAR_CAMPAIGNS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.forest} />}
        ListHeaderComponent={
          <>
            <View style={styles.pageHeader}>
              <View>
                <Text style={styles.welcome}>Welcome</Text>
                <Text style={styles.username}>{user?.name || "there"}</Text>
              </View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notifications" style={styles.notificationButton} onPress={() => router.push("/notifications")}>
                <IconCircle name="notifications" />
              </TouchableOpacity>
            </View>

            <View style={styles.hero}>
              <View style={styles.heroTop}>
                <Text style={styles.heroTitle}>Good things are{`\n`}adding up.</Text>
                <TouchableOpacity style={styles.scanButton} onPress={() => router.push("/(tabs)/scan")}>
                  <Text style={styles.scanButtonText}>Scan a QR code</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.heroFooter}>
                <View style={styles.statGroup}>
                  <View>
                    <Text style={styles.total}>{totalStamps}</Text>
                    <Text style={styles.totalLabel}>stamps done</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View>
                    <Text style={styles.total}>{activeCampaigns.length}</Text>
                    <Text style={styles.totalLabel}>active campaigns</Text>
                  </View>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="View rewards"
                  style={styles.ticketButton}
                  onPress={() => router.push("/(tabs)/rewards")}
                >
                  <IconCircle name="ticket" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Your active campaigns</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/campaigns")}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
            </View>
            {activeCampaigns.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeRail}>
                {activeCampaigns.map((campaign) => (
                  <TouchableOpacity key={campaign._id} style={styles.activeCampaign} activeOpacity={0.85} onPress={() => router.push(`/card/${campaign._id}`)}>
                    <IconCircle name="storefront" size={38} iconSize={18} />
                    <Text style={styles.activeBusiness} numberOfLines={1}>{campaign.businessId.name}</Text>
                    <Text style={styles.activeProgress}>{campaign.currentStamps}/{campaign.stampsRequired} stamps</Text>
                    <View style={styles.activeProgressTrack}><View style={[styles.activeProgressFill, { width: `${(campaign.currentStamps / campaign.stampsRequired) * 100}%` }]} /></View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noActive}><Text style={styles.noActiveText}>Your active campaigns will appear here after your first scan.</Text></View>
            )}
            <View style={styles.popularHeading}>
              <Text style={styles.sectionTitle}>Popular campaigns</Text>
              <Text style={styles.count}>Join your next favourite</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.popularCampaign}>
            <IconCircle name={item.icon} size={46} iconSize={21} />
            <View style={styles.popularInfo}>
              <Text style={styles.popularBusiness}>{item.business}</Text>
              <Text style={styles.popularCategory}>{item.category}</Text>
              <Text style={styles.popularOffer}>{item.offer}</Text>
            </View>
            <View style={styles.stampGoal}><Text style={styles.stampGoalNumber}>{item.stamps}</Text><Text style={styles.stampGoalLabel}>stamps</Text></View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 16, paddingTop: 10, paddingBottom: 30, gap: 12 },
  pageHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 17, paddingHorizontal: 2 },
  welcome: { color: colors.muted, fontSize: 13, fontWeight: "700" },
  username: { color: colors.ink, fontSize: 23, lineHeight: 27, fontWeight: "900", letterSpacing: -0.5, marginTop: 1 },
  notificationButton: { alignItems: "center", justifyContent: "center" },
  hero: { backgroundColor: colors.forest, borderRadius: radius.large, padding: 22, paddingTop: 23, overflow: "hidden" },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  heroTitle: { color: colors.white, flex: 1, fontSize: 27, lineHeight: 31, fontWeight: "900", letterSpacing: -0.8 },
  scanButton: { backgroundColor: colors.yellow, paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.pill },
  scanButtonText: { color: colors.ink, fontSize: 11, fontWeight: "900" },
  heroFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 27 },
  statGroup: { flexDirection: "row", alignItems: "center", gap: 13 },
  statDivider: { width: 1, height: 34, backgroundColor: colors.white, opacity: 0.35 },
  total: { color: colors.yellow, fontSize: 29, fontWeight: "900", lineHeight: 31 },
  totalLabel: { color: colors.white, fontSize: 11, fontWeight: "700" },
  ticketButton: { alignItems: "center", justifyContent: "center" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 22, marginBottom: 11 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "900", letterSpacing: -0.3 },
  count: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  seeAll: { color: colors.forest, fontSize: 12, fontWeight: "900" },
  activeRail: { gap: 12, paddingRight: 16 },
  activeCampaign: { width: 164, backgroundColor: colors.paper, borderRadius: radius.card, padding: 14 },
  activeBusiness: { color: colors.ink, fontSize: 14, fontWeight: "900", marginTop: 12 },
  activeProgress: { color: colors.muted, fontSize: 11, fontWeight: "700", marginTop: 3 },
  activeProgressTrack: { height: 6, borderRadius: radius.pill, backgroundColor: colors.cream, overflow: "hidden", marginTop: 13 },
  activeProgressFill: { height: "100%", borderRadius: radius.pill, backgroundColor: colors.yellow },
  noActive: { backgroundColor: colors.paper, borderRadius: radius.card, padding: 16 },
  noActiveText: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  popularHeading: { marginTop: 24, marginBottom: 10 },
  popularCampaign: { flexDirection: "row", alignItems: "center", backgroundColor: colors.paper, borderRadius: radius.card, padding: 16 },
  popularInfo: { flex: 1, marginLeft: 11 },
  popularBusiness: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  popularCategory: { color: colors.forest, fontSize: 10, fontWeight: "900", letterSpacing: 0.7, marginTop: 2, textTransform: "uppercase" },
  popularOffer: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 4 },
  stampGoal: { alignItems: "center", backgroundColor: colors.cream, borderRadius: radius.small, paddingHorizontal: 9, paddingVertical: 7, marginLeft: 8 },
  stampGoalNumber: { color: colors.forest, fontSize: 16, fontWeight: "900", lineHeight: 18 },
  stampGoalLabel: { color: colors.muted, fontSize: 8, fontWeight: "800" },
  card: { backgroundColor: colors.paper, borderRadius: radius.card, padding: 17 },
  cardTop: { flexDirection: "row", alignItems: "center" },
  brandDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.yellowSoft, alignItems: "center", justifyContent: "center" },
  brandInitial: { color: colors.forestDeep, fontSize: 18, fontWeight: "900" },
  cardInfo: { flex: 1, marginLeft: 10 },
  cardBusiness: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  cardBranch: { color: colors.muted, fontSize: 11, fontWeight: "600", marginTop: 2, textTransform: "capitalize" },
  status: { color: colors.forest, backgroundColor: colors.mint, overflow: "hidden", paddingHorizontal: 9, paddingVertical: 6, borderRadius: radius.pill, fontSize: 11, fontWeight: "900" },
  statusDone: { color: colors.ink, backgroundColor: colors.yellow },
  stamps: { marginTop: 17 },
  cardHint: { color: colors.muted, fontSize: 12, fontWeight: "600", marginTop: 12 },
  empty: { alignItems: "center", backgroundColor: colors.paper, borderRadius: radius.card, padding: 29 },
  emptyMark: { color: colors.coral, fontSize: 29 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 9 },
  emptySubtitle: { color: colors.muted, textAlign: "center", fontSize: 13, lineHeight: 19, marginTop: 6 },
  emptyButton: { backgroundColor: colors.forest, borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 12, marginTop: 18 },
  emptyButtonText: { color: colors.white, fontWeight: "900", fontSize: 13 },
});
