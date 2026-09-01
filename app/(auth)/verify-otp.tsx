import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { apiClient, apiErrorMessage } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";

export default function VerifyOtpScreen() {
  const { phone, name } = useLocalSearchParams<{ phone: string; name?: string }>();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleVerify() {
    if (otp.length !== 4) {
      Alert.alert("Enter the 4-digit code");
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/otp/verify", { phone, otp, name });
      await login(data.user, data.accessToken, data.refreshToken);
      // Root layout's redirect effect will send us to (tabs)/home automatically.
    } catch (err) {
      Alert.alert("Verification failed", apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter the code</Text>
      <Text style={styles.subtitle}>We sent a 4-digit code to {phone}. (Dev mode: check the backend server console.)</Text>

      <TextInput
        style={styles.otpInput}
        placeholder="0000"
        keyboardType="number-pad"
        maxLength={4}
        value={otp}
        onChangeText={setOtp}
        autoFocus
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Verifying…" : "Verify & Continue"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 24, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800", color: "#14213d", marginBottom: 8 },
  subtitle: { fontSize: 13, color: "#6b7280", marginBottom: 24 },
  otpInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    fontSize: 32,
    textAlign: "center",
    letterSpacing: 12,
    paddingVertical: 16,
    marginBottom: 24,
  },
  button: { backgroundColor: "#14213d", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "700", fontSize: 15 },
});
