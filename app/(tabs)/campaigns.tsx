import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Text } from "../../src/components/AppText";
import { IconCircle } from "../../src/components/IconCircle";
import { apiClient } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { MOCK_STAMP_CARDS } from "../../src/preview/mockData";
import { StampRow } from "../../src/components/StampRow";
import { useCampaigns } from "../../src/campaigns/CampaignContext";
import { colors, radius } from "../../src/theme";

interface Campaign {
  _id: string;
  currentStamps: number;
  stampsRequired: number;
  businessId: { name: string; category: string };
  branchId: { name: string };
}

export default function CampaignsScreen() {
  const { isPreview } = useAuth();
  const { campaigns: previewCampaigns } = useCampaigns();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(isPreview ? MOCK_STAMP_CARDS : []);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (isPreview) return;
    try {
      const { data } = await apiClient.get("/customer/stamp-cards");
      setCampaigns(data.data);
    } catch {
      // Keep the prior list visible when a refresh fails.
    }
  }, [isPreview]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false); }

  return (
    <View style={styles.container}>
      <FlatList
        data={isPreview ? previewCampaigns.filter((campaign) => campaign.currentStamps < campaign.stampsRequired) : campaigns}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.forest} />}
        ListHeaderComponent={<View style={styles.hero}><IconCircle name="pricetags" size={48} iconSize={22} /><Text style={styles.title}>Active campaigns</Text><Text style={styles.subtitle}>Every stamp card you are collecting is right here.</Text></View>}
        ListEmptyComponent={<View style={styles.empty}><IconCircle name="pricetags" size={56} iconSize={25} /><Text style={styles.emptyTitle}>No active campaigns yet.</Text><Text style={styles.emptyCopy}>Scan a Thappa QR code to start collecting stamps.</Text></View>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.campaign} activeOpacity={0.85} onPress={() => router.push(`/card/${item._id}`)}>
            <View style={styles.campaignTop}>
              <IconCircle name="storefront" size={42} iconSize={19} />
              <View style={styles.campaignInfo}>
                <Text style={styles.business}>{item.businessId.name}</Text>
                <Text style={styles.branch}>{item.branchId.name} - {item.businessId.category.toLowerCase()}</Text>
              </View>
              <Text style={styles.progress}>{item.currentStamps}/{item.stampsRequired}</Text>
            </View>
            <View style={styles.stamps}><StampRow current={item.currentStamps} required={item.stampsRequired} /></View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  hero: { backgroundColor: colors.forest, borderRadius: radius.large, padding: 22 },
  title: { color: colors.white, fontSize: 28, fontWeight: "900", letterSpacing: -0.7, marginTop: 18 },
  subtitle: { color: colors.white, fontSize: 13, lineHeight: 18, marginTop: 6, maxWidth: 275 },
  campaign: { backgroundColor: colors.paper, borderRadius: radius.card, padding: 16 },
  campaignTop: { flexDirection: "row", alignItems: "center" },
  campaignInfo: { flex: 1, marginLeft: 11 },
  business: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  branch: { color: colors.muted, fontSize: 11, fontWeight: "600", marginTop: 2, textTransform: "capitalize" },
  progress: { color: colors.forest, backgroundColor: colors.cream, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 6, fontSize: 11, fontWeight: "900" },
  stamps: { marginTop: 16 },
  empty: { alignItems: "center", backgroundColor: colors.paper, borderRadius: radius.card, padding: 32 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 12 },
  emptyCopy: { color: colors.muted, textAlign: "center", fontSize: 13, marginTop: 6 },
});
