import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Text } from "../../src/components/AppText";
import { IconCircle } from "../../src/components/IconCircle";
import { useAuth } from "../../src/auth/AuthContext";
import { colors, radius } from "../../src/theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const initial = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
        <Text style={styles.name}>{user?.name || "Thappa member"}</Text>
        <Text style={styles.detail}>{user?.phone || user?.email || "Member"}</Text>
        <View style={styles.memberPill}><Text style={styles.memberPillText}>THAPPA CREW</Text></View>
      </View>

      <View style={styles.tip}>
        <IconCircle name="bulb" size={43} iconSize={20} />
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Every stamp counts.</Text>
          <Text style={styles.tipText}>Scan at any Thappa partner to make your next freebie a little closer.</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => Alert.alert("Log out?", "You'll need to sign in again to see your stamp cards.", [{ text: "Cancel", style: "cancel" }, { text: "Log out", style: "destructive", onPress: logout }])}>
        <Text style={styles.logoutText}>Log out</Text>
        <IconCircle name="log-out-outline" size={40} iconSize={18} backgroundColor={colors.cream} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, padding: 16 },
  hero: { backgroundColor: colors.forest, borderRadius: radius.large, alignItems: "center", paddingVertical: 28, paddingHorizontal: 20 },
  avatar: { width: 74, height: 74, borderRadius: 37, backgroundColor: colors.yellow, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.ink, fontSize: 32, fontWeight: "900" },
  name: { color: colors.white, fontSize: 21, fontWeight: "900", marginTop: 12 },
  detail: { color: colors.white, fontSize: 13, marginTop: 3 },
  memberPill: { backgroundColor: colors.green, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6, marginTop: 17 },
  memberPillText: { color: colors.yellow, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  tip: { flexDirection: "row", gap: 12, backgroundColor: colors.paper, borderRadius: radius.card, padding: 17, marginTop: 16 },
  tipTitle: { color: colors.ink, fontSize: 14, fontWeight: "900" },
  tipText: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, paddingLeft: 17, borderRadius: radius.card, backgroundColor: colors.white, marginTop: 16 },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: "900" },
});
