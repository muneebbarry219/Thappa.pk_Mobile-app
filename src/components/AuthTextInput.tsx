import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { fonts } from "../theme";

type AuthTextInputProps = TextInputProps & {
  value: string;
  placeholder: string;
};

export function AuthTextInput({ placeholder, style, value, ...props }: AuthTextInputProps) {
  return (
    <View style={styles.container}>
      <TextInput {...props} value={value} style={[styles.input, style]} placeholder="" accessibilityLabel={placeholder} />
      {!value && (
        <View pointerEvents="none" style={styles.placeholderWrap}>
          <Text style={styles.placeholder}>{placeholder}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "relative" },
  input: { minHeight: 48 },
  placeholderWrap: {
    position: "absolute",
    top: 0,
    right: 14,
    bottom: 0,
    left: 14,
    justifyContent: "center",
  },
  placeholder: {
    color: "rgba(26, 43, 32, 0.38)",
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: "400",
  },
});
