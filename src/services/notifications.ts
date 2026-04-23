import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export async function registerForPushNotifications() {
  if (Platform.OS === "web") {
    return {
      token: null,
      message: "Push notifications are only available in the native app builds."
    };
  }

  const settings = await Notifications.getPermissionsAsync();
  let status = settings.status;

  if (status !== "granted") {
    const request = await Notifications.requestPermissionsAsync();
    status = request.status;
  }

  if (status !== "granted") {
    return {
      token: null,
      message: "Notification permission was not granted."
    };
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return {
    token: token.data,
    message: "Push notifications are configured for this device."
  };
}
