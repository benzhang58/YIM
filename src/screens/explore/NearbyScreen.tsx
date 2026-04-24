import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../../components/layout/Screen";
import { AppButton } from "../../components/ui/AppButton";
import { fonts } from "../../constants/typography";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppContext } from "../../providers/AppProvider";
import { useCurrentLocation } from "../../hooks/useCurrentLocation";
import { lightTap } from "../../services/feedback";
import { calculateDistanceMiles } from "../../services/location";
import { colors, shadows } from "../../theme/colors";

export function NearbyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { gyms } = useAppContext();
  const { coords, requestLocation, loading, error } = useCurrentLocation();

  const sortedGyms = useMemo(() => {
    if (!coords) {
      return gyms;
    }

    return [...gyms].sort((a, b) => {
      const aMiles = calculateDistanceMiles(coords, a.coordinates);
      const bMiles = calculateDistanceMiles(coords, b.coordinates);
      return aMiles - bMiles;
    });
  }, [coords, gyms]);

  const firstGym = sortedGyms[0];
  const region = {
    latitude: coords?.latitude ?? firstGym.coordinates.latitude,
    longitude: coords?.longitude ?? firstGym.coordinates.longitude,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.title}>Map the fastest route to a better workout.</Text>
        <Text style={styles.copy}>
          Use your location to sort gyms by proximity, then combine that with live crowd data before you head out.
        </Text>
        <AppButton label={loading ? "Locating..." : "Use My Location"} loading={loading} disabled={loading} onPress={requestLocation} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.mapCard}>
        <MapView style={styles.map} initialRegion={region} region={region} showsUserLocation={Boolean(coords)}>
          {sortedGyms.map((gym) => (
            <Marker
              key={gym.id}
              coordinate={gym.coordinates}
              title={gym.name}
              description={`${gym.liveBusyness}% busy • ${gym.bestWindow}`}
            />
          ))}
        </MapView>
      </View>

      <Text style={styles.sectionTitle}>Closest gyms</Text>
      <View style={styles.list}>
        {sortedGyms.map((gym) => {
          const distance = coords ? calculateDistanceMiles(coords, gym.coordinates).toFixed(1) : gym.distanceMiles.toFixed(1);

          return (
            <Pressable
              key={gym.id}
              style={({ pressed }) => [styles.gymRow, pressed && styles.gymRowPressed]}
              onPress={async () => {
                await lightTap();
                navigation.navigate("GymDetail", { gymId: gym.id });
              }}
            >
              <View style={styles.gymCopy}>
                <Text style={styles.gymName}>{gym.name}</Text>
                <Text style={styles.gymMeta}>
                  {gym.neighborhood} • {distance} mi away
                </Text>
              </View>
              <View style={[styles.gymBadge, gym.liveBusyness >= 80 ? styles.gymBadgePacked : gym.liveBusyness >= 55 ? styles.gymBadgeBusy : styles.gymBadgeCalm]}>
                <Text style={styles.gymBadgeValue}>{gym.liveBusyness}%</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 26,
    padding: 22,
    gap: 10
  },
  title: {
    color: colors.textOnStrong,
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36
  },
  copy: {
    color: colors.surfaceMuted,
    fontFamily: fonts.body,
    lineHeight: 22
  },
  error: {
    color: colors.highlight,
    fontFamily: fonts.medium
  },
  mapCard: {
    borderRadius: 24,
    overflow: "hidden",
    height: 320,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  map: {
    flex: 1
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 22
  },
  list: {
    gap: 12
  },
  gymRow: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border
  },
  gymRowPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }]
  },
  gymCopy: {
    flex: 1,
    gap: 4
  },
  gymName: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18
  },
  gymMeta: {
    color: colors.textMuted,
    fontFamily: fonts.body
  },
  gymBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  gymBadgeCalm: {
    backgroundColor: colors.calmSoft
  },
  gymBadgeBusy: {
    backgroundColor: colors.busySoft
  },
  gymBadgePacked: {
    backgroundColor: colors.packedSoft
  },
  gymBadgeValue: {
    color: colors.text,
    fontFamily: fonts.semibold
  }
});
