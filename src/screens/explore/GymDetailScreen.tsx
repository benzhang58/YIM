import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Screen } from "../../components/layout/Screen";
import { BusynessMeter } from "../../components/BusynessMeter";
import { TrendChart } from "../../components/TrendChart";
import { trendTabs } from "../../constants/filters";
import { fonts } from "../../constants/typography";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppContext } from "../../providers/AppProvider";
import { getCrowdConfidence, getCrowdState } from "../../services/busyness";
import { lightTap, successTap, warningTap } from "../../services/feedback";
import { BusynessLevel, ContentReportReason } from "../../types";
import { colors } from "../../theme/colors";

export function GymDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "GymDetail">>();
  const { getGym, submitBusyness, submitReview, reportContent, isGymSaved, toggleSavedGym } = useAppContext();
  const gym = getGym(route.params.gymId);
  const [selectedTrendTab, setSelectedTrendTab] = useState<(typeof trendTabs)[number]>("Week");
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [reportReason, setReportReason] = useState<ContentReportReason>("misleading");
  const [reportNotes, setReportNotes] = useState("");
  const [busyAction, setBusyAction] = useState<"crowd" | "review" | "report" | null>(null);

  const confidence = useMemo(() => (gym ? getCrowdConfidence(gym.crowdReports) : "Building"), [gym]);
  const saved = gym ? isGymSaved(gym.id) : false;

  if (!gym) {
    return (
      <Screen>
        <Text style={styles.emptyTitle}>Gym not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroLabel}>Selected gym</Text>
          <Pressable
            onPress={async () => {
              await toggleSavedGym(gym.id);
              await successTap();
              setFeedbackMessage(saved ? "Removed from saved gyms." : "Saved for quick crowd checks.");
            }}
            style={({ pressed }) => [styles.saveHeroButton, saved && styles.saveHeroButtonActive, pressed && styles.buttonPressed]}
          >
            <Text style={[styles.saveHeroButtonText, saved && styles.saveHeroButtonTextActive]}>{saved ? "Saved" : "Save gym"}</Text>
          </Pressable>
        </View>
        <Text style={styles.heroTitle}>{gym.name}</Text>
        <Text style={styles.heroCopy}>
          {gym.neighborhood}, {gym.city} • {gym.address}
        </Text>
      </View>

      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerLabel}>Today’s call</Text>
          <Text style={styles.bannerTitle}>{getCrowdState(gym.liveBusyness)} training window</Text>
        </View>
        <Text style={styles.bannerTime}>{gym.bestWindow}</Text>
      </View>

      <BusynessMeter value={gym.liveBusyness} reportCount={gym.crowdReports} />

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Current mood</Text>
          <Text style={styles.statValue}>{getCrowdState(gym.liveBusyness)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Crowd confidence</Text>
          <Text style={styles.statValue}>{confidence}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Report live busyness</Text>
      <View style={styles.trustPanel}>
        <Text style={styles.trustTitle}>Signal protection</Text>
        <Text style={styles.trustBody}>
          Crowd reports are rate-limited per gym, and reviews are limited per member window so one account cannot distort the live score.
        </Text>
      </View>
      <View style={styles.voteRow}>
        {[25, 50, 75, 95].map((level) => (
          <Pressable
            key={level}
            disabled={busyAction !== null}
            style={({ pressed }) => [styles.voteButton, pressed && styles.buttonPressed, busyAction !== null && styles.actionDisabled]}
            onPress={async () => {
              setBusyAction("crowd");
              try {
                const result = await submitBusyness(gym.id, level as BusynessLevel);
                await (result.ok ? successTap() : warningTap());
                setFeedbackMessage(result.ok ? "Crowd report submitted." : result.message ?? "Unable to submit crowd report.");
              } finally {
                setBusyAction(null);
              }
            }}
          >
            <Text style={styles.voteValue}>{level}%</Text>
            <Text style={styles.voteLabel}>
              {level <= 25 ? "Light" : level <= 50 ? "Steady" : level <= 75 ? "Busy" : "Packed"}
            </Text>
          </Pressable>
        ))}
      </View>
      {feedbackMessage ? <Text style={styles.feedbackMessage}>{feedbackMessage}</Text> : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Traffic trends</Text>
        <View style={styles.tabRow}>
          {trendTabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setSelectedTrendTab(tab)}
              style={[styles.tabChip, selectedTrendTab === tab && styles.tabChipActive]}
            >
              <Text style={[styles.tabText, selectedTrendTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <TrendChart gym={gym} mode={selectedTrendTab} />

      <Text style={styles.sectionTitle}>Why members like this gym</Text>
      <View style={styles.pillRow}>
        {gym.highlights.map((highlight) => (
          <View key={highlight} style={styles.pill}>
            <Text style={styles.pillText}>{highlight}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recent reviews</Text>
      <View style={styles.reviewComposer}>
        <Text style={styles.reviewComposerTitle}>Add your take</Text>
        <View style={styles.scoreRow}>
          {[1, 2, 3, 4, 5].map((score) => (
            <Pressable
              key={score}
              onPress={async () => {
                await lightTap();
                setReviewScore(score);
              }}
              style={({ pressed }) => [styles.scoreChip, reviewScore === score && styles.scoreChipActive, pressed && styles.buttonPressed]}
            >
              <Text style={[styles.scoreChipText, reviewScore === score && styles.scoreChipTextActive]}>{score}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={styles.reviewInput}
          placeholder="How were the machines, space, cleanliness, and timing?"
          placeholderTextColor={colors.textMuted}
          multiline
          value={reviewBody}
          onChangeText={setReviewBody}
        />
        <Pressable
          disabled={busyAction !== null}
          style={({ pressed }) => [styles.submitReviewButton, pressed && styles.buttonPressed, busyAction !== null && styles.actionDisabled]}
          onPress={async () => {
            if (!reviewBody.trim()) {
              await warningTap();
              setFeedbackMessage("Write a short review before submitting.");
              return;
            }
            setBusyAction("review");
            try {
              const result = await submitReview(gym.id, {
                score: reviewScore,
                body: reviewBody
              });
              await (result.ok ? successTap() : warningTap());
              setFeedbackMessage(result.message);
              if (result.ok) {
                setReviewBody("");
                setReviewScore(5);
              }
            } finally {
              setBusyAction(null);
            }
          }}
        >
          <Text style={styles.submitReviewText}>{busyAction === "review" ? "Submitting..." : "Submit Review"}</Text>
        </Pressable>
      </View>
      <View style={styles.reportCard}>
        <Text style={styles.reportTitle}>Report suspicious content</Text>
        <Text style={styles.reportBody}>
          If busyness reports or reviews look misleading, spammy, or abusive, send them to moderation.
        </Text>
        <View style={styles.scoreRow}>
          {(["misleading", "spam", "harassment"] as const).map((reason) => (
            <Pressable
              key={reason}
              onPress={async () => {
                await lightTap();
                setReportReason(reason);
              }}
              style={({ pressed }) => [styles.scoreChip, reportReason === reason && styles.scoreChipActive, pressed && styles.buttonPressed]}
            >
              <Text style={[styles.scoreChipText, reportReason === reason && styles.scoreChipTextActive]}>{reason}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={styles.reviewInput}
          placeholder="What should the moderation team know?"
          placeholderTextColor={colors.textMuted}
          multiline
          value={reportNotes}
          onChangeText={setReportNotes}
        />
        <Pressable
          disabled={busyAction !== null}
          style={({ pressed }) => [styles.reportButton, pressed && styles.buttonPressed, busyAction !== null && styles.actionDisabled]}
          onPress={async () => {
            const targetReview = gym.reviews[0];
            if (!targetReview) {
              await warningTap();
              setFeedbackMessage("No review is available to report yet.");
              return;
            }
            setBusyAction("report");
            try {
              const result = await reportContent({
                targetType: "review",
                targetId: targetReview.id ?? `${gym.id}-review-seeded`,
                reason: reportReason,
                notes: reportNotes
              });
              await (result.ok ? successTap() : warningTap());
              setFeedbackMessage(result.message);
              if (result.ok) {
                setReportNotes("");
              }
            } finally {
              setBusyAction(null);
            }
          }}
        >
          <Text style={styles.reportButtonText}>{busyAction === "report" ? "Sending..." : "Send to Moderation"}</Text>
        </Pressable>
      </View>
      <View style={styles.reviewList}>
        {gym.reviews.map((review) => (
          <View key={review.id ?? `${review.author}-${review.body}`} style={styles.reviewCard}>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewAuthor}>{review.author}</Text>
              <Text style={styles.reviewScore}>{review.score.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewBody}>{review.body}</Text>
            <Text style={styles.reviewMeta}>Tap report above if this content looks misleading or abusive.</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 26,
    padding: 22,
    gap: 6
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  heroLabel: {
    color: colors.highlight,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  saveHeroButton: {
    backgroundColor: colors.strongPanel,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  saveHeroButtonActive: {
    backgroundColor: colors.highlight
  },
  saveHeroButtonText: {
    color: colors.textOnStrong,
    fontFamily: fonts.semibold,
    fontSize: 12
  },
  saveHeroButtonTextActive: {
    color: colors.surfaceStrong
  },
  heroTitle: {
    color: colors.textOnStrong,
    fontFamily: fonts.display,
    fontSize: 30
  },
  heroCopy: {
    color: colors.surfaceMuted,
    fontFamily: fonts.body
  },
  banner: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  bannerLabel: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    fontSize: 12
  },
  bannerTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 21
  },
  bannerTime: {
    color: colors.highlightStrong,
    fontFamily: fonts.semibold
  },
  statRow: {
    flexDirection: "row",
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 6
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13
  },
  statValue: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 17
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 20
  },
  voteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  trustPanel: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 6
  },
  trustTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 15
  },
  trustBody: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    lineHeight: 20
  },
  voteButton: {
    width: "48%",
    backgroundColor: colors.surfaceStrong,
    borderRadius: 18,
    padding: 14,
    gap: 4
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }]
  },
  actionDisabled: {
    opacity: 0.55
  },
  voteValue: {
    color: colors.textOnStrong,
    fontFamily: fonts.display,
    fontSize: 22
  },
  voteLabel: {
    color: colors.surfaceMuted,
    fontFamily: fonts.medium
  },
  tabRow: {
    flexDirection: "row",
    gap: 8
  },
  tabChip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  tabChipActive: {
    backgroundColor: colors.highlight
  },
  tabText: {
    color: colors.textMuted,
    fontFamily: fonts.medium
  },
  tabTextActive: {
    color: colors.surfaceStrong
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  pill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  pillText: {
    color: colors.text,
    fontFamily: fonts.medium
  },
  reviewList: {
    gap: 12
  },
  reviewComposer: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12
  },
  reportCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12
  },
  reportTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18
  },
  reportBody: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    lineHeight: 20
  },
  reviewComposerTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18
  },
  scoreRow: {
    flexDirection: "row",
    gap: 8
  },
  scoreChip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  scoreChipActive: {
    backgroundColor: colors.highlight
  },
  scoreChipText: {
    color: colors.text,
    fontFamily: fonts.semibold
  },
  scoreChipTextActive: {
    color: colors.surfaceStrong
  },
  reviewInput: {
    minHeight: 100,
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
    fontFamily: fonts.body,
    textAlignVertical: "top"
  },
  submitReviewButton: {
    backgroundColor: colors.highlight,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center"
  },
  submitReviewText: {
    color: colors.surfaceStrong,
    fontFamily: fonts.semibold
  },
  reportButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center"
  },
  reportButtonText: {
    color: colors.highlightStrong,
    fontFamily: fonts.semibold
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 8
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  reviewAuthor: {
    color: colors.text,
    fontFamily: fonts.semibold
  },
  reviewScore: {
    color: colors.highlightStrong,
    fontFamily: fonts.semibold
  },
  reviewBody: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    lineHeight: 20
  },
  reviewMeta: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  feedbackMessage: {
    color: colors.highlightStrong,
    fontFamily: fonts.medium,
    lineHeight: 20
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 28
  }
});
