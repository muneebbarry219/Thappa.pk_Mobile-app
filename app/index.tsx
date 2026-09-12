import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, ImageBackground, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { Text } from "../src/components/AppText";
import { useAuth } from "../src/auth/AuthContext";
import { useLaunchSplash } from "../src/launch/SplashContext";
import { fonts } from "../src/theme";

export default function Index() {
  const logoProgress = useRef(new Animated.Value(0)).current;
  const transitionProgress = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { height } = useWindowDimensions();
  const { dismissSplash } = useLaunchSplash();
  const { user, loading } = useAuth();
  const shouldShowLanding = !loading && !user;

  useEffect(() => {
    if (loading) return;

    if (user) {
      setIsTransitioning(true);
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) dismissSplash();
      });
      return;
    }

    Animated.timing(logoProgress, {
      toValue: 1,
      duration: 900,
      delay: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [dismissSplash, loading, logoProgress, screenOpacity, user]);

  function handleContinue() {
    if (isTransitioning) return;

    setIsTransitioning(true);
    Animated.timing(transitionProgress, {
      toValue: 1,
      duration: 560,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) dismissSplash();
    });
  }

  return (
    <Pressable
      style={styles.screen}
      onPress={handleContinue}
    disabled={isTransitioning || loading || Boolean(user)}
      accessibilityRole="button"
      accessibilityLabel="Continue to Thappa"
    >
      <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
        <ImageBackground
          source={require("../assets/splash screen bg.png")}
          resizeMode="cover"
          style={styles.background}
        >
          {shouldShowLanding && (
            <Animated.View
              style={[
                styles.logoWrap,
                {
                  opacity: logoProgress,
                  transform: [
                    {
                      scale: logoProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.82, 1],
                      }),
                    },
                    {
                      translateY: logoProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [18, 0],
                      }),
                    },
                    {
                      scale: transitionProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.64],
                      }),
                    },
                    {
                      translateY: transitionProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -height * 0.36],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image source={require("../assets/thappa-logo-transparent.png")} style={styles.logo} resizeMode="contain" />
            </Animated.View>
          )}
          {shouldShowLanding && !isTransitioning && <Text style={styles.continueText}>Press anywhere to continue</Text>}
          {shouldShowLanding && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.formPreview,
                {
                  transform: [
                    {
                      translateY: transitionProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [height * 0.52, 0],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    width: "82%",
    maxWidth: 360,
    aspectRatio: 1672 / 941,
    alignSelf: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  continueText: {
    position: "absolute",
    bottom: 42,
    alignSelf: "center",
    color: "#FFFFFF",
    fontFamily: fonts.semibold,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.4,
    opacity: 0.88,
  },
  formPreview: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    height: "52%",
    backgroundColor: "#F3EEE3",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
});
