import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "../src/components/AppText";
import { IconCircle } from "../src/components/IconCircle";
import { AuthTextInput } from "../src/components/AuthTextInput";
import { apiClient, apiErrorMessage } from "../src/api/client";
import { useAuth } from "../src/auth/AuthContext";
import { useAlertPrompt } from "../src/components/PromptProvider";
import { colors, fonts, radius } from "../src/theme";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, isPreview, updateUser } = useAuth();
  const Alert = useAlertPrompt();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const trimmedName = name.trim();
  const dirty = trimmedName.length > 0 && trimmedName !== user?.name;

  async function handleSave() {
    if (!trimmedName) {
      Alert.alert("Add your name", "Your name can't be empty.");
      return;
    }
    if (!dirty) {
      router.back();
      return;
    }

    setSaving(true);
    try {
      if (isPreview) {
        await updateUser({ name: trimmedName });
      } else {
        await apiClient.patch("/customer/me", { name: trimmedName });
        await updateUser({ name: trimmedName });
      }
      router.back();
    } catch (err) {
      Alert.alert("Couldn't save changes", apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={styles.backButton} onPress={() => router.back()}>
          <IconCircle name="chevron-back" size={38} iconSize={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>NAME</Text>
          <AuthTextInput
            style={styles.input}
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleSave}
          />

          {!!user?.phone && (
            <>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{user.phone}</Text>
              </View>
            </>
          )}

          {!!user?.email && (
            <>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{user.email}</Text>
              </View>
            </>
          )}
          {(!!user?.phone || !!user?.email) && (
            <Text style={styles.readOnlyHint}>Phone and email can't be changed here. Contact support if you need to update them.</Text>
          )}

          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.saveButton, (!trimmedName || saving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!trimmedName || saving}
          >
            <Text style={styles.saveButtonText}>{saving ? "Saving…" : "Save changes"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 },
  backButton: { width: 38, height: 38 },
  headerTitle: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  content: { padding: 16, paddingTop: 6 },
  label: { color: colors.ink, fontSize: 10, fontWeight: "900", letterSpacing: 1, marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: colors.paper, borderRadius: radius.small, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink, fontFamily: fonts.semibold, fontSize: 14 },
  readOnlyField: { backgroundColor: colors.paper, borderRadius: radius.small, paddingHorizontal: 14, paddingVertical: 12, opacity: 0.6 },
  readOnlyText: { color: colors.ink, fontFamily: fonts.semibold, fontSize: 14 },
  readOnlyHint: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 10 },
  saveButton: { backgroundColor: colors.forest, borderRadius: radius.pill, paddingVertical: 15, alignItems: "center", marginTop: 28 },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: colors.white, fontWeight: "900", fontSize: 14 },
});
