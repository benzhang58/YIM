import { useFonts } from "expo-font";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AppNavigator } from "../navigation/AppNavigator";
import { AppProvider, useAppContext } from "../providers/AppProvider";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { fonts } from "../constants/typography";
import { colors } from "../theme/colors";

function RootGate() {
  const { hydrated, onboardingComplete, completeOnboarding } = useAppContext();

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.highlight} />
        <Text style={styles.loadingText}>Hydrating GymBusy...</Text>
      </View>
    );
  }

  if (!onboardingComplete) {
    return <OnboardingScreen onContinue={completeOnboarding} />;
  }

  return <AppNavigator />;
}

export default function AppShell() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.highlight} />
      </View>
    );
  }

  return (
    <AppProvider>
      <StatusBar style="dark" />
      <RootGate />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    gap: 10
  },
  loadingText: {
    color: colors.text,
    fontFamily: fonts.medium
  }
});
