import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { AppButton } from "../../components/ui/AppButton";
import { fonts } from "../../constants/typography";
import { colors } from "../../theme/colors";

export function AccountDeletionScreen() {
  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.title}>Account deletion</Text>
        <Text style={styles.body}>
          App Store and Play Store policies require a clear way for users to request deletion of their account and associated personal data.
        </Text>
        <Text style={styles.body}>
          In production, this button should trigger a backend workflow that removes profile data, invalidates sessions, and confirms deletion by email.
        </Text>
        <AppButton label="Deletion Flow Placeholder" variant="secondary" onPress={() => undefined} />
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
