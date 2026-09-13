import { useState } from "react";
import { Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "../../src/components/AppText";
import { AuthTextInput } from "../../src/components/AuthTextInput";
import { GoogleSignInButton } from "../../src/components/GoogleSignInButton";
import { apiClient, apiErrorMessage } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { toE164Phone } from "../../src/utils/phone";
import { colors, fonts, radius } from "../../src/theme";
import { useAlertPrompt } from "../../src/components/PromptProvider";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const Alert = useAlertPrompt();

  async function handleSignUp() {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = toE164Phone(phone);
    if (!name.trim() || !normalizedPhone || !normalizedEmail || !password) {
      return Alert.alert("Complete all fields", "Enter your name, valid phone number, email, and password.");
    }
    if (password.length < 8) {
      return Alert.alert("Choose a longer password", "Your password must contain at least 8 characters.");
    }

    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/customer-signup", {
        name: name.trim(),
        phone: normalizedPhone,
        email: normalizedEmail,
        password,
      });
      if (data.user && data.accessToken && data.refreshToken) {
        await login(data.user, data.accessToken, data.refreshToken);
      } else {
        Alert.alert("Account created", "Your account has been created. Please sign in to continue.", [{ text: "Sign in", onPress: () => router.replace("/(auth)/login") }]);
      }
    } catch (err) {
      Alert.alert("Couldn’t create your account", apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground source={require("../../assets/splash screen bg.png")} resizeMode="cover" style={styles.background}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.top}>
          <Image source={require("../../assets/thappa-logo-transparent.png")} style={styles.logo} resizeMode="contain" />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Create your account.</Text>
            <Text style={styles.formSub}>Start collecting stamps and rewards.</Text>

            <Text style={[styles.label, styles.firstLabel]}>NAME</Text>
            <AuthTextInput style={styles.input} placeholder="Your Name" autoComplete="name" value={name} onChangeText={setName} />

            <Text style={styles.label}>PHONE NUMBER</Text>
            <AuthTextInput style={styles.input} placeholder="+92 XXX XXXXXXX" keyboardType="phone-pad" autoComplete="tel" value={phone} onChangeText={setPhone} />

            <Text style={styles.label}>EMAIL</Text>
            <AuthTextInput style={styles.input} placeholder="you@example.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail} />

            <Text style={styles.label}>PASSWORD</Text>
            <AuthTextInput style={styles.input} placeholder="At least 8 characters" secureTextEntry autoComplete="new-password" value={password} onChangeText={setPassword} onSubmitEditing={handleSignUp} />

            <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp} disabled={loading}>
              <Text style={styles.primaryButtonText}>{loading ? "Creating account..." : "Sign up  →"}</Text>
            </TouchableOpacity>

            <GoogleSignInButton disabled={loading} />

            <View style={styles.loginRow}>
              <Text style={styles.loginCopy}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  top: { position: "absolute", top: 78, right: 0, left: 0, alignItems: "center", zIndex: 1 },
  logo: { width: 190, height: 107 },
  scrollContent: { flexGrow: 1, justifyContent: "flex-end", paddingTop: 200 },
  form: { backgroundColor: colors.cream, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 23, paddingBottom: 34 },
  formTitle: { color: colors.ink, fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  formSub: { color: colors.muted, fontSize: 13, marginTop: 4 },
  label: { color: colors.ink, fontSize: 10, fontWeight: "900", letterSpacing: 1, marginTop: 16, marginBottom: 6 },
  firstLabel: { marginTop: 28 },
  input: { backgroundColor: colors.paper, borderRadius: radius.small, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink, fontFamily: fonts.semibold, fontSize: 14 },
  primaryButton: { backgroundColor: colors.forest, borderRadius: radius.pill, paddingVertical: 15, alignItems: "center", marginTop: 20 },
  primaryButtonText: { color: colors.white, fontWeight: "900", fontSize: 14 },
  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5, marginTop: 18 },
  loginCopy: { color: colors.muted, fontSize: 13 },
  loginLink: { color: colors.forest, fontSize: 13, fontWeight: "900", textDecorationLine: "underline" },
});
