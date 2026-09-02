import { useCallback, useMemo, useState } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { Text } from "../../src/components/AppText";
import { useFocusEffect, useRouter } from "expo-router";
import { apiClient } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { MOCK_STAMP_CARDS } from "../../src/preview/mockData";
import { StampRow } from "../../src/components/StampRow";
import { colors, radius } from "../../src/theme";

interface StampCardSummary {
  _id: string;
  currentStamps: number;
  stampsRequired: number;
  businessId: { name: string; category: string };
  branchId: { name: string };
}

export default function HomeScreen() {
  const { isPreview, user } = useAuth();
  const [cards, setCards] = useState<StampCardSummary[]>(isPreview ? MOCK_STAMP_CARDS : []);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const totalStamps = useMemo(() => cards.reduce((total, card) => total + card.currentStamps, 0), [cards]);

  const load = useCallback(async () => {
    if (isPreview) return setCards(MOCK_STAMP_CARDS);
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
    <View style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.forest} />}
        ListHeaderComponent={
          <>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>YOUR LITTLE WINS</Text>
              <Text style={styles.greeting}>Hey {user?.name?.split(" ")[0] || "there"},</Text>
              <Text style={styles.heroTitle}>good things are{`\n`}adding up.</Text>
              <View style={styles.heroFooter}>
                <View><Text style={styles.total}>{totalStamps}</Text><Text style={styles.totalLabel}>stamps earned</Text></View>
                <TouchableOpacity style={styles.scanButton} onPress={() => router.push("/(tabs)/scan")}><Text style={styles.scanButtonText}>Scan a code  →</Text></TouchableOpacity>
              </View>
            </View>
            <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Your stamp cards</Text><Text style={styles.count}>{cards.length} active</Text></View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyMark}>✦</Text>
            <Text style={styles.emptyTitle}>Your first stamp is waiting.</Text>
            <Text style={styles.emptySubtitle}>Spot a Thappa QR at your favourite place and give it a scan.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("/(tabs)/scan")}><Text style={styles.emptyButtonText}>Open scanner</Text></TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const complete = item.currentStamps >= item.stampsRequired;
          return (
            <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={() => router.push(`/card/${item._id}`)}>
              <View style={styles.cardTop}><View style={styles.brandDot}><Text style={styles.brandInitial}>{item.businessId?.name?.slice(0, 1)}</Text></View><View style={styles.cardInfo}><Text style={styles.cardBusiness}>{item.businessId?.name}</Text><Text style={styles.cardBranch}>{item.branchId?.name} · {item.businessId?.category?.toLowerCase()}</Text></View><Text style={[styles.status, complete && styles.statusDone]}>{complete ? "Reward!" : `${item.currentStamps}/${item.stampsRequired}`}</Text></View>
              <View style={styles.stamps}><StampRow current={item.currentStamps} required={item.stampsRequired} /></View>
              <Text style={styles.cardHint}>{complete ? "You unlocked a treat — tap to view it." : `${item.stampsRequired - item.currentStamps} more to unlock your reward.`}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 16, paddingBottom: 30, gap: 12 },
  hero: { backgroundColor: colors.forest, borderRadius: radius.large, padding: 22, paddingTop: 24, overflow: "hidden" },
  eyebrow: { color: colors.yellow, fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  greeting: { color: colors.white, fontSize: 15, fontWeight: "700", marginTop: 18 },
  heroTitle: { color: colors.white, fontSize: 29, lineHeight: 33, fontWeight: "900", letterSpacing: -0.8, marginTop: 2 },
  heroFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 25 },
  total: { color: colors.yellow, fontSize: 29, fontWeight: "900", lineHeight: 31 },
  totalLabel: { color: colors.white, fontSize: 11, fontWeight: "700" },
  scanButton: { backgroundColor: colors.yellow, paddingHorizontal: 13, paddingVertical: 11, borderRadius: radius.pill },
  scanButtonText: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, marginBottom: 2 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "900", letterSpacing: -0.3 },
  count: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  card: { backgroundColor: colors.paper, borderRadius: radius.card, padding: 17, borderWidth: 1, borderColor: colors.line },
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
  empty: { alignItems: "center", backgroundColor: colors.paper, borderRadius: radius.card, padding: 29, borderWidth: 1, borderColor: colors.line },
  emptyMark: { color: colors.coral, fontSize: 29 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 9 },
  emptySubtitle: { color: colors.muted, textAlign: "center", fontSize: 13, lineHeight: 19, marginTop: 6 },
  emptyButton: { backgroundColor: colors.forest, borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 12, marginTop: 18 },
  emptyButtonText: { color: colors.white, fontWeight: "900", fontSize: 13 },
});
