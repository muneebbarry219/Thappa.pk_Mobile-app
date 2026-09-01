import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
};

/**
 * Drives Google's OIDC implicit flow to get a signed ID token, which the
 * caller POSTs to /auth/google for server-side verification (never trust the
 * profile info in the token client-side — the backend re-verifies it).
 *
 * Note: this redirect flow needs a custom dev client or standalone build
 * (`npx expo prebuild` / EAS build) to complete — Expo Go can open the
 * consent screen but can't receive the "thappa://" redirect back.
 */
export function useGoogleIdToken(clientId: string) {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "thappa" });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      redirectUri,
      responseType: AuthSession.ResponseType.IdToken,
      scopes: ["openid", "profile", "email"],
      extraParams: { nonce: Math.random().toString(36).slice(2) },
    },
    discovery
  );

  const idToken = response?.type === "success" ? (response.params.id_token as string | undefined) : undefined;

  return { request, response, idToken, promptAsync };
}
