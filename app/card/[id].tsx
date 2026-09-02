import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Text } from "../../src/components/AppText";
import { useLocalSearchParams } from "expo-router";
import { apiClient } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { findMockCard } from "../../src/preview/mockData";
import { StampRow } from "../../src/components/StampRow";
import { colors, radius } from "../../src/theme";

interface CardDetail { _id: string; currentStamps: number; stampsRequired: number; businessId: { name: string; category: string }; branchId: { name: string; address?: string }; }
interface TransactionItem { _id: string; type: string; createdAt: string; }

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { isPreview } = useAuth();
  const [card, setCard] = useState<CardDetail | null>(null); const [transactions, setTransactions] = useState<TransactionItem[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { if (isPreview) { const mock = findMockCard(id); setCard(mock || null); setTransactions(mock?.transactions || []); setLoading(false); return; } (async () => { try { const { data } = await apiClient.get(`/customer/stamp-cards/${id}`); setCard(data.card); setTransactions(data.transactions); } finally { setLoading(false); } })(); }, [id, isPreview]);
  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.forest} /></View>;
  if (!card) return <View style={styles.center}><Text style={{ color: colors.ink, fontWeight: "700" }}>Card not found.</Text></View>;
  const complete = card.currentStamps >= card.stampsRequired;
  return <FlatList style={styles.container} data={transactions} keyExtractor={(item) => item._id} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} ListHeaderComponent={<><View style={styles.hero}><Text style={styles.category}>{card.businessId?.category || "LOYALTY CARD"}</Text><Text style={styles.business}>{card.businessId?.name}</Text><Text style={styles.branch}>{card.branchId?.name}</Text><View style={styles.stampWrap}><StampRow current={card.currentStamps} required={card.stampsRequired} /></View><Text style={styles.progress}>{complete ? "Your reward is ready to claim!" : `${card.stampsRequired - card.currentStamps} more stamps until your reward.`}</Text></View><Text style={styles.historyTitle}>Stamp history</Text></>} renderItem={({ item }) => <View style={styles.historyRow}><View style={styles.historyDot}><Text style={styles.historyDotText}>✓</Text></View><View><Text style={styles.historyType}>{item.type === "EARN" ? "Stamp collected" : item.type.replaceAll("_", " ")}</Text><Text style={styles.historyDate}>{new Date(item.createdAt).toLocaleString()}</Text></View></View>} ListEmptyComponent={<Text style={styles.emptyHistory}>No activity yet.</Text>} />;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.cream }, center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream }, hero: { backgroundColor: colors.forest, padding: 21, borderRadius: radius.large }, category: { color: colors.yellow, fontWeight: "900", fontSize: 10, letterSpacing: 1.2 }, business: { color: colors.white, fontSize: 27, fontWeight: "900", letterSpacing: -0.5, marginTop: 12 }, branch: { color: colors.white, fontSize: 13, marginTop: 3 }, stampWrap: { backgroundColor: colors.green, padding: 14, borderRadius: radius.small, marginTop: 20 }, progress: { color: colors.yellowSoft, fontSize: 13, fontWeight: "700", marginTop: 15 }, historyTitle: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 24, marginBottom: 10 }, historyRow: { flexDirection: "row", gap: 11, alignItems: "center", backgroundColor: colors.paper, padding: 13, borderWidth: 1, borderColor: colors.line, borderRadius: radius.small, marginBottom: 8 }, historyDot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.mint }, historyDotText: { color: colors.white, fontWeight: "900" }, historyType: { color: colors.ink, fontSize: 13, fontWeight: "800", textTransform: "capitalize" }, historyDate: { color: colors.muted, fontSize: 11, marginTop: 2 }, emptyHistory: { color: colors.muted, fontSize: 13, backgroundColor: colors.paper, padding: 16, borderRadius: radius.small }, });
