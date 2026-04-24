import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { fonts } from "../constants/typography";
import { ExploreScreen } from "../screens/explore/ExploreScreen";
import { GymDetailScreen } from "../screens/explore/GymDetailScreen";
import { NearbyScreen } from "../screens/explore/NearbyScreen";
import { AccountDeletionScreen } from "../screens/profile/AccountDeletionScreen";
import { PrivacyScreen } from "../screens/profile/PrivacyScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { TermsScreen } from "../screens/profile/TermsScreen";
import { QueueScreen } from "../screens/queue/QueueScreen";
import { SubmitGymScreen } from "../screens/submit/SubmitGymScreen";
import { colors } from "../theme/colors";

export type RootStackParamList = {
  MainTabs: undefined;
  GymDetail: { gymId: string };
  Privacy: undefined;
  Terms: undefined;
  AccountDeletion: undefined;
};

export type MainTabParamList = {
  Explore: undefined;
  Nearby: undefined;
  Submit: undefined;
  Queue: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    primary: colors.highlight,
    border: colors.border
  }
};

function labelForRoute(name: keyof MainTabParamList) {
  switch (name) {
    case "Explore":
      return "Explore";
    case "Nearby":
      return "Map";
    case "Submit":
      return "Add";
    case "Queue":
      return "Queue";
    case "Profile":
      return "Profile";
  }
}

function iconForRoute(name: keyof MainTabParamList) {
  switch (name) {
    case "Explore":
      return "G";
    case "Nearby":
      return "N";
    case "Submit":
      return "+";
    case "Queue":
      return "Q";
    case "Profile":
      return "P";
  }
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 12,
          paddingTop: 10,
          shadowColor: "#1B1F24",
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -10 },
          shadowRadius: 18,
          elevation: 12
        },
        tabBarLabelStyle: {
          fontFamily: fonts.semibold,
          fontSize: 11,
          marginTop: 2
        },
        tabBarActiveTintColor: colors.highlightStrong,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused }) => (
          <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
            <Text style={[styles.tabIconText, focused && styles.tabIconTextActive]}>{iconForRoute(route.name as keyof MainTabParamList)}</Text>
          </View>
        ),
        tabBarLabel: labelForRoute(route.name as keyof MainTabParamList)
      })}
    >
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Nearby" component={NearbyScreen} />
      <Tab.Screen name="Submit" component={SubmitGymScreen} />
      <Tab.Screen name="Queue" component={QueueScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="GymDetail" component={GymDetailScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="AccountDeletion" component={AccountDeletionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 30,
    height: 26,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center"
  },
  tabIconActive: {
    width: 38,
    backgroundColor: colors.highlight
  },
  tabIconText: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 12
  },
  tabIconTextActive: {
    color: colors.surfaceStrong
  }
});
