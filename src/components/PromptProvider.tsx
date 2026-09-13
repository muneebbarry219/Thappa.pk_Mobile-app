import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./AppText";
import { colors, fonts, radius } from "../theme";

type PromptTone = "success" | "error" | "warning" | "info";

type PromptAction = {
  label: string;
  variant?: "primary" | "secondary" | "destructive";
  onPress?: () => void | Promise<void>;
};

type AlertLikeAction = {
  text?: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void | Promise<void>;
};

export type PromptOptions = {
  title: string;
  message?: string;
  tone?: PromptTone;
  actions?: PromptAction[];
};

type PromptContextValue = {
  showPrompt: (options: PromptOptions) => void;
  dismissPrompt: () => void;
};

const PromptContext = createContext<PromptContextValue | undefined>(undefined);

const promptAppearance: Record<PromptTone, { icon: keyof typeof Ionicons.glyphMap; eyebrow: string }> = {
  success: { icon: "checkmark", eyebrow: "ALL SET" },
  error: { icon: "alert", eyebrow: "SOMETHING NEEDS ATTENTION" },
  warning: { icon: "warning", eyebrow: "PLEASE CHECK" },
  info: { icon: "information", eyebrow: "THAPPA" },
};

export function PromptProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<PromptOptions | null>(null);
  const dismissPrompt = useCallback(() => setPrompt(null), []);
  const showPrompt = useCallback((options: PromptOptions) => setPrompt(options), []);
  const value = useMemo(() => ({ showPrompt, dismissPrompt }), [dismissPrompt, showPrompt]);
  const tone = prompt?.tone || "info";
  const appearance = promptAppearance[tone];
  const actions = prompt?.actions?.length ? prompt.actions : [{ label: "Got it", variant: "primary" as const }];

  function handleAction(action: PromptAction) {
    dismissPrompt();
    void action.onPress?.();
  }

  return (
    <PromptContext.Provider value={value}>
      {children}
      <Modal transparent visible={Boolean(prompt)} animationType="fade" statusBarTranslucent onRequestClose={dismissPrompt}>
        <View style={styles.modalRoot} accessibilityViewIsModal accessibilityRole="alert">
          <Pressable style={styles.scrim} onPress={dismissPrompt} />
          {prompt && (
            <View style={styles.card}>
              <View style={styles.iconBadge}>
                <Ionicons name={appearance.icon} size={28} color={colors.forest} />
              </View>
              <Text style={styles.eyebrow}>{appearance.eyebrow}</Text>
              <Text style={styles.title}>{prompt.title}</Text>
              {prompt.message && <Text style={styles.message}>{prompt.message}</Text>}
              <View style={[styles.actions, actions.length === 1 && styles.singleAction]}>
                {actions.map((action) => {
                  const variant = action.variant || "primary";
                  return (
                    <TouchableOpacity
                      key={action.label}
                      accessibilityRole="button"
                      style={[styles.action, styles[variant], actions.length === 1 && styles.fullAction]}
                      onPress={() => handleAction(action)}
                    >
                      <Text style={[styles.actionText, styles[`${variant}Text`]]}>{action.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </PromptContext.Provider>
  );
}

export function usePrompt() {
  const context = useContext(PromptContext);
  if (!context) throw new Error("usePrompt must be used within PromptProvider");
  return context;
}

/** Drop-in replacement for React Native alerts that keeps prompts in the app's visual system. */
export function useAlertPrompt() {
  const { showPrompt } = usePrompt();

  const alert = useCallback((title: string, message?: string, actions?: AlertLikeAction[]) => {
    const normalizedTitle = title.toLowerCase();
    const tone: PromptTone = normalizedTitle.includes("couldn") || normalizedTitle.includes("failed") || normalizedTitle.includes("verification")
      ? "error"
      : normalizedTitle.includes("created") || normalizedTitle.startsWith("you")
        ? "success"
        : normalizedTitle.includes("unavailable")
          ? "info"
          : "warning";

    showPrompt({
      title,
      message,
      tone,
      actions: actions?.map((action) => ({
        label: action.text || "Got it",
        variant: action.style === "destructive" ? "destructive" : action.style === "cancel" ? "secondary" : "primary",
        onPress: action.onPress,
      })),
    });
  }, [showPrompt]);

  return { alert };
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: "center", padding: 24 },
  scrim: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.ink, opacity: 0.46 },
  card: { backgroundColor: colors.paper, borderRadius: radius.large, padding: 24, alignItems: "center", shadowColor: colors.ink, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 12 },
  iconBadge: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center", backgroundColor: colors.yellow, marginBottom: 16 },
  eyebrow: { color: colors.forest, fontFamily: fonts.bold, fontSize: 10, fontWeight: "700", letterSpacing: 1.1, textAlign: "center" },
  title: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 22, fontWeight: "800", letterSpacing: -0.4, textAlign: "center", marginTop: 6 },
  message: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 9 },
  actions: { flexDirection: "row", width: "100%", gap: 10, marginTop: 24 },
  singleAction: { justifyContent: "center" },
  action: { flex: 1, minHeight: 48, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  fullAction: { flexGrow: 1 },
  primary: { backgroundColor: colors.forest },
  secondary: { backgroundColor: colors.cream },
  destructive: { backgroundColor: colors.yellow },
  actionText: { fontFamily: fonts.bold, fontSize: 14, fontWeight: "700" },
  primaryText: { color: colors.white },
  secondaryText: { color: colors.forest },
  destructiveText: { color: colors.ink },
});
