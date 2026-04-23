import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../../components/layout/Screen";
import { GymCard } from "../../components/GymCard";
import { exploreFilters } from "../../constants/filters";
import { fonts } from "../../constants/typography";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppContext } from "../../providers/AppProvider";
import { getCrowdState } from "../../services/busyness";
import { colors, shadows } from "../../theme/colors";

export function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { gyms, submissions, backendMode, isRefreshing, lastSyncMessage } = useAppContext();
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<(typeof exploreFilters)[number]>("All");

  const filteredGyms = useMemo(() => {
    return gyms.filter((gym) => {
      const matchesQuery =
        gym.name.toLowerCase().includes(query.toLowerCase()) ||
        gym.city.toLowerCase().includes(query.toLowerCase()) ||
        gym.neighborhood.toLowerCase().includes(query.toLowerCase());

      if (!matchesQuery) {
        return false;
      }
      if (selectedFilter === "Open now") {
        return gym.isOpen;
      }
      if (selectedFilter === "Top rated") {
        return gym.rating >= 4.7;
      }
      if (selectedFilter === "Near me") {
        return gym.distanceMiles <= 2;
      }
      return true;
    });
  }, [gyms, query, selectedFilter]);

  const spotlight = filteredGyms[0] ?? gyms[0];
  const calmGyms = gyms.filter((gym) => gym.liveBusyness < 55).length;

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Live training intelligence</Text>
        <Text style={styles.title}>Pick a gym with better timing, not better luck.</Text>
        <Text style={styles.copy}>
          GymBusy ranks workout options by live crowd conditions, member sentiment, and repeat traffic patterns.
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{gyms.length}</Text>
            <Text style={styles.statLabel}>Gyms live</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{calmGyms}</Text>
            <Text style={styles.statLabel}>Calm nearby</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{submissions.filter((s) => s.status === "pending").length}</Text>
            <Text style={styles.statLabel}>Pending adds</Text>
          </View>
        </View>
      </View>

      <View style={styles.spotlight}>
        <View style={styles.spotlightCopy}>
          <Text style={styles.spotlightLabel}>Best bet now</Text>
          <Text style={styles.spotlightTitle}>{spotlight.name}</Text>
          <Text style={styles.spotlightBody}>
            {spotlight.bestWindow} is the cleanest training window. Current mood: {getCrowdState(spotlight.liveBusyness)}.
          </Text>
        </View>
        <View style={styles.spotlightBadge}>
          <Text style={styles.spotlightBadgeValue}>{spotlight.liveBusyness}%</Text>
          <Text style={styles.spotlightBadgeText}>{getCrowdState(spotlight.liveBusyness)}</Text>
        </View>
      </View>

      <View style={styles.statusBar}>
        <Text style={styles.statusTitle}>{backendMode === "supabase" ? "Live backend connected" : "Seeded preview mode"}</Text>
        <Text style={styles.statusBody}>
          {isRefreshing ? "Refreshing app data..." : lastSyncMessage ?? "No sync message yet."}
        </Text>
      </View>

      <View style={styles.searchCard}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search gyms, neighborhoods, or cities"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {exploreFilters.map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>{filter}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended right now</Text>
        <Text style={styles.sectionMeta}>{filteredGyms.length} matches</Text>
      </View>

      <View style={styles.list}>
        {filteredGyms.map((gym) => (
          <GymCard key={gym.id} gym={gym} selected={gym.id === spotlight.id} onPress={() => navigation.navigate("GymDetail", { gymId: gym.id })} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 28,
    padding: 24,
    gap: 14
  },
  eyebrow: {
    color: colors.highlight,
    fontFamily: fonts.semibold,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  title: {
    color: colors.textOnStrong,
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40
  },
  copy: {
    color: colors.surfaceMuted,
    fontFamily: fonts.body,
    lineHeight: 22
  },
  statsRow: {
    flexDirection: "row",
    gap: 10
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.strongPanel,
    borderRadius: 18,
    padding: 14,
    gap: 4
  },
  statValue: {
    color: colors.textOnStrong,
    fontFamily: fonts.display,
    fontSize: 20
  },
  statLabel: {
    color: colors.surfaceMuted,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  spotlight: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    gap: 14,
    ...shadows.card
  },
  spotlightCopy: {
    flex: 1,
    gap: 4
  },
  spotlightLabel: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  spotlightTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 24
  },
  spotlightBody: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    lineHeight: 21
  },
  spotlightBadge: {
    backgroundColor: colors.calmSoft,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90
  },
  spotlightBadgeValue: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 24
  },
  spotlightBadgeText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    gap: 12,
    ...shadows.card
  },
  statusBar: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 4
  },
  statusTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 15
  },
  statusBody: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    lineHeight: 20
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontFamily: fonts.body
  },
  filterRow: {
    gap: 10,
    paddingRight: 8
  },
  filterChip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  filterChipActive: {
    backgroundColor: colors.highlight
  },
  filterText: {
    color: colors.text,
    fontFamily: fonts.medium
  },
  filterTextActive: {
    color: colors.surfaceStrong
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 22
  },
  sectionMeta: {
    color: colors.textMuted,
    fontFamily: fonts.medium
  },
  list: {
    gap: 14
  }
});
