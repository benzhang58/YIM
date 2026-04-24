import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../../components/layout/Screen";
import { AppButton } from "../../components/ui/AppButton";
import { fonts } from "../../constants/typography";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppContext } from "../../providers/AppProvider";
import { lightTap } from "../../services/feedback";
import { registerForPushNotifications } from "../../services/notifications";
import { colors, shadows } from "../../theme/colors";
import { AuthProvider } from "../../types";

const providerLabels: Record<AuthProvider, string> = {
  apple: "Apple",
  google: "Google",
  email: "Email"
};

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, signIn, signOut, backendMode, refreshData, gyms, reports, submissions, contentReports, isRefreshing, lastSyncMessage } =
    useAppContext();
  const [notificationMessage, setNotificationMessage] = useState("");
  const [authAction, setAuthAction] = useState<AuthProvider | "signout" | null>(null);

  const homeGym = useMemo(() => gyms.find((gym) => gym.id === user?.homeGymId), [gyms, user?.homeGymId]);
  const reviewsCount = useMemo(
    () => gyms.reduce((count, gym) => count + gym.reviews.filter((review) => review.author === user?.name).length, 0),
    [gyms, user?.name]
  );
  const submittedGymsCount = useMemo(
    () => submissions.filter((submission) => submission.submittedBy === user?.name).length,
    [submissions, user?.name]
  );
  const memberStats = [
    { label: "Session reports", value: reports.length.toString() },
    { label: "Reviews", value: reviewsCount.toString() },
    { label: "Gym adds", value: submittedGymsCount.toString() }
  ];

  const handleSignIn = async (provider: AuthProvider) => {
    setAuthAction(provider);
    try {
      await signIn(provider);
    } finally {
      setAuthAction(null);
    }
  };

  const handleSignOut = async () => {
    setAuthAction("signout");
    try {
      await signOut();
    } finally {
      setAuthAction(null);
    }
  };

  const handleNotifications = async () => {
    const result = await registerForPushNotifications();
    setNotificationMessage(result.message);
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Member signal</Text>
          <Text style={styles.title}>{user ? "Your GymBusy profile" : "Join the live gym signal"}</Text>
          <Text style={styles.copy}>
            {user
              ? "Track your contribution quality, manage account controls, and keep live crowd data trustworthy."
              : "Sign in so busyness reports, reviews, and new gym submissions can build reliable local intelligence."}
          </Text>
        </View>
        <View style={styles.trustBadge}>
          <Text style={styles.trustScore}>{user?.trustScore ?? 72}</Text>
          <Text style={styles.trustLabel}>Trust score</Text>
        </View>
      </View>

      {!user ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Choose a sign-in method</Text>
          <Text style={styles.cardBody}>
            Store-ready apps need accountable reports. These buttons are wired for the auth flow and use preview identities until production credentials are connected.
          </Text>
          <View style={styles.stack}>
            <AppButton label="Continue with Apple" loading={authAction === "apple"} disabled={authAction !== null} onPress={() => handleSignIn("apple")} />
            <AppButton label="Continue with Google" loading={authAction === "google"} disabled={authAction !== null} onPress={() => handleSignIn("google")} />
            <AppButton
              label="Continue with Email"
              variant="secondary"
              loading={authAction === "email"}
              disabled={authAction !== null}
              onPress={() => handleSignIn("email")}
            />
          </View>
        </View>
      ) : (
        <View style={styles.memberCard}>
          <View style={styles.identityRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.slice(0, 1)}</Text>
            </View>
            <View style={styles.identityCopy}>
              <Text style={styles.memberName}>{user.name}</Text>
              <Text style={styles.memberMeta}>
                @{user.username ?? "gymbusy-member"} • {providerLabels[user.provider]}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {memberStats.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.homeGymPanel}>
            <Text style={styles.homeGymLabel}>Home gym</Text>
            <Text style={styles.homeGymName}>{homeGym?.name ?? "Pick one from Explore soon"}</Text>
            <Text style={styles.homeGymMeta}>
              {homeGym ? `${homeGym.neighborhood} • ${homeGym.liveBusyness}% live` : "Home gym selection is the next personalization step."}
            </Text>
          </View>

          <AppButton label="Sign out" variant="secondary" loading={authAction === "signout"} disabled={authAction !== null} onPress={handleSignOut} />
        </View>
      )}

      <View style={styles.statusGrid}>
        <View style={styles.statusCard}>
          <Text style={styles.statusKicker}>Backend</Text>
          <Text style={styles.statusTitle}>{backendMode === "supabase" ? "Live sync" : "Preview mode"}</Text>
          <Text style={styles.statusBody}>
            {backendMode === "supabase"
              ? "Supabase is connected for production reads and writes."
              : "Seeded data is active until Supabase environment keys are added."}
          </Text>
          <AppButton label={isRefreshing ? "Refreshing..." : "Refresh Data"} variant="secondary" loading={isRefreshing} onPress={refreshData} />
          {lastSyncMessage ? <Text style={styles.statusLine}>{lastSyncMessage}</Text> : null}
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusKicker}>Safety</Text>
          <Text style={styles.statusTitle}>{contentReports.filter((report) => report.status === "open").length} open reports</Text>
          <Text style={styles.statusBody}>Moderation, rate limits, privacy, and deletion controls are visible before store submission.</Text>
          <AppButton label="Enable Notifications" variant="secondary" onPress={handleNotifications} />
          {notificationMessage ? <Text style={styles.statusLine}>{notificationMessage}</Text> : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account controls</Text>
        <View style={styles.stack}>
          <LinkRow label="Privacy Policy" caption="Data collection and location usage" onPress={() => navigation.navigate("Privacy")} />
          <LinkRow label="Terms of Service" caption="Community rules and moderation rights" onPress={() => navigation.navigate("Terms")} />
          <LinkRow label="Account Deletion" caption="Required for App Store and Play Store review" onPress={() => navigation.navigate("AccountDeletion")} />
        </View>
      </View>
    </Screen>
  );
}

