import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { apiClient, apiErrorMessage } from "../../src/api/client";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSendOtp() {
    if (!phone) {
      Alert.alert("Enter your phone number");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/auth/otp/send", { phone });
      router.push({ pathname: "/(auth)/verify-otp", params: { phone, name } });
    } catch (err) {
      Alert.alert("Couldn't send OTP", apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.brand}>
        <Text style={styles.brandTitle}>thappa</Text>
        <Text style={styles.brandSubtitle}>Collect stamps. Get free stuff.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Your name</Text>
        <TextInput style={styles.input} placeholder="Sana Khan" value={name} onChangeText={setName} />

        <Text style={styles.label}>Phone number</Text>
        <TextInput
          style={styles.input}
          placeholder="+92 300 1234567"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSendOtp} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? "Sending…" : "Send OTP"}</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() =>
            Alert.alert(
              "Google Sign-In",
              "Wire this button to @react-native-google-signin/google-signin, then POST the resulting email/name (or ID token, once you add server-side verification) to /auth/google."
            )
          }
        >
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#14213d", justifyContent: "flex-end" },
  brand: { alignItems: "center", marginBottom: 40 },
  brandTitle: { fontSize: 40, fontWeight: "800", color: "#fca311" },
  brandSubtitle: { fontSize: 14, color: "#e5e7eb", marginTop: 4 },
  form: { backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 48 },
  label: { fontSize: 12, fontWeight: "600", color: "#6b7280", marginBottom: 4, marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  primaryButton: { backgroundColor: "#14213d", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 20 },
  primaryButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
  orText: { textAlign: "center", color: "#9ca3af", marginVertical: 14, fontSize: 12 },
  googleButton: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  googleButtonText: { color: "#374151", fontWeight: "600", fontSize: 15 },
});
