# Thappa Mobile App (Customer)

React Native + Expo (Expo Router). This is the customer-facing app: sign
in, view stamp cards, scan the QR at checkout, and see rewards.

## What's implemented

- **Auth**: Phone + OTP flow (`(auth)/login.tsx` → `(auth)/verify-otp.tsx`),
  wired to the backend's `/auth/otp/send` and `/auth/otp/verify`. A "Continue
  with Google" button is present but stubbed — see note below.
- **Home (`(tabs)/home.tsx`)**: grid of stamp cards ("My Cards") with a
  visual dot-progress row per card.
- **Scan (`(tabs)/scan.tsx`)**: opens the camera, reads a QR code, and calls
  `/customer/stamps/redeem-qr`. Handles both a raw signed-JWT QR (Mode A,
  what the business's Generate-QR web page renders) and a
  `https://app.thappa.in/scan?b=<branchId>` deep link (Mode B storefront
  QR — GPS wiring is left as a documented next step, see the code comment).
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

## What's intentionally stubbed

- **Google Sign-In** — the button shows an explainer alert. Wire it to
  `@react-native-google-signin/google-signin`, then POST the result to
  `/auth/google` (see backend README for what that endpoint currently
  accepts, and the note there about verifying a real ID token in production).
- **GPS for Mode B** — add `expo-location`, request permission, and pass
  `{ branchId, lat, lng }` to `/customer/stamps/redeem-qr` where the scan
  screen currently shows an explainer alert instead.
- **Push notifications** — add `expo-notifications` to alert customers the
  instant a reward unlocks, per the Technical Guide §12.

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
