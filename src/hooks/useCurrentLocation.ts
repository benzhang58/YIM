import * as Location from "expo-location";
import { useState } from "react";

export function useCurrentLocation() {
  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [status, setStatus] = useState<Location.PermissionStatus | "idle">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      const permission = await Location.requestForegroundPermissionsAsync();
      setStatus(permission.status);

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setError("Location permission was not granted.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      setCoords(position.coords);
    } catch {
      setError("Unable to fetch your current location.");
    } finally {
      setLoading(false);
    }
  };

  return {
    coords,
    status,
    loading,
    error,
    requestLocation
  };
}
