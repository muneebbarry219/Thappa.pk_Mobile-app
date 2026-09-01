import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { apiClient } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { findMockCard } from "../../src/preview/mockData";
import { StampRow } from "../../src/components/StampRow";

interface CardDetail {
  _id: string;
  currentStamps: number;
  stampsRequired: number;
  businessId: { name: string; category: string };
  branchId: { name: string; address?: string };
}

interface TransactionItem {
  _id: string;
  type: string;
  createdAt: string;
}

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isPreview } = useAuth();
  const [card, setCard] = useState<CardDetail | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPreview) {
      const mock = findMockCard(id);
      setCard(mock || null);
      setTransactions(mock?.transactions || []);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data } = await apiClient.get(`/customer/stamp-cards/${id}`);
        setCard(data.card);
        setTransactions(data.transactions);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isPreview]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#14213d" />
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.center}>
        <Text>Card not found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.business}>{card.businessId?.name}</Text>
          <Text style={styles.branch}>{card.branchId?.name}</Text>
          <View style={styles.stampWrap}>
            <StampRow current={card.currentStamps} required={card.stampsRequired} />
          </View>
          <Text style={styles.progress}>
            {card.currentStamps} / {card.stampsRequired} stamps collected
          </Text>
          <Text style={styles.historyTitle}>History</Text>
        </View>
      }
      data={transactions}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ paddingBottom: 32 }}
      renderItem={({ item }) => (
        <View style={styles.historyRow}>
          <Text style={styles.historyType}>{item.type}</Text>
          <Text style={styles.historyDate}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.emptyHistory}>No activity yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { padding: 20 },
  business: { fontSize: 22, fontWeight: "800", color: "#14213d" },
  branch: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  stampWrap: { marginTop: 20 },
  progress: { fontSize: 13, color: "#6b7280", marginTop: 10 },
  historyTitle: { fontSize: 14, fontWeight: "700", color: "#374151", marginTop: 28, marginBottom: 8 },
  historyRow: { paddingHorizontal: 20, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  historyType: { fontSize: 13, fontWeight: "600", color: "#14213d" },
  historyDate: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  emptyHistory: { paddingHorizontal: 20, color: "#9ca3af" },
});
