import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { AppButton } from "../../components/ui/AppButton";
import { fonts } from "../../constants/typography";
import { useAppContext } from "../../providers/AppProvider";
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

  const updateField = (field: keyof GymSubmissionForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim() || !form.neighborhood.trim()) {
      setMessage("Add the gym name, address, city, and neighborhood before submitting.");
      return;
    }

    const result = await submitGym(form);
    setMessage(result.message);
    if (result.ok) {
      setForm(defaultForm);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.title}>Expand the network.</Text>
        <Text style={styles.copy}>
          If a gym is missing, members can submit it. We run duplicate checks first, then route the listing to review.
        </Text>
      </View>

      <View style={styles.card}>
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

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={styles.actions}>
          <AppButton label="Clear" variant="secondary" onPress={() => setForm(defaultForm)} />
          <AppButton label="Submit Gym" onPress={handleSubmit} />
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
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.notes]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
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
    gap: 14
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
    fontFamily: fonts.body
  },
  notes: {
    minHeight: 110,
    textAlignVertical: "top"
  },
  message: {
    color: colors.highlightStrong,
    fontFamily: fonts.medium,
    lineHeight: 20
  },
  actions: {
    gap: 10
  }
});
