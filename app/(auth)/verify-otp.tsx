import { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Text } from "../../src/components/AppText";
import { useLocalSearchParams } from "expo-router";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { apiClient, apiErrorMessage } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { firebaseAuth } from "../../src/auth/firebase";
import { colors, fonts, radius } from "../../src/theme";

export default function VerifyOtpScreen() {
  const { phone, name, verificationId } = useLocalSearchParams<{ phone: string; name?: string; verificationId?: string }>(); const [otp, setOtp] = useState(""); const [loading, setLoading] = useState(false); const { login } = useAuth(); const otpLength = verificationId ? 6 : 4;
  async function handleVerify() { if (otp.length !== otpLength) return Alert.alert(`Enter the ${otpLength}-digit code`); setLoading(true); try { if (verificationId && firebaseAuth) { const credential = PhoneAuthProvider.credential(verificationId, otp); const userCredential = await signInWithCredential(firebaseAuth, credential); const idToken = await userCredential.user.getIdToken(); const { data } = await apiClient.post("/auth/firebase-phone", { idToken, name }); await login(data.user, data.accessToken, data.refreshToken); } else { const { data } = await apiClient.post("/auth/otp/verify", { phone, otp, name }); await login(data.user, data.accessToken, data.refreshToken); } } catch (err) { Alert.alert("Verification failed", apiErrorMessage(err)); } finally { setLoading(false); } }
  return <View style={styles.container}><View style={styles.badge}><Text style={styles.badgeText}>✓</Text></View><Text style={styles.eyebrow}>ONE LAST STEP</Text><Text style={styles.title}>Check your texts.</Text><Text style={styles.subtitle}>We sent a {otpLength}-digit code to {phone}.</Text><TextInput style={styles.otpInput} placeholder={"0".repeat(otpLength)} placeholderTextColor={colors.ink} keyboardType="number-pad" maxLength={otpLength} value={otp} onChangeText={setOtp} autoFocus /><TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}><Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify & continue  →"}</Text></TouchableOpacity></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.cream, padding: 25, justifyContent: "center" }, badge: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.yellow, alignItems: "center", justifyContent: "center", marginBottom: 25 }, badgeText: { color: colors.ink, fontWeight: "900", fontSize: 22 }, eyebrow: { color: colors.forest, fontSize: 10, fontWeight: "900", letterSpacing: 1.3 }, title: { color: colors.ink, fontSize: 30, fontWeight: "900", letterSpacing: -0.7, marginTop: 7 }, subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 7, maxWidth: 290 }, otpInput: { backgroundColor: colors.paper, borderRadius: radius.card, fontFamily: fonts.extraBold, fontSize: 30, color: colors.ink, textAlign: "center", letterSpacing: 12, paddingVertical: 15, marginTop: 28, marginBottom: 16 }, button: { backgroundColor: colors.forest, borderRadius: radius.pill, paddingVertical: 15, alignItems: "center" }, buttonText: { color: colors.white, fontWeight: "900", fontSize: 14 }, });
