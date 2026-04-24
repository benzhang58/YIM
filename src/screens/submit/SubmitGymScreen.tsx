import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { AppButton } from "../../components/ui/AppButton";
import { fonts } from "../../constants/typography";
import { useAppContext } from "../../providers/AppProvider";
import { successTap, warningTap } from "../../services/feedback";
import { colors } from "../../theme/colors";
import { GymSubmissionForm } from "../../types";

const defaultForm: GymSubmissionForm = {
  name: "",
  address: "",
  city: "",
  neighborhood: "",
  chainName: "",
  notes: ""
};

export function SubmitGymScreen() {
  const { submitGym } = useAppContext();
  const [form, setForm] = useState<GymSubmissionForm>(defaultForm);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "warning">("success");
  const [submitting, setSubmitting] = useState(false);

  const requiredFields = useMemo(
    () => [
      { label: "Name", complete: Boolean(form.name.trim()) },
      { label: "Address", complete: Boolean(form.address.trim()) },
      { label: "City", complete: Boolean(form.city.trim()) },
      { label: "Area", complete: Boolean(form.neighborhood.trim()) }
    ],
    [form.address, form.city, form.name, form.neighborhood]
  );
  const completedRequired = requiredFields.filter((field) => field.complete).length;
  const formReady = completedRequired === requiredFields.length;

  const updateField = (field: keyof GymSubmissionForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formReady) {
      await warningTap();
      setMessageTone("warning");
      setMessage("Add the gym name, address, city, and neighborhood before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitGym(form);
      setMessageTone(result.ok ? "success" : "warning");
      setMessage(result.message);
      await (result.ok ? successTap() : warningTap());
      if (result.ok) {
        setForm(defaultForm);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setForm(defaultForm);
    setMessage("");
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Community listings</Text>
        <Text style={styles.title}>Add a missing gym with confidence.</Text>
        <Text style={styles.copy}>
          Submit the basics first. GymBusy checks for duplicates, then routes the listing into moderation before it affects live recommendations.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.cardTitle}>Listing details</Text>
            <Text style={styles.progressCopy}>{completedRequired} of {requiredFields.length} required fields complete</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>{Math.round((completedRequired / requiredFields.length) * 100)}%</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(completedRequired / requiredFields.length) * 100}%` }]} />
        </View>

        <View style={styles.requirementRow}>
          {requiredFields.map((field) => (
            <View key={field.label} style={[styles.requirementPill, field.complete && styles.requirementPillComplete]}>
              <Text style={[styles.requirementText, field.complete && styles.requirementTextComplete]}>{field.label}</Text>
            </View>
          ))}
        </View>

        <Field label="Gym name" value={form.name} onChangeText={(value) => updateField("name", value)} placeholder="Downtown Barbell Club" />
        <Field label="Address" value={form.address} onChangeText={(value) => updateField("address", value)} placeholder="123 Main Street" />

        <View style={styles.row}>
          <View style={styles.half}>
            <Field label="City" value={form.city} onChangeText={(value) => updateField("city", value)} placeholder="San Francisco" />
          </View>
          <View style={styles.half}>
            <Field label="Neighborhood" value={form.neighborhood} onChangeText={(value) => updateField("neighborhood", value)} placeholder="SoMa" />
          </View>
        </View>

        <Field
          label="Chain name (optional)"
          value={form.chainName}
          onChangeText={(value) => updateField("chainName", value)}
          placeholder="Anytime Fitness"
        />
        <Field
          label="Notes for review"
          value={form.notes}
          onChangeText={(value) => updateField("notes", value)}
          placeholder="New location, good free weights, opened this month"
          multiline
        />

        {message ? (
          <View style={[styles.messageCard, messageTone === "warning" && styles.messageCardWarning]}>
            <Text style={[styles.message, messageTone === "warning" && styles.messageWarning]}>{message}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <AppButton label="Clear" variant="secondary" onPress={handleClear} />
          <AppButton label={submitting ? "Submitting..." : "Submit Gym"} loading={submitting} disabled={submitting} onPress={handleSubmit} />
        </View>
      </View>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused, multiline && styles.notes]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType={multiline ? "default" : "next"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 26,
    padding: 22,
    gap: 8
  },
  eyebrow: {
    color: colors.highlight,
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase"
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
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 22
  },
  progressCopy: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    marginTop: 3
  },
  progressBadge: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  progressBadgeText: {
    color: colors.textOnStrong,
    fontFamily: fonts.bold
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: colors.surfaceAlt
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.calm
  },
  requirementRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  requirementPill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7
  },
  requirementPillComplete: {
    backgroundColor: colors.calmSoft
  },
  requirementText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  requirementTextComplete: {
    color: colors.calm
  },
  row: {
    flexDirection: "row",
    gap: 12
  },
  half: {
    flex: 1
  },
  field: {
    gap: 8
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.semibold
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontFamily: fonts.body,
    borderWidth: 1,
    borderColor: colors.border
  },
  inputFocused: {
    borderColor: colors.highlight,
    backgroundColor: colors.surface
  },
  notes: {
    minHeight: 110,
    textAlignVertical: "top"
  },
  messageCard: {
    backgroundColor: colors.calmSoft,
    borderRadius: 16,
    padding: 13
  },
  messageCardWarning: {
    backgroundColor: colors.busySoft
  },
  message: {
    color: colors.calm,
    fontFamily: fonts.medium,
    lineHeight: 20
  },
  messageWarning: {
    color: colors.highlightStrong
  },
  actions: {
    gap: 10
  }
});
