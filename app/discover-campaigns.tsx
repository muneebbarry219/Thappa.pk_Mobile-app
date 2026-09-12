import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Text } from "../src/components/AppText";
import { IconCircle } from "../src/components/IconCircle";
import { useCampaigns } from "../src/campaigns/CampaignContext";
import { campaignIcon, formatCategory } from "../src/campaigns/catalog";
import { colors, radius } from "../src/theme";

export default function DiscoverCampaignsScreen() {
  const { availableCampaigns, campaignsLoaded, joinedCampaignIds, refreshCampaigns } = useCampaigns();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { refreshCampaigns(); }, [refreshCampaigns]));

  const unjoinedCampaigns = useMemo(
    () => availableCampaigns.filter((campaign) => !joinedCampaignIds.includes(campaign._id)),
    [availableCampaigns, joinedCampaignIds],
  );

  async function onRefresh() {
    setRefreshing(true);
    await refreshCampaigns();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={unjoinedCampaigns}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.forest} />}
        ListHeaderComponent={
          <>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={styles.backButton} onPress={() => router.back()}>
              <IconCircle name="chevron-back" size={38} iconSize={20} />
              <Text style={styles.backText}>Home</Text>
            </TouchableOpacity>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>FIND YOUR NEXT FAVOURITE</Text>
              <Text style={styles.title}>Campaigns{`\n`}to explore.</Text>
              <Text style={styles.subtitle}>These are the rewards you have not joined yet. Join one, then scan the business’s Thappa QR at checkout to collect stamps.</Text>
            </View>
            {campaignsLoaded && (
              <Text style={styles.resultCount}>
                {unjoinedCampaigns.length} {unjoinedCampaigns.length === 1 ? "campaign" : "campaigns"} waiting for you
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !campaignsLoaded ? (
            <ActivityIndicator color={colors.forest} style={styles.loading} />
          ) : availableCampaigns.length ? (
            <View style={styles.empty}><IconCircle name="checkmark" size={56} iconSize={25} backgroundColor={colors.mint} iconColor={colors.white} /><Text style={styles.emptyTitle}>You have joined them all.</Text><Text style={styles.emptyCopy}>Check back soon for new places and rewards.</Text></View>
          ) : (
            <View style={styles.empty}><IconCircle name="pricetags" size={56} iconSize={25} /><Text style={styles.emptyTitle}>No campaigns yet.</Text><Text style={styles.emptyCopy}>New places and rewards will appear here soon.</Text></View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.campaign} activeOpacity={0.85} onPress={() => router.push(`/campaign/${item._id}`)}>
            <IconCircle name={campaignIcon(item.businessId.category)} size={48} iconSize={21} />
            <View style={styles.campaignInfo}>
              <Text style={styles.business}>{item.businessId.name}</Text>
              <Text style={styles.category}>{formatCategory(item.businessId.category)}</Text>
              <Text style={styles.offer}>{item.headline}</Text>
            </View>
            <View style={styles.stampGoal}><Text style={styles.stampGoalNumber}>{item.stampsRequired}</Text><Text style={styles.stampGoalLabel}>stamps</Text></View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 16, paddingTop: 10, paddingBottom: 32, gap: 12 },
  backButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 15 },
  backText: { color: colors.forest, fontSize: 13, fontWeight: "900" },
  hero: { backgroundColor: colors.forest, borderRadius: radius.large, padding: 22 },
  eyebrow: { color: colors.yellow, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: colors.white, fontSize: 28, lineHeight: 32, fontWeight: "900", letterSpacing: -0.7, marginTop: 9 },
  subtitle: { color: colors.white, fontSize: 13, lineHeight: 19, marginTop: 9, maxWidth: 300, opacity: 0.9 },
  resultCount: { color: colors.muted, fontSize: 12, fontWeight: "800", marginTop: 18, marginBottom: 1 },
  loading: { marginTop: 24 },
  campaign: { flexDirection: "row", alignItems: "center", backgroundColor: colors.paper, borderRadius: radius.card, padding: 16 },
  campaignInfo: { flex: 1, marginLeft: 11 },
  business: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  category: { color: colors.forest, fontSize: 10, fontWeight: "900", letterSpacing: 0.7, marginTop: 2, textTransform: "uppercase" },
  offer: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 4 },
  stampGoal: { alignItems: "center", backgroundColor: colors.cream, borderRadius: radius.small, paddingHorizontal: 9, paddingVertical: 7, marginLeft: 8 },
  stampGoalNumber: { color: colors.forest, fontSize: 16, fontWeight: "900", lineHeight: 18 },
  stampGoalLabel: { color: colors.muted, fontSize: 8, fontWeight: "800" },
  empty: { alignItems: "center", backgroundColor: colors.paper, borderRadius: radius.card, padding: 32, marginTop: 10 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 12 },
  emptyCopy: { color: colors.muted, textAlign: "center", fontSize: 13, marginTop: 6 },
});
