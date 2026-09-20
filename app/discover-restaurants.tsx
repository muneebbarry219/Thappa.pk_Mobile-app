import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Text } from "../src/components/AppText";
import { IconCircle } from "../src/components/IconCircle";
import { useCampaigns } from "../src/campaigns/CampaignContext";
import { campaignIcon, formatCategory, groupCampaignsByBusiness, isCampaignLive } from "../src/campaigns/catalog";
import { colors, radius } from "../src/theme";

/** Every restaurant/cafe currently running a Thappa campaign — reached from Home's "Popular restaurants" See All. */
export default function DiscoverRestaurantsScreen() {
  const { availableCampaigns, campaignsLoaded, refreshCampaigns } = useCampaigns();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { refreshCampaigns(); }, [refreshCampaigns]));

  const restaurants = useMemo(
    () => groupCampaignsByBusiness(availableCampaigns.filter(isCampaignLive)),
    [availableCampaigns],
  );

  async function onRefresh() {
    setRefreshing(true);
    await refreshCampaigns();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item._id}
        removeClippedSubviews={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.forest} />}
        ListHeaderComponent={
          <>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={styles.backButton} onPress={() => router.back()}>
              <IconCircle name="chevron-back" size={38} iconSize={20} />
              <Text style={styles.backText}>Home</Text>
            </TouchableOpacity>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>BROWSE BY PLACE</Text>
              <Text style={styles.title}>Restaurants{`\n`}& cafes.</Text>
              <Text style={styles.subtitle}>Every place running a Thappa campaign right now. Tap one to see all of its campaigns.</Text>
            </View>
            {campaignsLoaded && (
              <Text style={styles.resultCount}>
                {restaurants.length} {restaurants.length === 1 ? "restaurant" : "restaurants"} running campaigns
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !campaignsLoaded ? (
            <ActivityIndicator color={colors.forest} style={styles.loading} />
          ) : (
            <View style={styles.empty}><IconCircle name="storefront" size={56} iconSize={25} /><Text style={styles.emptyTitle}>No restaurants yet.</Text><Text style={styles.emptyCopy}>New places and rewards will appear here soon.</Text></View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} activeOpacity={0.85} onPress={() => router.push(`/business/${item._id}`)}>
            <IconCircle name={campaignIcon(item.category)} size={48} iconSize={21} />
            <View style={styles.rowInfo}>
              <Text style={styles.business}>{item.name}</Text>
              <Text style={styles.category}>{formatCategory(item.category)}</Text>
            </View>
            <View style={styles.stampGoal}>
              <Text style={styles.stampGoalNumber}>{item.campaignCount}</Text>
              <Text style={styles.stampGoalLabel}>{item.campaignCount === 1 ? "campaign" : "campaigns"}</Text>
            </View>
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
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.paper, borderRadius: radius.card, padding: 16 },
  rowInfo: { flex: 1, marginLeft: 11 },
  business: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  category: { color: colors.forest, fontSize: 10, fontWeight: "900", letterSpacing: 0.7, marginTop: 2, textTransform: "uppercase" },
  stampGoal: { alignItems: "center", backgroundColor: colors.cream, borderRadius: radius.small, paddingHorizontal: 9, paddingVertical: 7, marginLeft: 8 },
  stampGoalNumber: { color: colors.forest, fontSize: 16, fontWeight: "900", lineHeight: 18 },
  stampGoalLabel: { color: colors.muted, fontSize: 8, fontWeight: "800" },
  empty: { alignItems: "center", backgroundColor: colors.paper, borderRadius: radius.card, padding: 32, marginTop: 10 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 12 },
  emptyCopy: { color: colors.muted, textAlign: "center", fontSize: 13, marginTop: 6 },
});
