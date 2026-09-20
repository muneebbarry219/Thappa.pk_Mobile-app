import { useCallback, useMemo } from "react";
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "../../src/components/AppText";
import { IconCircle } from "../../src/components/IconCircle";
import { useCampaigns } from "../../src/campaigns/CampaignContext";
import { campaignIcon, formatCategory, formatExpiry, isCampaignLive } from "../../src/campaigns/catalog";
import { colors, radius } from "../../src/theme";

/** All of one restaurant's live campaigns — reached by tapping it in the Restaurants discovery list. */
export default function BusinessCampaignsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { availableCampaigns, campaignsLoaded, joinedCampaignIds, refreshCampaigns } = useCampaigns();

  useFocusEffect(useCallback(() => { refreshCampaigns(); }, [refreshCampaigns]));

  const campaigns = useMemo(
    () => availableCampaigns.filter((campaign) => campaign.businessId._id === id && isCampaignLive(campaign)),
    [availableCampaigns, id],
  );
  const business = campaigns[0]?.businessId;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={campaigns}
        keyExtractor={(item) => item._id}
        removeClippedSubviews={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={styles.backButton} onPress={() => router.back()}>
              <IconCircle name="chevron-back" size={38} iconSize={20} />
              <Text style={styles.backText}>Restaurants</Text>
            </TouchableOpacity>
            {business ? (
              <View style={styles.hero}>
                <IconCircle name={campaignIcon(business.category)} size={52} iconSize={24} backgroundColor={colors.yellow} iconColor={colors.ink} />
                <Text style={styles.businessName}>{business.name}</Text>
                <Text style={styles.businessCategory}>{formatCategory(business.category)}</Text>
              </View>
            ) : campaignsLoaded ? (
              <View style={styles.hero}>
                <Text style={styles.businessName}>Not found</Text>
              </View>
            ) : null}
            {campaignsLoaded && !!campaigns.length && (
              <Text style={styles.resultCount}>
                {campaigns.length} active {campaigns.length === 1 ? "campaign" : "campaigns"}
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !campaignsLoaded ? (
            <ActivityIndicator color={colors.forest} style={styles.loading} />
          ) : (
            <View style={styles.empty}>
              <IconCircle name="storefront" size={56} iconSize={25} />
              <Text style={styles.emptyTitle}>No campaigns here right now.</Text>
              <Text style={styles.emptyCopy}>Check back soon for new rewards from this place.</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const joined = joinedCampaignIds.includes(item._id);
          return (
            <TouchableOpacity style={styles.campaign} activeOpacity={0.85} onPress={() => router.push(`/campaign/${item._id}`)}>
              <View style={styles.campaignInfo}>
                <View style={styles.campaignTop}>
                  <Text style={styles.offer}>{item.headline}</Text>
                  {joined && <View style={styles.joinedPill}><Text style={styles.joinedPillText}>JOINED</Text></View>}
                </View>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.expiry}>Ends {formatExpiry(item.expiresAt)}</Text>
              </View>
              <View style={styles.stampGoal}>
                <Text style={styles.stampGoalNumber}>{item.stampsRequired}</Text>
                <Text style={styles.stampGoalLabel}>stamps</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 16, paddingTop: 10, paddingBottom: 32, gap: 12 },
  backButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 15 },
  backText: { color: colors.forest, fontSize: 13, fontWeight: "900" },
  hero: { backgroundColor: colors.forest, borderRadius: radius.large, padding: 22, alignItems: "flex-start" },
  businessName: { color: colors.white, fontSize: 24, fontWeight: "900", letterSpacing: -0.6, marginTop: 13 },
  businessCategory: { color: colors.yellow, fontSize: 11, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 4 },
  resultCount: { color: colors.muted, fontSize: 12, fontWeight: "800", marginTop: 18, marginBottom: 1 },
  loading: { marginTop: 24 },
  campaign: { flexDirection: "row", alignItems: "center", backgroundColor: colors.paper, borderRadius: radius.card, padding: 16 },
  campaignInfo: { flex: 1, marginRight: 11 },
  campaignTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  offer: { color: colors.ink, fontSize: 15, fontWeight: "900", flexShrink: 1 },
  description: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 4 },
  expiry: { color: colors.forest, fontSize: 10, fontWeight: "800", marginTop: 6 },
  joinedPill: { backgroundColor: colors.mint, paddingHorizontal: 7, paddingVertical: 4, borderRadius: radius.pill },
  joinedPillText: { color: colors.white, fontWeight: "900", fontSize: 8, letterSpacing: 0.5 },
  stampGoal: { alignItems: "center", backgroundColor: colors.cream, borderRadius: radius.small, paddingHorizontal: 9, paddingVertical: 7 },
  stampGoalNumber: { color: colors.forest, fontSize: 16, fontWeight: "900", lineHeight: 18 },
  stampGoalLabel: { color: colors.muted, fontSize: 8, fontWeight: "800" },
  empty: { alignItems: "center", backgroundColor: colors.paper, borderRadius: radius.card, padding: 32, marginTop: 10 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 12 },
  emptyCopy: { color: colors.muted, textAlign: "center", fontSize: 13, marginTop: 6 },
});
