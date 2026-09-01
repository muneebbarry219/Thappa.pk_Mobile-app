import Constants from "expo-constants";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = (Constants.expoConfig?.extra?.firebase || {}) as {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  appId?: string;
};

/** True once EXPO_PUBLIC_FIREBASE_* env vars are set — gates real SMS phone auth vs. the dev OTP fallback. */
export const firebaseEnabled = !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

export const firebaseAuth = firebaseEnabled
  ? getAuth(getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;
