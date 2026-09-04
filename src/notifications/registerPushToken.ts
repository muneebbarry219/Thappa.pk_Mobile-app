import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { apiClient } from "../api/client";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Registers this device for push and saves the Expo push token on the user's profile. Silently no-ops on simulators/denied permission. */
export async function registerForPushNotificationsAsync(): Promise<void> {
  if (!Device.isDevice) return;

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

/** Shows an immediate device notification after a successful in-app scan. */
export async function notifyStampAdded(campaignName: string, stampsRemaining: number): Promise<void> {
  try {
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
