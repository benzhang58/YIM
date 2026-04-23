import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../../components/layout/Screen";
import { AppButton } from "../../components/ui/AppButton";
import { fonts } from "../../constants/typography";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppContext } from "../../providers/AppProvider";
import { registerForPushNotifications } from "../../services/notifications";
import { colors } from "../../theme/colors";

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, signIn, signOut, backendMode, refreshData } = useAppContext();
  const [notificationMessage, setNotificationMessage] = useState("");

  const handleNotifications = async () => {
    const result = await registerForPushNotifications();
    setNotificationMessage(result.message);
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.title}>Account and release readiness</Text>
        <Text style={styles.copy}>
          This screen anchors auth, backend status, and account controls before App Store and Play Store launch.
        </Text>
      </View>

      {!user ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign in preview</Text>
          <Text style={styles.cardBody}>Apple, Google, and email are scaffolded here so live reports can be tied to real users.</Text>
          <View style={styles.stack}>
            <AppButton label="Continue with Apple" onPress={() => signIn("apple")} />
            <AppButton label="Continue with Google" onPress={() => signIn("google")} />
            <AppButton label="Continue with Email" onPress={() => signIn("email")} />
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{user.name}</Text>
          <Text style={styles.cardBody}>Signed in with {user.provider}. This is currently a local preview auth state.</Text>
          <AppButton label="Sign out" variant="secondary" onPress={signOut} />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Backend status</Text>
        <Text style={styles.cardBody}>
          Current data mode: {backendMode === "supabase" ? "Supabase" : "seeded preview"}.
        </Text>
        <Text style={styles.statusLine}>
          Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to enable live backend reads and writes.
        </Text>
        <AppButton label="Refresh Data" variant="secondary" onPress={refreshData} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Launch checklist</Text>
        <Text style={styles.cardBody}>Account auth, notifications, moderation, privacy, and deletion flows all need to exist before store submission.</Text>
        <View style={styles.stack}>
          <AppButton label="Enable Notifications" variant="secondary" onPress={handleNotifications} />
          {notificationMessage ? <Text style={styles.statusLine}>{notificationMessage}</Text> : null}
          <LinkRow label="Privacy Policy" onPress={() => navigation.navigate("Privacy")} />
          <LinkRow label="Terms of Service" onPress={() => navigation.navigate("Terms")} />
          <LinkRow label="Account Deletion" onPress={() => navigation.navigate("AccountDeletion")} />
        </View>
      </View>
    </Screen>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.linkRow}>
      <Text style={styles.linkText}>{label}</Text>
      <Text style={styles.linkArrow}>›</Text>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    gap: 10
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
  statusLine: {
    color: colors.highlightStrong,
    fontFamily: fonts.medium,
    lineHeight: 21
  },
  stack: {
    gap: 10
  },
  linkRow: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  linkText: {
    color: colors.text,
    fontFamily: fonts.semibold
  },
  linkArrow: {
    color: colors.highlightStrong,
    fontFamily: fonts.display,
    fontSize: 20
  }
});
