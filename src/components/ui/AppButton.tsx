import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { fonts } from "../../constants/typography";
import { lightTap } from "../../services/feedback";
import { colors } from "../../theme/colors";

export function AppButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = true
}: {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={async () => {
        await lightTap();
        await onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        fullWidth && styles.fullWidth,
        variant === "primary" ? styles.primary : styles.secondary,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.surfaceStrong : colors.text} />
      ) : (
        <Text style={[styles.text, variant === "primary" ? styles.primaryText : styles.secondaryText]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50
  },
  fullWidth: {
    alignSelf: "stretch"
  },
  primary: {
    backgroundColor: colors.highlight
  },
  secondary: {
    backgroundColor: colors.surfaceAlt
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.86
  },
  disabled: {
    opacity: 0.55
  },
  text: {
    fontFamily: fonts.semibold,
    fontSize: 15
  },
  primaryText: {
    color: colors.surfaceStrong
  },
  secondaryText: {
    color: colors.text
  }
});
