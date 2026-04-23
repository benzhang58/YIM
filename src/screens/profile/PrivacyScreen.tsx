import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { fonts } from "../../constants/typography";
import { colors } from "../../theme/colors";

export function PrivacyScreen() {
  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.body}>
          GymBusy collects account details, crowd reports, reviews, and optional location data to power gym discovery and live busyness scoring.
        </Text>
        <Text style={styles.body}>
          Location is used only to sort nearby gyms and should remain opt-in. Busyness reports and reviews may be stored with account identifiers for abuse prevention and moderation.
        </Text>
        <Text style={styles.body}>
          Before launch, this screen should be replaced with your lawyer-reviewed privacy policy and linked from both App Store and Play Store metadata.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 12
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 30
  },
  body: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    lineHeight: 24
  }
});
