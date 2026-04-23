import { ViewStyle } from "react-native";

export const colors = {
  background: "#F3EFE6",
  surface: "#FFFCF6",
  surfaceAlt: "#F0E8DA",
  surfaceStrong: "#10233F",
  surfaceMuted: "#D8E3F0",
  strongPanel: "#17325A",
  text: "#18202A",
  textOnStrong: "#FFF8EA",
  textMuted: "#66707D",
  border: "#E3D8C6",
  borderStrong: "#C8B8A0",
  highlight: "#E58A3A",
  highlightStrong: "#A65319",
  calm: "#2F9C87",
  busy: "#E6B647",
  packed: "#D95B34",
  calmSoft: "#D8F0EA",
  busySoft: "#F7E9BE",
  packedSoft: "#F4D4C7"
} as const;

export const shadows: Record<string, ViewStyle> = {
  card: {
    shadowColor: "#1B1F24",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 4
  }
};
