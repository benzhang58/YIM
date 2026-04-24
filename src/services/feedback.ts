import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export async function lightTap() {
  if (Platform.OS === "web") {
    return;
  }

  await Haptics.selectionAsync();
}

export async function successTap() {
  if (Platform.OS === "web") {
    return;
  }

  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function warningTap() {
  if (Platform.OS === "web") {
    return;
  }

  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}
