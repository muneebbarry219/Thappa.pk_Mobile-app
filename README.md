# Thappa Mobile App (Customer)

React Native + Expo (Expo Router). This is the customer-facing app: sign
in, view stamp cards, scan the QR at checkout, and see rewards.

## What's implemented

- **Auth**: Phone + OTP flow (`(auth)/login.tsx` → `(auth)/verify-otp.tsx`),
  using real Firebase Phone Auth SMS once `EXPO_PUBLIC_FIREBASE_*` env vars
  are set, otherwise falling back to the backend's console-logged dev OTP.
  "Continue with Google" drives a real `expo-auth-session` OAuth flow once
  `EXPO_PUBLIC_GOOGLE_CLIENT_ID` is set (needs a custom dev client / EAS
  build to complete the redirect — Expo Go shows a config-needed alert).
- **Home (`(tabs)/home.tsx`)**: grid of stamp cards ("My Cards") with a
  visual dot-progress row per card.
- **Scan (`(tabs)/scan.tsx`)**: opens the camera, reads a QR code, and calls
  `/customer/stamps/redeem-qr`. Handles both a raw signed-JWT QR (Mode A,
  what the business's Generate-QR web page renders) and a
  `https://app.thappa.in/scan?b=<branchId>` deep link (Mode B storefront QR
  — requests `expo-location` permission and sends real GPS coordinates).
- **Push notifications**: registers the device's Expo push token with the
  backend on login (`src/notifications/registerPushToken.ts`) so a reward
  unlock triggers an instant push, even if the app is backgrounded.
- **Rewards (`(tabs)/rewards.tsx`)**: lists stamp cards with progress; swap
  in a dedicated backend endpoint for a true "pending redemptions" list
  when you need one (noted in the file).
- **Profile (`(tabs)/profile.tsx`)**: basic profile + log out.
- **Card detail (`card/[id].tsx`)**: full stamp progress + transaction
  history for one card.
- **Deep linking**: `scheme: "thappa"` plus Android App Links /
  iOS Associated Domains are configured in `app.config.ts` so scanning a
  Mode B storefront QR with the phone's default camera app still opens
  Thappa directly.

## Developer tools

- **Preview UI mode** — on the login screen (dev builds only, `__DEV__`),
  "🛠 Preview UI (developer, no backend)" logs into a fake local session with
  zero network calls. Every screen (`AuthContext.tsx#previewLogin`) reads from
  static fixtures in `src/preview/mockData.ts` instead of the API, so you can
  review the whole app's UI/design with no backend, database, or credentials
  running at all. The Scan screen additionally gets a "🛠 Simulate a scan"
  button to preview both the stamp-added and reward-unlocked result states
  without a real QR code.

## Optional integrations (env-gated)

Set these in `.env` to activate the real versions of features that otherwise
run in a dev-friendly fallback mode:

- **`EXPO_PUBLIC_GOOGLE_CLIENT_ID`** — same OAuth Web Client ID as the
  backend's `GOOGLE_CLIENT_ID`. Requires a custom dev client or EAS build;
  Expo Go can't complete the redirect.
- **`EXPO_PUBLIC_FIREBASE_API_KEY` / `_AUTH_DOMAIN` / `_PROJECT_ID` /
  `_APP_ID`** — from your Firebase project's Web app config. Enables real SMS
  phone auth (via `expo-firebase-recaptcha`); the backend needs matching
  `FIREBASE_*` vars set too.
- App icon/splash (`assets/*.png`) are placeholder brand marks — swap in
  real designed assets before submitting to app stores.
- Production push notifications need an EAS project id
  (`app.config.ts` extra.eas.projectId, set up via `eas init`) — without one,
  push registration silently no-ops and the app still works, just without push.

## Getting started

```bash
cp .env.example .env     # point EXPO_PUBLIC_API_BASE_URL at your backend
npm install
npx expo start             # scan the QR with Expo Go, or press i/a for a simulator
```

The backend must be reachable from your phone/simulator — if testing on a
physical device, use your computer's LAN IP instead of `localhost` in
`.env` (e.g. `http://192.168.1.20:4000/v1`).

## Project layout

```
app/                        # Expo Router (file-based routing)
├── (auth)/
│   ├── login.tsx              # name + phone entry, sends OTP
│   └── verify-otp.tsx           # 4-digit OTP entry
├── (tabs)/
│   ├── _layout.tsx                # bottom tab bar
│   ├── home.tsx                     # "My Cards"
│   ├── scan.tsx                       # camera QR scanner (core action)
│   ├── rewards.tsx                      # unlocked/pending rewards
│   └── profile.tsx                        # profile + logout
├── card/[id].tsx              # stamp card detail + history
├── index.tsx                    # loading splash while auth state resolves
└── _layout.tsx                    # AuthProvider + auth-gated redirect

src/
├── api/client.ts               # axios + AsyncStorage token persistence + refresh
├── auth/AuthContext.tsx          # customer auth state
└── components/StampRow.tsx         # ●●●○○-style progress dots
```

Verified with `npx tsc --noEmit` — passes clean.
