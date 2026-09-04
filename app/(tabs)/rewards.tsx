import { useCallback, useState } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Text } from "../../src/components/AppText";
import { IconCircle } from "../../src/components/IconCircle";
import { useFocusEffect } from "expo-router";
import { apiClient } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { MOCK_STAMP_CARDS } from "../../src/preview/mockData";
import { colors, radius } from "../../src/theme";
import { useCampaigns } from "../../src/campaigns/CampaignContext";

interface StampCardWithReward {
  _id: string;
  businessId: { name: string };
  currentStamps: number;
  stampsRequired: number;
}

export default function RewardsScreen() {
  const { isPreview } = useAuth();
  const { campaigns: previewCampaigns } = useCampaigns();
  const [cards, setCards] = useState<StampCardWithReward[]>(isPreview ? MOCK_STAMP_CARDS : []);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    if (isPreview) return;
    try {
      const { data } = await apiClient.get("/customer/stamp-cards");
      setCards(data.data);
    } catch {
      // Retain the currently displayed list.
    }
  }, [isPreview]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false); }
  const unlocked = (isPreview ? previewCampaigns : cards).filter((card) => card.currentStamps >= card.stampsRequired);

  return (
    <View style={styles.container}>
      <FlatList
        data={unlocked}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.forest} />}
        ListHeaderComponent={<View style={styles.hero}><Text style={styles.eyebrow}>THE GOOD STUFF</Text><Text style={styles.title}>Rewards,{`\n`}on your radar.</Text><Text style={styles.sub}>Fill your stamp cards and your next little win will land right here.</Text></View>}
        ListEmptyComponent={<View style={styles.empty}><IconCircle name="gift" size={56} iconSize={26} /><Text style={styles.emptyTitle}>Nothing to claim - yet.</Text><Text style={styles.emptyCopy}>Your unlocked treats will wait here. Keep collecting!</Text></View>}
        renderItem={({ item }) => <View style={styles.reward}><IconCircle name="gift" size={43} iconSize={20} /><View style={{ flex: 1 }}><Text style={styles.rewardTitle}>A reward from {item.businessId?.name}</Text><Text style={styles.rewardCopy}>Your card is complete. Show this at the counter to redeem.</Text></View><View style={styles.ready}><Text style={styles.readyText}>READY</Text></View></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  hero: { backgroundColor: colors.yellow, borderRadius: radius.large, padding: 23 },
  eyebrow: { color: colors.ink, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 29, lineHeight: 33, fontWeight: "900", letterSpacing: -0.8, marginTop: 13 },
  sub: { color: colors.ink, fontSize: 13, lineHeight: 18, fontWeight: "600", marginTop: 12, maxWidth: 270 },
  reward: { flexDirection: "row", alignItems: "center", backgroundColor: colors.paper, borderRadius: radius.card, padding: 16, gap: 11 },
  rewardTitle: { color: colors.ink, fontSize: 14, fontWeight: "900", paddingRight: 4 },
  rewardCopy: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  ready: { backgroundColor: colors.mint, paddingHorizontal: 7, paddingVertical: 5, borderRadius: radius.pill },
  readyText: { color: colors.white, fontWeight: "900", fontSize: 8, letterSpacing: 0.5 },
  empty: { alignItems: "center", paddingHorizontal: 28, paddingVertical: 38, backgroundColor: colors.paper, borderRadius: radius.card },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 10 },
  emptyCopy: { color: colors.muted, textAlign: "center", fontSize: 13, marginTop: 6 },
});
