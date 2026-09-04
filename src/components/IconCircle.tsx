import { Ionicons } from "@expo/vector-icons";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../theme";

type IconName = keyof typeof Ionicons.glyphMap;

interface IconCircleProps {
  name: IconName;
  size?: number;
  iconSize?: number;
  backgroundColor?: string;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
}

/** A consistent, compact two-tone icon treatment for app actions and status. */
export function IconCircle({
  name,
  size = 44,
  iconSize = 20,
  backgroundColor = colors.yellowSoft,
  iconColor = colors.forest,
  style,
}: IconCircleProps) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor }, style]}>
      <Ionicons name={name} size={iconSize} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
});
