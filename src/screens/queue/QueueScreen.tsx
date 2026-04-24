import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { fonts } from "../../constants/typography";
import { useAppContext } from "../../providers/AppProvider";
import { colors } from "../../theme/colors";
import { ContentReportStatus, SubmissionStatus } from "../../types";

const filters: Array<SubmissionStatus | "all"> = ["all", "pending", "merged", "approved", "rejected"];
const reportFilters: Array<ContentReportStatus | "all"> = ["all", "open", "resolved", "dismissed"];

export function QueueScreen() {
  const { submissions, gyms, contentReports, updateReportStatus, updateSubmissionStatus } = useAppContext();
  const [queueMode, setQueueMode] = useState<"submissions" | "reports">("submissions");
  const [filter, setFilter] = useState<SubmissionStatus | "all">("pending");
  const [reportFilter, setReportFilter] = useState<ContentReportStatus | "all">("open");
  const items = submissions.filter((item) => filter === "all" || item.status === filter);
  const reportItems = contentReports.filter((item) => reportFilter === "all" || item.status === reportFilter);

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.title}>Moderation operations</Text>
        <Text style={styles.copy}>
          Review duplicate listings and user reports before bad data damages crowd scores or gym pages.
        </Text>
      </View>

      <View style={styles.modeRow}>
        <Pressable
          onPress={() => setQueueMode("submissions")}
          style={[styles.modeButton, queueMode === "submissions" && styles.modeButtonActive]}
        >
          <Text style={[styles.modeText, queueMode === "submissions" && styles.modeTextActive]}>
            Listings ({submissions.filter((submission) => submission.status === "pending").length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setQueueMode("reports")}
          style={[styles.modeButton, queueMode === "reports" && styles.modeButtonActive]}
        >
          <Text style={[styles.modeText, queueMode === "reports" && styles.modeTextActive]}>
            Reports ({contentReports.filter((report) => report.status === "open").length})
          </Text>
        </Pressable>
      </View>

      {queueMode === "submissions" ? (
        <>
      <View style={styles.filterRow}>
        {filters.map((value) => (
          <Pressable key={value} onPress={() => setFilter(value)} style={[styles.filterChip, filter === value && styles.filterChipActive]}>
            <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{value}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.list}>
        {items.map((submission) => {
          const duplicate = submission.duplicateGymId ? gyms.find((gym) => gym.id === submission.duplicateGymId) : undefined;

          return (
            <View key={submission.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.copyBlock}>
                  <Text style={styles.cardTitle}>{submission.name}</Text>
                  <Text style={styles.cardMeta}>
                    {submission.address} • {submission.city}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{submission.status}</Text>
                </View>
              </View>

              <Text style={styles.cardSubMeta}>
                Submitted by {submission.submittedBy} • {submission.createdAt}
              </Text>
              {submission.notes ? <Text style={styles.notes}>{submission.notes}</Text> : null}
              {duplicate ? (
                <View style={styles.duplicateBox}>
                  <Text style={styles.duplicateTitle}>Potential duplicate</Text>
                  <Text style={styles.duplicateBody}>
                    Matched to {duplicate.name} in {duplicate.neighborhood}.
                  </Text>
                </View>
              ) : null}

              <View style={styles.actions}>
                <MiniButton label="Reject" onPress={() => updateSubmissionStatus(submission.id, "rejected")} />
                <MiniButton label="Merge" onPress={() => updateSubmissionStatus(submission.id, "merged")} />
                <MiniButton label="Approve" onPress={() => updateSubmissionStatus(submission.id, "approved")} primary />
              </View>
            </View>
          );
        })}
      </View>
        </>
      ) : (
        <>
          <View style={styles.filterRow}>
            {reportFilters.map((value) => (
              <Pressable
                key={value}
                onPress={() => setReportFilter(value)}
                style={[styles.filterChip, reportFilter === value && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, reportFilter === value && styles.filterTextActive]}>{value}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.list}>
            {reportItems.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>No reports in this queue.</Text>
                <Text style={styles.cardMeta}>Open reports will appear here when members flag suspicious content.</Text>
              </View>
            ) : (
              reportItems.map((report) => (
                <View key={report.id} style={styles.card}>
                  <View style={styles.row}>
                    <View style={styles.copyBlock}>
                      <Text style={styles.cardTitle}>{report.reason}</Text>
                      <Text style={styles.cardMeta}>
                        {report.targetType} • {report.createdAt}
                      </Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{report.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardSubMeta}>Reported by {report.reportedBy}</Text>
                  <Text style={styles.notes}>{report.notes || "No additional notes provided."}</Text>
                  <Text style={styles.cardSubMeta}>Target ID: {report.targetId}</Text>

                  <View style={styles.actions}>
                    <MiniButton label="Dismiss" onPress={() => updateReportStatus(report.id, "dismissed")} />
                    <MiniButton label="Resolve" onPress={() => updateReportStatus(report.id, "resolved")} primary />
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </Screen>
  );
}

function MiniButton({ label, onPress, primary = false }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.actionButton, primary && styles.actionButtonPrimary]}>
      <Text style={[styles.actionButtonText, primary && styles.actionButtonTextPrimary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 26,
    padding: 22,
    gap: 8
  },
  title: {
    color: colors.textOnStrong,
    fontFamily: fonts.display,
    fontSize: 30
  },
  copy: {
    color: colors.surfaceMuted,
    fontFamily: fonts.body,
    lineHeight: 22
  },
  modeRow: {
    flexDirection: "row",
    gap: 10
  },
  modeButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center"
  },
  modeButtonActive: {
    backgroundColor: colors.highlight
  },
  modeText: {
    color: colors.text,
    fontFamily: fonts.semibold
  },
  modeTextActive: {
    color: colors.surfaceStrong
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  filterChip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  filterChipActive: {
    backgroundColor: colors.highlight
  },
  filterText: {
    color: colors.text,
    fontFamily: fonts.medium,
    textTransform: "capitalize"
  },
  filterTextActive: {
    color: colors.surfaceStrong
  },
  list: {
    gap: 12
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    gap: 10
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  copyBlock: {
    flex: 1,
    gap: 4
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18
  },
  cardMeta: {
    color: colors.textMuted,
    fontFamily: fonts.body
  },
  cardSubMeta: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13
  },
  notes: {
    color: colors.text,
    fontFamily: fonts.body,
    lineHeight: 20
  },
  statusBadge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  statusText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    textTransform: "capitalize"
  },
  duplicateBox: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 14,
    gap: 4
  },
  duplicateTitle: {
    color: colors.text,
    fontFamily: fonts.semibold
  },
  duplicateBody: {
    color: colors.textMuted,
    fontFamily: fonts.body
  },
  actions: {
    flexDirection: "row",
    gap: 8
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center"
  },
  actionButtonPrimary: {
    backgroundColor: colors.highlight
  },
  actionButtonText: {
    color: colors.text,
    fontFamily: fonts.semibold
  },
  actionButtonTextPrimary: {
    color: colors.surfaceStrong
  }
});
