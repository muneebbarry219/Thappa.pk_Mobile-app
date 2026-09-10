import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import { apiClient } from "../api/client";

/**
 * True when running inside the Expo Go client app. As of SDK 53, Expo Go on
 * Android no longer supports push notifications at all — merely importing
 * "expo-notifications" throws (its push-token event emitter initializes
 * eagerly at module load). So we must never import that module while in
 * Expo Go; only a real dev/standalone build can use it. See:
 * https://docs.expo.dev/develop/development-builds/introduction/
 */
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/** Registers this device for push and saves the Expo push token on the user's profile. Silently no-ops on Expo Go/simulators/denied permission. */
export async function registerForPushNotificationsAsync(): Promise<void> {
  if (isExpoGo || !Device.isDevice) return;

  const Notifications = await import("expo-notifications");
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== "granted") return;

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    await apiClient.patch("/customer/me", { expoPushToken });
  } catch {
    // Non-critical (e.g. no EAS project id configured yet) — the reward
    // still unlocks and shows in-app either way.
  }
}

/** Shows an immediate device notification after a successful in-app scan. No-ops on Expo Go (see isExpoGo above). */
export async function notifyStampAdded(campaignName: string, stampsRemaining: number): Promise<void> {
  if (isExpoGo) return;
  try {
    const Notifications = await import("expo-notifications");
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Stamp added!",
        body: `A stamp was added against ${campaignName}. ${stampsRemaining} more to go!`,
        sound: "default",
      },
      trigger: null,
    });
  } catch {
    // The scan result itself remains visible in-app if notifications are unavailable.
  }
}
