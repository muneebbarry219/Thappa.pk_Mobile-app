import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Thappa",
  slug: "thappa-customer-app",
  scheme: "thappa",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  icon: "./assets/icon.png",
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "in.thappa.customer",
    associatedDomains: ["applinks:app.thappa.in"],
  },
  android: {
    package: "in.thappa.customer",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0F6B38",
    },
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [{ scheme: "https", host: "app.thappa.in", pathPrefix: "/scan" }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    ["expo-camera", { cameraPermission: "Allow Thappa to use the camera to scan stamp QR codes." }],
    [
      "expo-location",
      { locationAlwaysAndWhenInUsePermission: "Allow Thappa to use your location to confirm you're at the counter for a stamp." },
    ],
    "expo-notifications",
    "@react-native-google-signin/google-signin",
    [
      "expo-splash-screen",
      {
        image: "./assets/splash screen bg.png",
        resizeMode: "cover",
        backgroundColor: "#035C2C",
      },
    ],
  ],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000/v1",
    googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
    eas: {
      projectId: "b11a3b0b-1a53-4ab4-8bd2-7ec095b1d90e",
    },
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
    },
  },
});