import { Pressable, StyleSheet, Text } from "react-native";
import { fonts } from "../../constants/typography";
import { colors } from "../../theme/colors";

export function AppButton({
  label,
  onPress,
  variant = "primary"
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, variant === "primary" ? styles.primary : styles.secondary]}
    >
      <Text style={[styles.text, variant === "primary" ? styles.primaryText : styles.secondaryText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  primary: {
    backgroundColor: colors.highlight
  },
  secondary: {
    backgroundColor: colors.surfaceAlt
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
