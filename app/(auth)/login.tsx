import { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, Image } from "react-native";
import { Text } from "../../src/components/AppText";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { apiClient, apiErrorMessage } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { toE164Phone } from "../../src/utils/phone";
import { colors, fonts, radius } from "../../src/theme";

const GOOGLE_CLIENT_ID = (Constants.expoConfig?.extra?.googleClientId as string) || "";

export default function LoginScreen() {
  const [phone, setPhone] = useState(""); const [name, setName] = useState(""); const [loading, setLoading] = useState(false);
  const router = useRouter(); const { login, previewLogin } = useAuth();
  async function handleGoogleIdToken(idToken: string) { setLoading(true); try { const { data } = await apiClient.post("/auth/google", { idToken }); await login(data.user, data.accessToken, data.refreshToken); } catch (err) { Alert.alert("Google sign-in failed", apiErrorMessage(err)); } finally { setLoading(false); } }
  async function handleGooglePress() {
    if (!GOOGLE_CLIENT_ID) return Alert.alert("Google Sign-In not configured", "Set EXPO_PUBLIC_GOOGLE_CLIENT_ID (mobile) and GOOGLE_CLIENT_ID (backend) to a Google OAuth Web Client ID to enable this.");
    // Dynamic import, not a static one: this native module (Google Play
    // Services–based; the old browser-redirect flow is no longer supported
    // on Android at all) only exists in a Development Build that was
    // compiled with it. A static import would crash the whole app on load
    // whenever the currently-installed build predates this dependency —
    // this isolates that failure to just this button instead.
    let googleSignin: typeof import("@react-native-google-signin/google-signin");
    try {
      googleSignin = await import("@react-native-google-signin/google-signin");
    } catch {
      return Alert.alert("Google sign-in unavailable", "This build doesn't include Google Sign-In yet — reinstall the latest Development Build.");
    }
    const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = googleSignin;
    try {
      // webClientId must be a "Web application" OAuth client (not the
      // Android one) — that's what makes the returned idToken's audience
      // something the backend's google-auth-library can verify.
      GoogleSignin.configure({ webClientId: GOOGLE_CLIENT_ID });
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response) && response.data.idToken) {
        await handleGoogleIdToken(response.data.idToken);
      }
    } catch (err) {
      if (isErrorWithCode(err) && (err.code === statusCodes.SIGN_IN_CANCELLED || err.code === statusCodes.IN_PROGRESS)) return;
      Alert.alert("Google sign-in failed", apiErrorMessage(err));
    }
  }
  // Real-SMS phone auth (Firebase + expo-firebase-recaptcha) is disabled
  // for now — that package depends on expo-firebase-core, which is
  // incompatible with SDK 57's Android toolchain (uses Gradle APIs removed
  // in modern AGP/Gradle) and breaks every native build. Falls back to the
  // dev-mode OTP (logged to the backend console) until a native
  // @react-native-firebase/auth-based flow replaces it — that doesn't need
  // a recaptcha step at all (Play Integrity handles app verification).
  async function handleSendOtp() { if (!phone) return Alert.alert("Enter your phone number"); const e164Phone = toE164Phone(phone); if (!e164Phone) return Alert.alert("Enter a valid phone number", "e.g. 0300 1234567 or +923001234567"); setLoading(true); try { await apiClient.post("/auth/otp/send", { phone: e164Phone }); router.push({ pathname: "/(auth)/verify-otp", params: { phone: e164Phone, name } }); } catch (err) { Alert.alert("Couldn't send OTP", apiErrorMessage(err)); } finally { setLoading(false); } }
  return <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}><View style={styles.top}><Image source={require("../../assets/thappa logo.jpeg")} style={styles.logo} resizeMode="contain" /><Text style={styles.tagline}>Little stamps. Big mood.</Text><Text style={styles.spark}>✦</Text></View><View style={styles.form}><Text style={styles.formTitle}>Let’s get you in.</Text><Text style={styles.formSub}>Your favourites and rewards are waiting.</Text><Text style={styles.label}>YOUR NAME</Text><TextInput style={styles.input} placeholder="Sana Khan" placeholderTextColor={colors.ink} value={name} onChangeText={setName} /><Text style={styles.label}>PHONE NUMBER</Text><TextInput style={styles.input} placeholder="+92 300 1234567" placeholderTextColor={colors.ink} keyboardType="phone-pad" value={phone} onChangeText={setPhone} /><TouchableOpacity style={styles.primaryButton} onPress={handleSendOtp} disabled={loading}><Text style={styles.primaryButtonText}>{loading ? "Sending..." : "Send me a code  →"}</Text></TouchableOpacity><View style={styles.orLine}><View style={styles.rule} /><Text style={styles.orText}>OR</Text><View style={styles.rule} /></View><TouchableOpacity style={styles.googleButton} onPress={handleGooglePress} disabled={loading}><Text style={styles.googleButtonText}>Continue with Google</Text></TouchableOpacity>{__DEV__ && <TouchableOpacity style={styles.guestButton} onPress={previewLogin} disabled={loading}><Text style={styles.guestButtonText}>Preview the app</Text></TouchableOpacity>}</View></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.forest, justifyContent: "flex-end" }, top: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 35 }, logo: { height: 128, width: 190, borderRadius: 22 }, tagline: { color: colors.yellow, fontSize: 16, fontWeight: "900", marginTop: 12 }, spark: { color: colors.coral, fontSize: 27, position: "absolute", top: "31%", right: "24%" }, form: { backgroundColor: colors.cream, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 23, paddingBottom: 34 }, formTitle: { color: colors.ink, fontSize: 24, fontWeight: "900", letterSpacing: -0.5 }, formSub: { color: colors.muted, fontSize: 13, marginTop: 4 }, label: { color: colors.ink, fontSize: 10, fontWeight: "900", letterSpacing: 1, marginTop: 17, marginBottom: 6 }, input: { backgroundColor: colors.paper, borderRadius: radius.small, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink, fontFamily: fonts.semibold, fontSize: 15 }, primaryButton: { backgroundColor: colors.forest, borderRadius: radius.pill, paddingVertical: 15, alignItems: "center", marginTop: 20 }, primaryButtonText: { color: colors.white, fontWeight: "900", fontSize: 14 }, orLine: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 15 }, rule: { height: 1, flex: 1, backgroundColor: colors.line }, orText: { color: colors.muted, fontSize: 10, fontWeight: "900" }, googleButton: { backgroundColor: colors.paper, borderRadius: radius.pill, paddingVertical: 14, alignItems: "center" }, googleButtonText: { color: colors.ink, fontWeight: "800", fontSize: 14 }, guestButton: { alignItems: "center", marginTop: 13 }, guestButtonText: { color: colors.forest, fontSize: 12, fontWeight: "800", textDecorationLine: "underline" }, });
