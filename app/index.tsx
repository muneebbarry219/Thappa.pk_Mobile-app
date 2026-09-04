import { useEffect, useRef } from "react";
import { Animated, Easing, Image, ImageBackground, StyleSheet } from "react-native";

export default function Index() {
  const logoProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(logoProgress, {
      toValue: 1,
      duration: 900,
      delay: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [logoProgress]);

  return (
    <ImageBackground
      source={require("../assets/splash screen bg.png")}
      resizeMode="cover"
      style={styles.background}
    >
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
            ],
          },
        ]}
      >
        <Image source={require("../assets/thappa-logo-transparent.png")} style={styles.logo} resizeMode="contain" />
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    width: "30%",
    maxWidth: 260,
  },
  logo: {
    width: "30%",
    aspectRatio: 1.78,
  },
});
