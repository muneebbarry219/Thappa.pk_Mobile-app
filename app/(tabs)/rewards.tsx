import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { apiClient } from "../../src/api/client";

interface StampCardWithReward {
  _id: string;
  businessId: { name: string };
  currentStamps: number;
  stampsRequired: number;
}

// NOTE: this MVP screen shows unlocked-but-not-yet-redeemed rewards by
// reading each stamp card's most recent redemption via a per-card fetch on
// the card detail screen. For a dedicated "all pending rewards" list, add
// a GET /customer/redemptions?status=PENDING endpoint on the backend and
// swap the fetch below to call it directly.
export default function RewardsScreen() {
  const [cards, setCards] = useState<StampCardWithReward[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await apiClient.get("/customer/stamp-cards");
    setCards(data.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No rewards yet</Text>
            <Text style={styles.emptySubtitle}>Keep collecting stamps — your rewards will show up here once unlocked.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{item.businessId?.name}</Text>
            <Text style={styles.rowSubtitle}>
              {item.currentStamps} / {item.stampsRequired} stamps
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  row: { backgroundColor: "white", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e5e7eb" },
  rowTitle: { fontWeight: "700", color: "#14213d" },
  rowSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  empty: { alignItems: "center", marginTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151" },
  emptySubtitle: { fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 6 },
});
