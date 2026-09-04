import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "../src/components/AppText";
import { IconCircle } from "../src/components/IconCircle";
import { AppNotification, useNotifications } from "../src/notifications/NotificationContext";
import { colors, radius } from "../src/theme";

function relativeTime(createdAt: Date) {
  const seconds = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, markAsRead } = useNotifications();

  function renderNotification({ item }: { item: AppNotification }) {
    return (
      <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={() => markAsRead(item.id)}>
        <IconCircle name="notifications" size={44} iconSize={19} />
        <View style={styles.copy}>
          <View style={styles.itemTop}>
            <Text style={[styles.headline, item.read && styles.readText]}>{item.headline}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text numberOfLines={1} style={[styles.description, item.read && styles.readText]}>{item.description}</Text>
          <Text style={[styles.time, item.read && styles.readText]}>{relativeTime(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()}><IconCircle name="chevron-back" size={40} iconSize={20} backgroundColor={colors.paper} /></TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={notifications.length ? styles.content : styles.emptyContent}
        renderItem={renderNotification}
        ListEmptyComponent={<View style={styles.empty}><IconCircle name="notifications-off" size={58} iconSize={25} /><Text style={styles.emptyTitle}>You're all caught up.</Text><Text style={styles.emptyCopy}>Stamp updates and campaign news will appear here.</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 },
  title: { color: colors.ink, fontSize: 20, fontWeight: "900", letterSpacing: -0.3 },
  headerSpacer: { width: 40 },
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  emptyContent: { flexGrow: 1, justifyContent: "center", padding: 24 },
  item: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 15, backgroundColor: colors.paper, borderRadius: radius.card },
  copy: { flex: 1, paddingTop: 1 },
  itemTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  headline: { color: colors.ink, fontSize: 14, fontWeight: "900", flex: 1 },
  description: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  time: { color: colors.muted, fontSize: 10, fontWeight: "700", marginTop: 6 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.yellow },
  readText: { opacity: 0.45 },
  empty: { alignItems: "center" },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: "900", marginTop: 13 },
  emptyCopy: { color: colors.muted, textAlign: "center", fontSize: 13, marginTop: 6 },
});
