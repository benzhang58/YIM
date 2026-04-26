import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { fonts } from "../constants/typography";
import { lightTap } from "../services/feedback";
import { colors, shadows } from "../theme/colors";
import { Gym } from "../types";

type Props = {
  gym: Gym;
  selected: boolean;
  saved?: boolean;
  onPress: () => void;
  onToggleSaved?: () => void;
};

export function GymCard({ gym, selected, saved = false, onPress, onToggleSaved }: Props) {
  const stateLabel =
    gym.liveBusyness >= 80 ? "Packed" : gym.liveBusyness >= 55 ? "Steady" : "Smooth";
  const toneColor = gym.liveBusyness >= 80 ? colors.packed : gym.liveBusyness >= 55 ? colors.busy : colors.calm;
  const toneSoft = gym.liveBusyness >= 80 ? colors.packedSoft : gym.liveBusyness >= 55 ? colors.busySoft : colors.calmSoft;

  return (
    <Pressable
      onPress={async () => {
        await lightTap();
        onPress();
      }}
      style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && styles.cardPressed]}
    >
      <View style={styles.row}>
        <View style={styles.copy}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{gym.name}</Text>
            {saved ? (
              <View style={styles.savedMiniPill}>
                <Text style={styles.savedMiniPillText}>Saved</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.meta}>
            {gym.neighborhood} • {gym.distanceMiles.toFixed(1)} mi
          </Text>
        </View>
        <View style={styles.actionColumn}>
          {onToggleSaved ? (
            <Pressable
              onPress={async (event: GestureResponderEvent) => {
                event.stopPropagation();
                await lightTap();
                onToggleSaved();
              }}
              style={({ pressed }) => [styles.saveButton, saved && styles.saveButtonActive, pressed && styles.saveButtonPressed]}
            >
              <Text style={[styles.saveButtonText, saved && styles.saveButtonTextActive]}>{saved ? "Saved" : "Save"}</Text>
            </Pressable>
          ) : null}
          <View style={[styles.busyBadge, { backgroundColor: toneSoft }]}>
            <Text style={styles.busyValue}>{gym.liveBusyness}%</Text>
          </View>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${gym.liveBusyness}%`, backgroundColor: toneColor }]} />
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
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }]
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontFamily: fonts.heading
  },
  savedMiniPill: {
    backgroundColor: colors.calmSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  savedMiniPillText: {
    color: colors.calm,
    fontFamily: fonts.semibold,
    fontSize: 11
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.body
  },
  busyBadge: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  actionColumn: {
    alignItems: "flex-end",
    gap: 8
  },
  saveButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  saveButtonActive: {
    backgroundColor: colors.surfaceStrong
  },
  saveButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }]
  },
  saveButtonText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12
  },
  saveButtonTextActive: {
    color: colors.textOnStrong
  },
  busyValue: {
    color: colors.text,
    fontFamily: fonts.semibold
  },
  track: {
    height: 7,
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: "hidden"
  },
  trackFill: {
    height: "100%",
    borderRadius: 999
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
    fontFamily: fonts.medium
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
    fontFamily: fonts.medium
  },
  window: {
    color: colors.highlightStrong,
    fontSize: 13,
    fontFamily: fonts.semibold
  }
});
