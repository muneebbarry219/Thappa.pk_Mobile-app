import { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { apiClient } from "../../src/api/client";
import { StampRow } from "../../src/components/StampRow";

interface StampCardSummary {
  _id: string;
  currentStamps: number;
  stampsRequired: number;
  businessId: { name: string; category: string };
  branchId: { name: string };
}

export default function HomeScreen() {
  const [cards, setCards] = useState<StampCardSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/customer/stamp-cards");
      setCards(data.data);
    } catch {
      // Swallow errors here; a real app would show a toast/banner.
    }
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
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No stamp cards yet</Text>
            <Text style={styles.emptySubtitle}>Scan a QR at a Thappa-partnered business to start collecting stamps.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/card/${item._id}`)}>
            <Text style={styles.cardBusiness}>{item.businessId?.name}</Text>
            <Text style={styles.cardBranch}>{item.branchId?.name}</Text>
            <View style={{ marginTop: 12 }}>
              <StampRow current={item.currentStamps} required={item.stampsRequired} />
            </View>
            <Text style={styles.cardProgress}>
              {item.currentStamps} / {item.stampsRequired} stamps
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb" },
  cardBusiness: { fontSize: 16, fontWeight: "700", color: "#14213d" },
  cardBranch: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  cardProgress: { fontSize: 12, color: "#6b7280", marginTop: 8 },
  empty: { alignItems: "center", marginTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151" },
  emptySubtitle: { fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 6 },
});
