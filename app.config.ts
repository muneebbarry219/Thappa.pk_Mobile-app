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
  splash: {
    backgroundColor: "#14213d",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "in.thappa.customer",
    associatedDomains: ["applinks:app.thappa.in"],
  },
  android: {
    package: "in.thappa.customer",
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [{ scheme: "https", host: "app.thappa.in", pathPrefix: "/scan" }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  plugins: ["expo-router", ["expo-camera", { cameraPermission: "Allow Thappa to use the camera to scan stamp QR codes." }]],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000/v1",
  },
});
