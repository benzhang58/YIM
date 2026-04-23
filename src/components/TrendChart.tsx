import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { Gym } from "../types";

type Props = {
  gym: Gym;
  mode: "Live" | "Week" | "Month";
};

export function TrendChart({ gym, mode }: Props) {
  const data = mode === "Live" ? gym.liveTrend : mode === "Week" ? gym.weekTrend : gym.monthTrend;

  return (
    <View style={styles.wrapper}>
      <View style={styles.chart}>
        {data.map((item) => (
          <View key={item.label} style={styles.barGroup}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${item.value}%`,
                    backgroundColor:
                      item.value >= 80 ? colors.packed : item.value >= 55 ? colors.busy : colors.calm
                  }
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.caption}>
        {mode === "Live"
          ? "Live trend estimates the next few hours based on current check-ins."
          : mode === "Week"
            ? "Week view aggregates member reports and repeat visit patterns by weekday."
            : "Month view surfaces recurring peaks across billing cycles, classes, and seasonal habits."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10
  },
  chart: {
    height: 220,
    backgroundColor: colors.background,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
    gap: 10
  },
  barTrack: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.border,
    borderRadius: 999,
    justifyContent: "flex-end",
    overflow: "hidden"
  },
  barFill: {
    width: "100%",
    borderRadius: 999,
    minHeight: 18
  },
  barLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  caption: {
    color: colors.textMuted,
    lineHeight: 20
  }
});