function LinkRow({ label, caption, onPress }: { label: string; caption: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={async () => {
        await lightTap();
        onPress();
      }}
      style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
    >
      <View style={styles.linkCopy}>
        <Text style={styles.linkText}>{label}</Text>
        <Text style={styles.linkCaption}>{caption}</Text>
      </View>
      <Text style={styles.linkArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 30,
    padding: 22,
    gap: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.card
  },
  heroCopy: {
    flex: 1,
    gap: 8
  },
  eyebrow: {
    color: colors.highlight,
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  title: {
    color: colors.textOnStrong,
    fontFamily: fonts.display,
    fontSize: 32
  },
  copy: {
    color: colors.surfaceMuted,
    fontFamily: fonts.body,
    lineHeight: 22
  },
  trustBadge: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.highlight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: colors.strongPanel
  },
  trustScore: {
    color: colors.surfaceStrong,
    fontFamily: fonts.display,
    fontSize: 30
  },
  trustLabel: {
    color: colors.surfaceStrong,
    fontFamily: fonts.semibold,
    fontSize: 11
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  memberCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 22
  },
  cardBody: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    lineHeight: 21
  },
  stack: {
    gap: 10
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.surfaceStrong,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: colors.textOnStrong,
    fontFamily: fonts.display,
    fontSize: 28
  },
  identityCopy: {
    flex: 1
  },
  memberName: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 24
  },
  memberMeta: {
    color: colors.textMuted,
    fontFamily: fonts.medium
  },
  statsRow: {
    flexDirection: "row",
    gap: 10
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    padding: 12,
    gap: 4
  },
  statValue: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 24
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  homeGymPanel: {
    backgroundColor: colors.calmSoft,
    borderRadius: 20,
    padding: 14,
    gap: 3
  },
  homeGymLabel: {
    color: colors.calm,
    fontFamily: fonts.semibold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  homeGymName: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 20
  },
  homeGymMeta: {
    color: colors.textMuted,
    fontFamily: fonts.body
  },
  statusGrid: {
    gap: 12
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  statusKicker: {
    color: colors.highlightStrong,
    fontFamily: fonts.semibold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  statusTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 21
  },
  statusBody: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    lineHeight: 21
  },
  statusLine: {
    color: colors.highlightStrong,
    fontFamily: fonts.medium,
    lineHeight: 21
  },
  linkRow: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  linkRowPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }]
  },
  linkCopy: {
    flex: 1,
    gap: 2
  },
  linkText: {
    color: colors.text,
    fontFamily: fonts.semibold
  },
  linkCaption: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13
  },
  linkArrow: {
    color: colors.highlightStrong,
    fontFamily: fonts.display,
    fontSize: 22
  }
});
