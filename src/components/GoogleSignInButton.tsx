import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { AntDesign } from "@expo/vector-icons";
import { Text } from "./AppText";
import { apiClient, apiErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { colors, radius } from "../theme";
import { useAlertPrompt } from "./PromptProvider";

type GoogleSigninModule = typeof import("@react-native-google-signin/google-signin");

const webClientId = (Constants.expoConfig?.extra?.googleClientId as string) || "";
// Expo Go doesn't ship the native Google Sign-In module, so importing it there crashes the app.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let googleModule: GoogleSigninModule | null = null;

/** Lazily loads and configures the native module; null when unavailable in this build. */
function loadGoogleSignin(): GoogleSigninModule | null {
  if (isExpoGo || !webClientId) return null;
  if (!googleModule) {
    try {
      googleModule = require("@react-native-google-signin/google-signin") as GoogleSigninModule;
      googleModule.GoogleSignin.configure({ webClientId });
    } catch {
      return null;
    }
  }
  return googleModule;
}

export function GoogleSignInButton({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const Alert = useAlertPrompt();

  async function handlePress() {
    const google = loadGoogleSignin();
    if (!google) {
      return Alert.alert(
        "Google sign-in unavailable",
        isExpoGo
          ? "Google sign-in needs the Thappa development build — it can’t run inside Expo Go."
          : "Google sign-in isn’t set up for this build yet."
      );
    }

    const { GoogleSignin, isCancelledResponse, isErrorWithCode, statusCodes } = google;
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      // Clear any cached Google session so the account picker always appears.
      if (GoogleSignin.hasPreviousSignIn()) await GoogleSignin.signOut();

      const response = await GoogleSignin.signIn();
      if (isCancelledResponse(response)) return;
      if (!response.data.idToken) throw new Error("Google didn’t return an ID token");

      const { data } = await apiClient.post("/auth/google", { idToken: response.data.idToken });
      await login(data.user, data.accessToken, data.refreshToken);
    } catch (err) {
      if (isErrorWithCode(err)) {
        if (err.code === statusCodes.SIGN_IN_CANCELLED || err.code === statusCodes.IN_PROGRESS) return;
        if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          return Alert.alert("Google Play services needed", "Update Google Play services and try again.");
        }
      }
      Alert.alert("Couldn’t sign in with Google", apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePress} disabled={disabled || loading}>
        <AntDesign name="google" size={18} color={colors.ink} />
        <Text style={styles.buttonText}>{loading ? "Connecting to Google..." : "Continue with Google"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.line, opacity: 0.25 },
  dividerText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  button: {
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
  },
  buttonText: { color: colors.ink, fontWeight: "900", fontSize: 14 },
});
