import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  value: number;
  reportCount: number;
};

export function BusynessMeter({ value, reportCount }: Props) {
  const tone =
    value >= 80 ? colors.packed :
    value >= 55 ? colors.busy :
    colors.calm;

  return (
    <View style={styles.wrapper}>
      <View style={styles.copyRow}>
        <View>
          <Text style={styles.label}>Live busyness</Text>
          <Text style={styles.value}>{value}%</Text>
        </View>
        <Text style={styles.meta}>{reportCount} member reports in the last hour</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${value}%`, backgroundColor: tone }]} />
      </View>
      <View style={styles.scale}>
        <Text style={styles.scaleText}>Light</Text>
        <Text style={styles.scaleText}>Steady</Text>
        <Text style={styles.scaleText}>Packed</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    borderRadius: 22,
    padding: 18,
    gap: 12
  },
  copyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-end"
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 2
  },
  value: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800"
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    flex: 1,
    textAlign: "right"
  },
  track: {
    height: 14,
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: "hidden"
  },
  fill: {
    height: "100%",
    borderRadius: 999
  },
  scale: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  scaleText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600"
  }
});
