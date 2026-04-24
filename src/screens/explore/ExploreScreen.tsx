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
import { lightTap } from "../../services/feedback";
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
  const packedGyms = gyms.filter((gym) => gym.liveBusyness >= 80).length;
  const hasActiveSearch = Boolean(query.trim()) || selectedFilter !== "All";

  const resetSearch = async () => {
    await lightTap();
    setQuery("");
    setSelectedFilter("All");
  };

  if (gyms.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No gyms have loaded yet.</Text>
          <Text style={styles.emptyBody}>
            Connect Supabase and seed your launch city, or refresh again if you expect gyms to be available already.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <Text style={styles.eyebrow}>Live training intelligence</Text>
          <Text style={styles.todayPill}>{new Date().toLocaleDateString(undefined, { weekday: "short" })}</Text>
        </View>
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

      <View style={styles.dailyBrief}>
        <Text style={styles.dailyTitle}>Right now</Text>
        <Text style={styles.dailyBody}>
          {calmGyms > 0
            ? `${calmGyms} gyms look comfortable. ${packedGyms > 0 ? `${packedGyms} are likely packed.` : "No gyms are showing as packed."}`
            : "Most gyms are busy. Use the trend view before heading out."}
        </Text>
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
        <View style={styles.searchHeader}>
          <Text style={styles.searchTitle}>Find your next session</Text>
          {hasActiveSearch ? (
            <Pressable onPress={resetSearch} style={({ pressed }) => [styles.clearButton, pressed && styles.filterPressed]}>
              <Text style={styles.clearButtonText}>Reset</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.searchInputWrap}>
          <Text style={styles.searchIcon}>Search</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Gym, neighborhood, or city"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {exploreFilters.map((filter) => (
            <Pressable
              key={filter}
              onPress={async () => {
                await lightTap();
                setSelectedFilter(filter);
              }}
              style={({ pressed }) => [
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive,
                pressed && styles.filterPressed
              ]}
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
        {filteredGyms.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardTitle}>No gyms match this search.</Text>
            <Text style={styles.emptyCardBody}>
              Try a broader neighborhood or remove one of the filters. Missing a gym entirely? Add it from the submission tab.
            </Text>
            <Pressable onPress={resetSearch} style={({ pressed }) => [styles.emptyAction, pressed && styles.filterPressed]}>
              <Text style={styles.emptyActionText}>Clear search and filters</Text>
            </Pressable>
          </View>
        ) : (
          filteredGyms.map((gym) => (
            <GymCard key={gym.id} gym={gym} selected={gym.id === spotlight.id} onPress={() => navigation.navigate("GymDetail", { gymId: gym.id })} />
          ))
        )}
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
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  eyebrow: {
    color: colors.highlight,
    fontFamily: fonts.semibold,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  todayPill: {
    color: colors.textOnStrong,
    backgroundColor: colors.strongPanel,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontFamily: fonts.semibold,
    fontSize: 12
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
  dailyBrief: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border
  },
  dailyTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18
  },
  dailyBody: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    lineHeight: 21
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
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  searchTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18
  },
  clearButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  clearButtonText: {
    color: colors.highlightStrong,
    fontFamily: fonts.semibold,
    fontSize: 12
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
  searchInputWrap: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  searchIcon: {
    color: colors.highlightStrong,
    fontFamily: fonts.semibold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.7
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.background,
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
  filterPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }]
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
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    gap: 8
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 28
  },
  emptyBody: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    lineHeight: 22
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  emptyCardTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18
  },
  emptyCardBody: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    lineHeight: 21
  },
  emptyAction: {
    alignSelf: "flex-start",
    backgroundColor: colors.highlight,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  emptyActionText: {
    color: colors.surfaceStrong,
    fontFamily: fonts.semibold
  }
});
