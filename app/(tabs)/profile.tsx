import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../src/auth/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || "?"}</Text>
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.detail}>{user?.phone || user?.email}</Text>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() =>
          Alert.alert("Log out?", "You'll need to sign in again to see your stamp cards.", [
            { text: "Cancel", style: "cancel" },
            { text: "Log out", style: "destructive", onPress: logout },
          ])
        }
      >
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", alignItems: "center", paddingTop: 48 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#14213d", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fca311", fontSize: 32, fontWeight: "800" },
  name: { fontSize: 18, fontWeight: "700", color: "#14213d", marginTop: 14 },
  detail: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  logoutButton: { marginTop: 40, borderWidth: 1, borderColor: "#ef4444", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
  logoutText: { color: "#ef4444", fontWeight: "700" },
});
