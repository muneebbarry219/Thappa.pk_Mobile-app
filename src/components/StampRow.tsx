import { View, Text, StyleSheet } from "react-native";

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
  row: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    marginBottom: 6,
  },
  filled: { backgroundColor: "#fca311" },
  empty: { backgroundColor: "#e5e7eb" },
  filledText: { color: "#14213d", fontWeight: "700" },
  emptyText: { color: "transparent" },
});
