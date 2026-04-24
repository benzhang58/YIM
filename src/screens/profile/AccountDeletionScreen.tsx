import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { AppButton } from "../../components/ui/AppButton";
import { fonts } from "../../constants/typography";
import { useAppContext } from "../../providers/AppProvider";
import { successTap, warningTap } from "../../services/feedback";
import { colors } from "../../theme/colors";

export function AccountDeletionScreen() {
  const { user, requestAccountDeletion } = useAppContext();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRequest = async () => {
    if (!user) {
      await warningTap();
      setMessage("Sign in before requesting account deletion.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestAccountDeletion(reason);
      setMessage(result.message);
      await (result.ok ? successTap() : warningTap());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Required store control</Text>
        <Text style={styles.title}>Account deletion</Text>
        <Text style={styles.body}>
          Users need a clear path to request deletion of their account and associated personal data. In production, this request is stored in Supabase for operations to process.
        </Text>

        <View style={styles.identityCard}>
          <Text style={styles.identityLabel}>Current account</Text>
          <Text style={styles.identityValue}>{user ? `${user.name} ${user.email ? `(${user.email})` : ""}` : "Not signed in"}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Optional note</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Tell us what should be removed or why you are leaving."
            placeholderTextColor={colors.textMuted}
            multiline
            style={styles.input}
          />
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <AppButton
          label={submitting ? "Submitting..." : "Request Account Deletion"}
          variant="secondary"
          loading={submitting}
          disabled={submitting}
          onPress={handleRequest}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  eyebrow: {
    color: colors.highlightStrong,
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase"
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
  },
  identityCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    padding: 14,
    gap: 4
  },
  identityLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  identityValue: {
    color: colors.text,
    fontFamily: fonts.semibold
  },
  field: {
    gap: 8
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.semibold
  },
  input: {
    minHeight: 112,
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontFamily: fonts.body,
    padding: 14,
    textAlignVertical: "top"
  },
  message: {
    color: colors.highlightStrong,
    fontFamily: fonts.medium,
    lineHeight: 21
  }
});
