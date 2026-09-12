import { createContext, useContext } from "react";

type SplashContextValue = {
  dismissSplash: () => void;
};

const SplashContext = createContext<SplashContextValue>({
  dismissSplash: () => undefined,
});

export const SplashProvider = SplashContext.Provider;

export function useLaunchSplash() {
  return useContext(SplashContext);
}
