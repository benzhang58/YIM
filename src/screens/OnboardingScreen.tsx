import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { fonts } from "../constants/typography";
import { AppButton } from "../components/ui/AppButton";
import { colors } from "../theme/colors";

export function OnboardingScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <LinearGradient colors={[colors.surfaceStrong, "#17325A", "#214C6D"]} style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>GymBusy</Text>
        <Text style={styles.title}>The decision engine for when to train.</Text>
        <Text style={styles.body}>
          Live crowd reporting, map-based gym discovery, and timing intelligence built for people who do not want to waste workouts.
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Beat the rush</Text>
          <Text style={styles.featureBody}>Know which gym is actually calm right now, not just historically busy.</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Find better gyms</Text>
          <Text style={styles.featureBody}>Search, compare, and add missing locations with clean moderation flow.</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Trust the signal</Text>
          <Text style={styles.featureBody}>Weighted reports and confidence indicators keep the busyness score credible.</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Store-ready foundations</Text>
          <Text style={styles.featureBody}>Account controls, legal screens, moderation, and release scaffolding are built into this version.</Text>
        </View>
      </View>

      <AppButton label="Enter GymBusy" onPress={onContinue} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 32,
    justifyContent: "space-between",
    gap: 20
  },
  heroCard: {
    gap: 12
  },
  eyebrow: {
    color: colors.highlight,
    fontFamily: fonts.semibold,
    fontSize: 14,
    letterSpacing: 1.3,
    textTransform: "uppercase"
  },
  title: {
    color: colors.textOnStrong,
    fontFamily: fonts.display,
    fontSize: 38,
    lineHeight: 44
  },
  body: {
    color: colors.surfaceMuted,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24
  },
  grid: {
    gap: 12
  },
  featureCard: {
    backgroundColor: "rgba(255, 248, 234, 0.1)",
    borderRadius: 22,
    padding: 18,
    gap: 6
  },
  featureTitle: {
    color: colors.textOnStrong,
    fontFamily: fonts.heading,
    fontSize: 20
  },
  featureBody: {
    color: colors.surfaceMuted,
    fontFamily: fonts.body,
    lineHeight: 22
  }
});
