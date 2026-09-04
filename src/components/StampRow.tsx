import { View, StyleSheet } from "react-native";
import { Text } from "./AppText";
import { colors } from "../theme";

export function StampRow({ current, required }: { current: number; required: number }) {
  const dots = Array.from({ length: required }, (_, i) => i < current);

  return (
    <View style={styles.row}>
      {dots.map((filled, i) => (
        <View key={i} style={[styles.dot, filled ? styles.filled : styles.empty]}>
          <Text style={filled ? styles.filledText : styles.emptyText}>{filled ? "✓" : ""}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 7, flexWrap: "wrap" },
  dot: { width: 31, height: 31, borderRadius: 15.5, alignItems: "center", justifyContent: "center" },
  filled: { backgroundColor: colors.yellow },
  empty: { backgroundColor: colors.cream },
  filledText: { color: colors.ink, fontWeight: "900", fontSize: 15 },
  emptyText: { color: "transparent" },
});
