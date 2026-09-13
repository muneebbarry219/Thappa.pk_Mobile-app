import { useState } from "react";
import { Image, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "../../src/components/AppText";
import { AuthTextInput } from "../../src/components/AuthTextInput";
import { GoogleSignInButton } from "../../src/components/GoogleSignInButton";
import { apiClient, apiErrorMessage } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { colors, fonts, radius } from "../../src/theme";
import { useAlertPrompt } from "../../src/components/PromptProvider";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountNotFound, setAccountNotFound] = useState(false);
  const router = useRouter();
  const { login, previewLogin } = useAuth();
  const Alert = useAlertPrompt();

  async function handleLogin() {
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername || !password) {
      return Alert.alert("Enter your email and password");
    }

    setAccountNotFound(false);
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/customer-login", {
        email: normalizedUsername,
        password,
      });
      await login(data.user, data.accessToken, data.refreshToken);
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 404) {
        setAccountNotFound(true);
      } else {
        Alert.alert("Couldn’t sign in", apiErrorMessage(err));
      }
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

        <View style={styles.form}>
          <Text style={styles.formTitle}>Welcome back.</Text>
          <Text style={styles.formSub}>Sign in to see your stamps and rewards.</Text>

          <Text style={[styles.label, styles.firstLabel]}>EMAIL</Text>
          <AuthTextInput
            style={styles.input}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            keyboardType="email-address"
            value={username}
            onChangeText={setUsername}
          />

          <Text style={styles.label}>PASSWORD</Text>
          <AuthTextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry
            autoComplete="current-password"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
          />

          {accountNotFound && (
            <View style={styles.accountNotice}>
              <Text style={styles.accountNoticeText}>We couldn’t find an account with that email. Please sign up first.</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text style={styles.accountNoticeLink}>Create an account</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? "Signing in..." : "Sign in  →"}</Text>
          </TouchableOpacity>

          <GoogleSignInButton disabled={loading} />

          <View style={styles.signUpRow}>
            <Text style={styles.signUpCopy}>New to Thappa?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {__DEV__ && (
            <TouchableOpacity style={styles.guestButton} onPress={previewLogin} disabled={loading}>
              <Text style={styles.guestButtonText}>Preview the app</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, justifyContent: "flex-end" },
  top: { position: "absolute", top: 78, right: 0, left: 0, alignItems: "center", zIndex: 1 },
  logo: { width: 190, height: 107 },
  form: { backgroundColor: colors.cream, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 23, paddingBottom: 34 },
  formTitle: { color: colors.ink, fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  formSub: { color: colors.muted, fontSize: 13, marginTop: 4 },
  label: { color: colors.ink, fontSize: 10, fontWeight: "900", letterSpacing: 1, marginTop: 17, marginBottom: 6 },
  firstLabel: { marginTop: 28 },
  input: { backgroundColor: colors.paper, borderRadius: radius.small, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink, fontFamily: fonts.semibold, fontSize: 14 },
  accountNotice: { backgroundColor: colors.paper, borderRadius: radius.small, padding: 12, marginTop: 14 },
  accountNoticeText: { color: colors.ink, fontSize: 12, lineHeight: 17 },
  accountNoticeLink: { color: colors.forest, fontSize: 12, fontWeight: "800", marginTop: 4, textDecorationLine: "underline" },
  primaryButton: { backgroundColor: colors.forest, borderRadius: radius.pill, paddingVertical: 15, alignItems: "center", marginTop: 20 },
  primaryButtonText: { color: colors.white, fontWeight: "900", fontSize: 14 },
  signUpRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5, marginTop: 18 },
  signUpCopy: { color: colors.muted, fontSize: 13 },
  signUpLink: { color: colors.forest, fontSize: 13, fontWeight: "900", textDecorationLine: "underline" },
  guestButton: { alignItems: "center", marginTop: 13 },
  guestButtonText: { color: colors.forest, fontSize: 12, fontWeight: "800", textDecorationLine: "underline" },
});
