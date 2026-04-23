import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, shadows } from "../theme/colors";
import { Gym } from "../types";

type Props = {
  gym: Gym;
  selected: boolean;
  onPress: () => void;
};

export function GymCard({ gym, selected, onPress }: Props) {
  const stateLabel =
    gym.liveBusyness >= 80 ? "Packed" : gym.liveBusyness >= 55 ? "Steady" : "Smooth";

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.name}>{gym.name}</Text>
          <Text style={styles.meta}>
            {gym.neighborhood} • {gym.distanceMiles.toFixed(1)} mi
          </Text>
        </View>
        <View style={[styles.busyBadge, gym.liveBusyness >= 75 ? styles.busyBadgeHigh : styles.busyBadgeLow]}>
          <Text style={styles.busyValue}>{gym.liveBusyness}%</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statPillText}>{gym.isOpen ? "Open now" : "Closed"}</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statPillText}>{stateLabel}</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statPillText}>{gym.rating.toFixed(1)} rating</Text>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.secondary}>Best window</Text>
        <Text style={styles.window}>{gym.bestWindow}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  cardSelected: {
    borderColor: colors.highlight,
    backgroundColor: colors.surfaceAlt,
    transform: [{ scale: 0.99 }]
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16
  },
  copy: {
    flex: 1,
    gap: 4
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14
  },
  busyBadge: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  busyBadgeHigh: {
    backgroundColor: colors.packedSoft
  },
  busyBadgeLow: {
    backgroundColor: colors.calmSoft
  },
  busyValue: {
    color: colors.text,
    fontWeight: "800"
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  statPill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  statPillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700"
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  secondary: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  window: {
    color: colors.highlightStrong,
    fontSize: 13,
    fontWeight: "800"
  }
});
