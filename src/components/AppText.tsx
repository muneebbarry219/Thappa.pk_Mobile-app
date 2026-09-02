import { Text as NativeText, TextProps, TextStyle, StyleSheet } from "react-native";
import { fonts } from "../theme";

function fontForWeight(weight: TextStyle["fontWeight"] | undefined) {
  const numericWeight = Number(weight || 400);
  if (numericWeight >= 900) return fonts.black;
  if (numericWeight >= 800) return fonts.extraBold;
  if (numericWeight >= 700) return fonts.bold;
  if (numericWeight >= 600) return fonts.semibold;
  if (numericWeight >= 500) return fonts.medium;
  return fonts.regular;
}

// A drop-in Text replacement that applies Inter to every label, title, and caption.
export function Text({ style, ...props }: TextProps) {
  const flattenedStyle = StyleSheet.flatten(style);
  return <NativeText {...props} style={[style, { fontFamily: fontForWeight(flattenedStyle?.fontWeight) }]} />;
}
