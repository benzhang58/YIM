import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { fonts } from "../../constants/typography";
import { colors } from "../../theme/colors";

export function TermsScreen() {
  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.body}>
          Members are responsible for the accuracy of their crowd reports, reviews, and submissions. Spam, impersonation, or knowingly false listings should be subject to account restriction.
        </Text>
        <Text style={styles.body}>
          GymBusy should reserve the right to remove user-generated content, merge duplicate gyms, and moderate abusive behavior without notice.
        </Text>
        <Text style={styles.body}>
          Replace this placeholder with a proper legal document before store submission.
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
